import { config } from '../config/env.js';

/**
 * Format genuine WhatsApp click-to-chat URL with complete order details
 */
export function generateWhatsAppOrderUrl(order) {
  const shopNumber = (config.shop.whatsappNumber || '+91 98980 14090').replace(/\D/g, '');

  const itemsList = (order.items || [])
    .map((it, idx) => `  ${idx + 1}. *${it.name}* (${it.packageName || it.packageType}) x ${it.quantity} = ₹${it.total}`)
    .join('\n');

  const addr = order.address || {};
  const formattedAddress = [
    addr.house,
    addr.street,
    addr.landmark,
    addr.city,
    addr.state,
    addr.pincode
  ].filter(Boolean).join(', ');

  const messageText = 
`🍫 *NEW ORDER CONFIRMATION — ZORA SHOP*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* ${order.orderNumber || order.id}
👤 *Customer Name:* ${order.customer?.name || 'Valued Customer'}
📞 *Mobile Number:* ${order.customer?.phone || 'N/A'}
📧 *Email:* ${order.customer?.email || 'N/A'}

🛒 *Chocolates Ordered:*
${itemsList}

💰 *Payment Details:*
• Subtotal: ₹${order.subtotal}
• Delivery: ${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
${order.discount > 0 ? `• Discount: -₹${order.discount}\n` : ''}• *Grand Total:* ₹${order.grandTotal}
• Payment Method: *${order.paymentMethod}*
• Payment Status: *${order.paymentStatus}*

📍 *Delivery Address:*
${formattedAddress}
${addr.instructions ? `• Delivery Note: "${addr.instructions}"` : ''}

⏰ *Order Status:* ${order.orderStatus || 'Order Placed'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Sweetness in Every Bite!"`;

  return `https://wa.me/${shopNumber}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Send Automated WhatsApp Notification using Meta WhatsApp Business Cloud API (if configured)
 */
export async function sendWhatsAppCloudMessage({ recipientPhone, messageText }) {
  if (!process.env.WHATSAPP_CLOUD_API_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return {
      success: false,
      isConfigured: false,
      reason: 'WhatsApp Cloud API credentials (WHATSAPP_CLOUD_API_TOKEN & WHATSAPP_PHONE_NUMBER_ID) not configured in server/.env'
    };
  }

  const cleanPhone = recipientPhone.replace(/\D/g, '');
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_CLOUD_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: messageText }
      })
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

