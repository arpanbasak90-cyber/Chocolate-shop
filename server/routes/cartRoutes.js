import express from 'express';
import { verifyCartEndpoint } from '../controllers/cartController.js';

const router = express.Router();

router.post('/verify', verifyCartEndpoint);

export default router;

