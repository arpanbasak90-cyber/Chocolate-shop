import express from 'express';
import {
  customerLogin,
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

// Customer Auth (Direct Login - No Email Verification Required)
router.post('/customer/login', customerLogin);
router.post('/customer/send-otp', customerLogin);
router.post('/customer/verify-otp', customerLogin);
router.get('/customer/me', requireCustomer, getCustomerMe);
router.post('/customer/logout', customerLogout);

// Admin Auth (Strict Email OTP Verification for Shop Owner)
router.post('/admin/send-otp', otpRateLimiter, sendAdminOtp);
router.post('/admin/verify-otp', verifyOtpRateLimiter, verifyAdminOtp);
router.get('/admin/me', requireAdmin, getAdminMe);
router.post('/admin/logout', adminLogout);

// Initial Owner Setup (Protected by ADMIN_SETUP_SECRET)
router.post('/admin/setup', setupInitialOwner);

export default router;

