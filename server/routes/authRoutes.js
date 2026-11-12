import express from 'express';
import {
  sendCustomerOtp,
  verifyCustomerOtp,
  getCustomerMe,
  customerLogout,
  sendAdminOtp,
  verifyAdminOtp,
  getAdminMe,
  adminLogout,
  setupInitialOwner
} from '../controllers/authController.js';
import { requireCustomer, requireAdmin } from '../middleware/auth.js';
import { otpRateLimiter, verifyOtpRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Customer Auth (Dual OTP)
router.post('/customer/send-otp', otpRateLimiter, sendCustomerOtp);
router.post('/customer/verify-otp', verifyOtpRateLimiter, verifyCustomerOtp);
router.get('/customer/me', requireCustomer, getCustomerMe);
router.post('/customer/logout', customerLogout);

// Admin Auth (Dual OTP)
router.post('/admin/send-otp', otpRateLimiter, sendAdminOtp);
router.post('/admin/verify-otp', verifyOtpRateLimiter, verifyAdminOtp);
router.get('/admin/me', requireAdmin, getAdminMe);
router.post('/admin/logout', adminLogout);

// Initial Owner Setup (Protected by ADMIN_SETUP_SECRET)
router.post('/admin/setup', setupInitialOwner);

export default router;
