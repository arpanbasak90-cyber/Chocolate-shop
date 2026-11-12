import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook
} from '../controllers/paymentController.js';
import { requireCustomer } from '../middleware/auth.js';

const router = express.Router();

router.post('/razorpay/create-order', requireCustomer, createRazorpayOrder);
router.post('/razorpay/verify', requireCustomer, verifyRazorpayPayment);
router.post('/razorpay/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

export default router;
