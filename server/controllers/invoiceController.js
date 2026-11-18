/**
 * ZORA SHOP — Production Invoice Controller
 *
 * Secure access control for invoice metadata and PDF downloads.
 * Strictly enforces dual-role authorization:
 * - Owner/Admin can view any invoice.
 * - Authenticated Customer can ONLY view invoices belonging to their own account.
 * - Unauthenticated requests receive HTTP 401.
 * - Cross-customer access attempts receive HTTP 403.
 * - Non-delivered orders without invoices receive HTTP 404.
 */

import { getInvoiceByOrderId } from '../services/invoiceService.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import { db } from '../services/database.js';

/**
 * GET /api/orders/:orderId/invoice
 * Retrieve invoice JSON for a delivered order.
 */
export async function getOrderInvoice(req, res) {
  try {
    const { orderId } = req.params;
    if (!orderId || !orderId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier is required.'
      });
    }

    // 1. Fetch the invoice record associated with the order ID or order number
    const invoice = db.getInvoiceByOrderId ? await db.getInvoiceByOrderId(orderId.trim()) : await getInvoiceByOrderId(orderId.trim());

    if (!invoice) {
      // Check if order exists in database
      const order = await db.getOrderByIdOrNumber(orderId.trim());
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found with the provided identifier.'
        });
      }

      // Authorization guard before revealing non-delivered order status:
      // Requester MUST be an authenticated owner OR the customer who placed the order.
      const isOwner = Boolean(req.admin);
      const isOrderCustomer = Boolean(req.customer && req.customer.id === order.customerId);

      if (!isOwner && !isOrderCustomer) {
        // Prevent IDOR: Unauthorized users receive a generic 404 without learning order existence or status
        return res.status(404).json({
          success: false,
          message: 'Order not found with the provided identifier.'
        });
      }

      // If authorized, provide the helpful informative message with fulfillment status
      return res.status(404).json({
        success: false,
        message: `Invoice not available. Invoices are generated automatically only after an order is Delivered (Current status: "${order.orderStatus}").`
      });
    }

    // 2. Strict Authorization Check
    // A. Shopkeeper / Owner has complete access to all shop invoices
    if (req.admin) {
      return res.status(200).json({
        success: true,
        invoice
      });
    }

    // B. Customer must only access invoices matching their own customerId
    if (req.customer) {
      if (invoice.customerId === req.customer.id) {
        return res.status(200).json({
          success: true,
          invoice
        });
      }

      // Security Violation: Log unauthorized cross-customer access attempt
      console.warn(`⚠️ Unauthorized invoice access attempt: Customer ${req.customer.id} attempted to access invoice for customer ${invoice.customerId} (Order: ${orderId})`);
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this invoice.'
      });
    }

    // C. Fallback for unauthenticated access
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to view this invoice.'
    });
  } catch (error) {
    console.error('Error in getOrderInvoice:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve invoice.'
    });
  }
}

/**
 * GET /api/orders/:orderId/invoice/pdf
 * Generate and download professional PDF invoice for a delivered order.
 *
 * Supports inline viewing and attachment download:
 * - Default: inline viewing in browser PDF viewer
 * - ?download=1: attachment download with sanitized filename
 */
export async function downloadInvoicePdf(req, res) {
  try {
    const { orderId } = req.params;
    if (!orderId || !orderId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Order identifier is required.'
      });
    }

    // 1. Fetch invoice to ensure it exists and order is delivered
    const invoice = db.getInvoiceByOrderId ? await db.getInvoiceByOrderId(orderId.trim()) : await getInvoiceByOrderId(orderId.trim());
    if (!invoice) {
      const order = await db.getOrderByIdOrNumber(orderId.trim());
      const isOwner = Boolean(req.admin);
      const isOrderCustomer = Boolean(order && req.customer && req.customer.id === order.customerId);

      if (!order || (!isOwner && !isOrderCustomer)) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found with the provided identifier.'
        });
      }

      return res.status(404).json({
        success: false,
        message: `Invoice not found. Invoices are generated only after an order is Delivered (Current status: "${order.orderStatus}").`
      });
    }

    // 2. Strict Dual-Role Authorization Check
    if (req.admin) {
      // Authorized Shopkeeper / Owner
    } else if (req.customer) {
      if (invoice.customerId !== req.customer.id) {
        console.warn(`⚠️ Unauthorized invoice PDF download attempt: Customer ${req.customer.id} attempted to access invoice for customer ${invoice.customerId} (Order: ${orderId})`);
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to download this invoice.'
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to download this invoice.'
      });
    }

    // 3. Generate In-Memory PDF Document
    const pdfBuffer = await generateInvoicePdf(invoice);

    // 4. Set Headers for Safe Delivery
    const safeInvoiceNum = String(invoice.invoiceNumber || 'INVOICE').replace(/[^a-zA-Z0-9_-]/g, '_');
    const isAttachment = req.query?.download === '1';
    const disposition = isAttachment ? 'attachment' : 'inline';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="ZORA-${safeInvoiceNum}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error in downloadInvoicePdf:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate invoice PDF. Please try again later.'
    });
  }
}
