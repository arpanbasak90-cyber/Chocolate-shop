import Razorpay from 'razorpay';
import { config } from './env.js';

let razorpayInstance = null;

if (config.razorpay.keyId && config.razorpay.keySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret
    });
    console.log('✅ Razorpay Payment Gateway Client initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay Client:', error.message);
  }
} else {
  console.warn('⚠️ Razorpay credentials not configured in server/.env (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET). Real online transactions will prompt owner configuration.');
}

export default razorpayInstance;

