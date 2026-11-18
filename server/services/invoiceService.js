/**
 * ZORA SHOP — Production Invoice Generation Service
 *
 * Generates immutable, legally sound invoices for delivered orders.
 * Supports transactional execution, idempotent regeneration, and P2002 conflict resolution.
 */

import { config } from '../config/env.js';
import { getPrismaClient } from './database.js';

/**
 * Generate a readable, unique invoice number based on order details
 * Example: INV-2026-617822
 */
export function generateInvoiceNumber(order) {
  const year = new Date().getFullYear();

  // 1. Prefer standard orderNumber (e.g. ZORA-829104 -> 829104)
  const orderNumberStr = typeof order?.orderNumber === 'string' ? order.orderNumber : '';
  const cleanOrderNumber = orderNumberStr
    .replace(/^ZORA-?/i, '')
    .replace(/[^a-zA-Z0-9]/g, '');

  if (cleanOrderNumber) {
    return `INV-${year}-${cleanOrderNumber}`;
  }

  // 2. Deterministic fallback based on order UUID (never uses Math.random)
  const idStr = typeof order?.id === 'string' ? order.id : '';
  const cleanId = idStr.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();

  if (cleanId) {
    return `INV-${year}-${cleanId}`;
  }

  // 3. Absolute fallback guarantee (never produces empty identifier)
  return `INV-${year}-GEN${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Create or retrieve an invoice for a given order inside a Prisma client or transaction
 *
 * @param {string} orderId - ID or orderNumber of the order
 * @param {object} [tx] - Prisma interactive transaction client (or standard Prisma client)
 * @returns {Promise<object>} - The created or existing Invoice record
 */
export async function createInvoiceForOrder(orderId, tx = null) {
  const client = tx || await getPrismaClient();
  if (!client) {
    throw new Error('Database Error: Cannot generate invoice. Prisma client is unavailable.');
  }

  // 1. Resolve order with all related entities
  const order = await client.order.findFirst({
    where: {
      OR: [
        { id: orderId },
        { orderNumber: orderId }
      ]
    },
    include: {
      customer: true,
      address: true,
      items: true,
      invoice: true
    }
  });

  if (!order) {
    throw new Error(`Order not found for identifier: ${orderId}`);
  }

  // 2. Check if an invoice already exists for this order (Idempotency check)
  if (order.invoice) {
    return order.invoice;
  }

  const existingInvoice = await client.invoice.findUnique({
    where: { orderId: order.id }
  });
  if (existingInvoice) {
    return existingInvoice;
  }

  // 3. Fetch latest StoreSettings snapshot or fallback to config.shop
  let storeSettings = null;
  try {
    storeSettings = await client.storeSettings.findUnique({ where: { id: 'default' } });
  } catch (err) {
    // Non-fatal, fallback to default configuration
  }

  const shopSnapshot = {
    name: storeSettings?.shopName || config.shop?.name || 'ZORA SHOP',
    tagline: storeSettings?.tagline || config.shop?.tagline || 'Sweetness in Every Bite!',
    whatsappNumber: storeSettings?.whatsappNumber || config.shop?.whatsappNumber || '+91 6289760577',
    contactEmail: storeSettings?.contactEmail || config.shop?.contactEmail || 'zorashop.homemade@gmail.com',
    address: storeSettings?.shopAddress || config.shop?.address || 'Handcrafted Boutique Kitchen, Ahmedabad, Gujarat, India'
  };

  // 4. Construct immutable Customer & Delivery Address snapshot
  const customerSnapshot = {
    id: order.customer?.id || order.customerId,
    name: order.customer?.name || 'Valued Customer',
    email: order.customer?.email || '',
    phone: order.customer?.phone || ''
  };

  const addressSnapshot = order.address ? {
    house: order.address.house || '',
    street: order.address.street || '',
    landmark: order.address.landmark || null,
    city: order.address.city || '',
    state: order.address.state || '',
    pincode: order.address.pincode || '',
    instructions: order.address.instructions || null
  } : null;

  // 5. Construct immutable itemized product snapshot with order-time prices & quantities
  const itemsSnapshot = (order.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    packageType: item.packageType,
    packageName: item.packageName,
    price: Number(item.price),
    quantity: Number(item.quantity),
    total: Number(item.total),
    image: item.image || null
  }));

  // 6. Financial breakdown snapshot
  const financialsSnapshot = {
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee || 0),
    discount: Number(order.discount || 0),
    grandTotal: Number(order.grandTotal)
  };

  // 7. Payment snapshot (Strictly preserves actual recorded status; COD is NEVER auto-marked PAID)
  const paymentSnapshot = {
    method: order.paymentMethod,
    status: order.paymentStatus
  };

  const now = new Date();
  const invoiceNumber = generateInvoiceNumber(order);

  // 8. Complete immutable structured snapshot
  const snapshot = {
    invoiceNumber,
    shop: shopSnapshot,
    customer: customerSnapshot,
    deliveryAddress: addressSnapshot,
    items: itemsSnapshot,
    financials: financialsSnapshot,
    payment: paymentSnapshot,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      notes: order.notes || null,
      createdAt: order.createdAt
    },
    dates: {
      orderedAt: order.createdAt,
      deliveredAt: now,
      issuedAt: now
    }
  };

  // 9. Persist invoice with P2002 conflict handling
  try {
    const invoice = await client.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerId: order.customerId,
        deliveryDate: now,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee || 0,
        discount: order.discount || 0,
        grandTotal: order.grandTotal,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        snapshot
      }
    });

    return invoice;
  } catch (createErr) {
    // Handle Prisma P2002 Unique Constraint Conflict (e.g. concurrent creation requests)
    if (createErr.code === 'P2002') {
      const existing = await client.invoice.findUnique({
        where: { orderId: order.id }
      });
      if (existing) {
        return existing;
      }
    }
    throw createErr;
  }
}

/**
 * Retrieve invoice by Order ID or Order Number
 *
 * @param {string} orderId - ID or orderNumber of the order
 * @param {object} [txOrClient] - Optional Prisma client or transaction
 * @returns {Promise<object|null>}
 */
export async function getInvoiceByOrderId(orderId, txOrClient = null) {
  const client = txOrClient || await getPrismaClient();
  if (!client) return null;

  // Search by direct orderId or through related Order's orderNumber
  const invoice = await client.invoice.findFirst({
    where: {
      OR: [
        { orderId: orderId },
        { order: { orderNumber: orderId } }
      ]
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true
        }
      }
    }
  });

  return invoice;
}

/**
 * Retrieve invoice by unique invoice number
 *
 * @param {string} invoiceNumber - e.g. INV-2026-617822
 * @param {object} [txOrClient] - Optional Prisma client or transaction
 * @returns {Promise<object|null>}
 */
export async function getInvoiceByNumber(invoiceNumber, txOrClient = null) {
  const client = txOrClient || await getPrismaClient();
  if (!client) return null;

  const invoice = await client.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true
        }
      }
    }
  });

  return invoice;
}
