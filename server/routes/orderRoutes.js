import express from 'express';
import {
  createCheckoutOrder,
  getCustomerOrders,
  trackOrder,
  adminUpdateOrderStatus
} from '../controllers/orderController.js';
import { getOrderInvoice, downloadInvoicePdf } from '../controllers/invoiceController.js';
import { requireCustomer, requireAdmin, authenticateUser } from '../middleware/auth.js';
import { checkoutRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Customer checkout and tracking
router.post('/checkout', requireCustomer, checkoutRateLimiter, createCheckoutOrder);
router.get('/my-orders', requireCustomer, getCustomerOrders);
router.get('/track/:orderIdentifier', trackOrder);

// Admin order status update
router.patch('/admin/:orderId/status', requireAdmin, adminUpdateOrderStatus);

// Invoice retrieval endpoints (Dual-role: Owner all, Customer own order only)
router.get('/:orderId/invoice', authenticateUser, getOrderInvoice);
router.get('/:orderId/invoice/pdf', authenticateUser, downloadInvoicePdf);

export default router;

