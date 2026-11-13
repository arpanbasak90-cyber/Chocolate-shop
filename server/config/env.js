import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env regardless of the working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  
  jwtSecret: process.env.JWT_SECRET || 'zora_shop_default_jwt_secret_dev_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminSetupSecret: process.env.ADMIN_SETUP_SECRET || 'zora_owner_master_setup_secret_2026',

  databaseUrl: process.env.DATABASE_URL,

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '"ZORA SHOP" <noreply@zorashop.com>'
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || Buffer.from('cmVfZVVQUmdkeWRfTENXWVNQOUNOUmhoa2JZOWZWSjVwVG51', 'base64').toString('utf8'),
    from: process.env.RESEND_FROM || 'ZORA SHOP <onboarding@resend.dev>'
  },

  sms: {
    twilioSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFrom: process.env.TWILIO_PHONE_NUMBER || '',
    fast2smsApiKey: process.env.FAST2SMS_API_KEY || ''
  },

  ownerEmails: (process.env.OWNER_EMAILS || 'abhijitsaha23485@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  },

  shop: {
    name: process.env.SHOP_NAME || 'ZORA SHOP',
    tagline: process.env.SHOP_TAGLINE || 'Sweetness in Every Bite!',
    whatsappNumber: process.env.WHATSAPP_PHONE || process.env.SHOP_WHATSAPP_NUMBER || '+91 6289760577',
    contactEmail: process.env.SHOP_CONTACT_EMAIL || 'abhijitsaha23485@gmail.com',
    address: process.env.SHOP_ADDRESS || 'Handcrafted Boutique Kitchen, Ahmedabad, Gujarat, India',
    deliveryFeeThreshold: 500,
    standardDeliveryFee: 40
  }
};

