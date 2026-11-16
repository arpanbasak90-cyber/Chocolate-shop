import { db, mapOrderStatus } from '../services/database.js';
import { calculateVerifiedCart } from './cartController.js';
import { generateWhatsAppOrderUrl } from '../services/whatsappService.js';
import razorpayInstance from '../config/razorpay.js';
import { config } from '../config/env.js';

/**
 * 1. Checkout & Create Order (Server-Side Recalculated & Database Committed)
 */
export async function createCheckoutOrder(req, res) {
  try {
    const customer = req.customer;
    const { items, address, paymentMethod, promoCode, notes } = req.body;

    // Validate Address fields
    if (!address || !address.house || !address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address (House/Flat, Street, City, State, PIN Code) is required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    const validMethods = ['COD', 'RAZORPAY', 'UPI'];
    const chosenMethod = validMethods.includes(paymentMethod) ? paymentMethod : 'COD';

    // Strictly recalculate totals from database products
    const verified = await calculateVerifiedCart(items, promoCode);

    // Prevent accidental duplicate submissions within 30 seconds
    const duplicate = await db.findRecentDuplicateOrder({
      customerId: customer.id,
      grandTotal: verified.grandTotal,
      withinSeconds: 30
    });
    if (duplicate) {
      console.log(`⚠️ Prevented duplicate order submission for customer ${customer.email} (Order: ${duplicate.orderNumber})`);
      return res.status(200).json({
        success: true,
        message: 'Order already received and queued for small-batch preparation.',
        order: duplicate,
        whatsappUrl: generateWhatsAppOrderUrl(duplicate),
        isDuplicate: true
      });
    }

    // Initial payment status
    const initialPaymentStatus = chosenMethod === 'COD' ? 'Pending (Cash on Delivery)' : 'Pending Online Payment';

    // Save order in persistent database
    const order = await db.createOrder({
      customerId: customer.id,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      address: {
        house: address.house.trim(),
        street: address.street.trim(),
        landmark: (address.landmark || '').trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        instructions: (address.instructions || '').trim()
      },
      items: verified.verifiedItems,
      subtotal: verified.subtotal,
      deliveryFee: verified.deliveryFee,
      discount: verified.discount,
      grandTotal: verified.grandTotal,
      paymentMethod: chosenMethod,
      paymentStatus: initialPaymentStatus,
      notes: notes || ''
    });

    // Generate genuine WhatsApp order message link
    const whatsappUrl = generateWhatsAppOrderUrl(order);

    // If online payment (Razorpay / UPI), prepare gateway order
    let razorpayPayload = null;
    if (chosenMethod === 'RAZORPAY' || chosenMethod === 'UPI') {
      if (razorpayInstance) {
        try {
          const rzpOrder = await razorpayInstance.orders.create({
            amount: Math.round(verified.grandTotal * 100), // paise
            currency: 'INR',
            receipt: `rcpt_${order.orderNumber}`,
            notes: { orderId: order.id, orderNumber: order.orderNumber }
          });
          razorpayPayload = {
            isAvailable: true,
            keyId: config.razorpay.keyId,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone
          };
        } catch (rzpErr) {
          console.warn('Razorpay order creation fallback:', rzpErr.message);
        }
      }
    }

    console.log(`📦 Genuine Order placed: ${order.orderNumber} by ${customer.name} (₹${verified.grandTotal}, ${chosenMethod})`);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully in database.',
      order,
      whatsappUrl,
      razorpayPayload
    });
  } catch (error) {
    console.error('Error in createCheckoutOrder:', error);
    return res.status(400).json({ success: false, message: error.message || 'Checkout failed.' });
  }
}

/**
 * 2. Get Authenticated Customer's Order History
 */
export async function getCustomerOrders(req, res) {
  try {
    const orders = await db.getOrdersByCustomerId(req.customer.id);
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error in getCustomerOrders:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order history.' });
  }
}

/**
 * 3. Track Order by Order ID or Order Number
 */
export async function trackOrder(req, res) {
  try {
    const { orderIdentifier } = req.params;
    const order = await db.getOrderByIdOrNumber(orderIdentifier);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with the provided ID or number.' });
    }

    const whatsappUrl = generateWhatsAppOrderUrl(order);

    return res.status(200).json({ success: true, order, whatsappUrl });
  } catch (error) {
    console.error('Error in trackOrder:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order status.' });
  }
}

/**
 * 4. ADMIN: Update Order Status (Order Placed -> Confirmed -> Preparing -> Out for Delivery -> Delivered -> Cancelled)
 */
export async function adminUpdateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const mappedStatus = mapOrderStatus(status);
    const validStatuses = ['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(mappedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status "${status}". Allowed: ${validStatuses.join(', ')}`
      });
    }

    const updated = await db.updateOrderStatus(orderId, mappedStatus, notes, 'OWNER');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found in database.' });
    }

    console.log(`🚚 Order status updated: ${updated.orderNumber || updated.id} -> ${mappedStatus}`);
    return res.status(200).json({ success: true, message: `Order status updated to "${mappedStatus}".`, order: updated });
  } catch (error) {
    console.error('Error in adminUpdateOrderStatus:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update order status.' });
  }
}

