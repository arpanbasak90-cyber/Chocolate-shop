import express from 'express';
import {
  getDashboardStats,
  getAdminOrders,
  getAdminCustomers,
  getRevenueAnalytics,
  getStoreSettings,
  updateStoreSettings
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin dashboard endpoints strictly require owner authentication
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAdminOrders);
router.get('/customers', getAdminCustomers);
router.get('/revenue', getRevenueAnalytics);
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);

export default router;

