import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import { config } from '../config/env.js';
import { db } from '../services/database.js';

/**
 * 1. Create Razorpay Payment Order
 */
export async function createRazorpayOrder(req, res) {
  try {
    const { orderId, amountInInr } = req.body;

    if (!orderId || !amountInInr) {
      return res.status(400).json({ success: false, message: 'Order ID and amount are required.' });
    }

    if (!razorpayInstance) {
      return res.status(503).json({
        success: false,
        isConfigured: false,
        message: 'Razorpay keys not configured on server. Please add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET to server/.env'
      });
    }

    // Razorpay requires amount in subunits (paise for INR -> ₹1 = 100 paise)
    const amountInPaise = Math.round(Number(amountInInr) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${orderId.slice(-10)}`,
      notes: {
        orderId,
        shop: 'Zora Shop Homemade Chocolates'
      }
    };

    const rzpOrder = await razorpayInstance.orders.create(options);

    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: config.razorpay.keyId
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment initiation failed.' });
  }
}

/**
 * 2. Verify Razorpay Payment Signature
 * Server-side HMAC-SHA256 signature verification ensures payments cannot be spoofed!
 */
export async function verifyRazorpayPayment(req, res) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Incomplete payment response parameters.' });
    }

    if (!config.razorpay.keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay Key Secret is missing in server environment.'
      });
    }

    // Generate expected signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn(`⚠️ Razorpay signature mismatch for order ${orderId}`);
      await db.recordPayment({
        orderId,
        gatewayOrderId: razorpay_order_id,
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        status: 'FAILED',
        rawData: { error: 'Signature mismatch' }
      });
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Transaction unverified.' });
    }

    // Verified! Record successful payment and mark order Confirmed
    const payment = await db.recordPayment({
      orderId,
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      status: 'SUCCESS',
      rawData: req.body
    });

    console.log(`✅ Genuine Razorpay payment confirmed for order ${orderId} (Payment ID: ${razorpay_payment_id})`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully by server.',
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
}

/**
 * 3. Authenticated Razorpay Webhook Handler
 */
export async function handleRazorpayWebhook(req, res) {
  try {
    const webhookSecret = config.razorpay.webhookSecret;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        console.warn('⚠️ Invalid Razorpay webhook signature');
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.notes?.orderId;
      if (orderId) {
        await db.recordPayment({
          orderId,
          gatewayOrderId: paymentEntity.order_id,
          gatewayPaymentId: paymentEntity.id,
          amount: paymentEntity.amount / 100,
          status: 'SUCCESS',
          rawData: req.body
        });
        console.log(`🔔 Webhook: Payment captured for order ${orderId}`);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ status: 'error' });
  }
}

