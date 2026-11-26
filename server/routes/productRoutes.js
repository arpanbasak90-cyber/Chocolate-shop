import express from 'express';
import {
  getAllProducts,
  getProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminToggleStock,
  adminDeleteProduct,
  adminUploadProductImage
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:idOrSlug', getProduct);

// Protected Admin routes
router.post('/admin/upload-image', requireAdmin, adminUploadProductImage);
router.post('/admin', requireAdmin, adminCreateProduct);
router.put('/admin/:id', requireAdmin, adminUpdateProduct);
router.patch('/admin/:id/toggle-stock', requireAdmin, adminToggleStock);
router.delete('/admin/:id', requireAdmin, adminDeleteProduct);

export default router;

