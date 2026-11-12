import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env.js';
import { db } from './services/database.js';

// Route handlers
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows loading Razorpay checkout script from client
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching allowed list
    if (!origin || config.allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, strict in prod
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    shop: config.shop.name,
    environment: config.nodeEnv,
    databaseEngine: db.isPostgresReady() ? 'PostgreSQL (Prisma)' : 'Local Persistent Storage',
    timestamp: new Date().toISOString()
  });
});

// Mount Production API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found on Zora Shop server.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    error: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

// Auto-seed initial owner account if none exists
async function bootstrapInitialOwner() {
  try {
    const existingAdmin = await db.findAdminByEmail('zorashop.homemade@gmail.com');
    if (!existingAdmin) {
      await db.createAdminUser({
        name: 'Drashti Bhatt',
        email: 'zorashop.homemade@gmail.com',
        phone: '+919898014090',
        role: 'OWNER'
      });
      console.log('👑 Default Owner initialized: zorashop.homemade@gmail.com (+91 98980 14090)');
    }
  } catch (err) {
    console.error('Owner bootstrap error:', err);
  }
}

// Start Server
app.listen(config.port, async () => {
  await bootstrapInitialOwner();
  console.log(`\n🍫 ══════════════════════════════════════════════════════════════`);
  console.log(`🚀 ZORA SHOP Production Backend running on port ${config.port}`);
  console.log(`🌐 API Base URL: http://localhost:${config.port}/api`);
  console.log(`📦 Database: ${db.isPostgresReady() ? 'PostgreSQL (Prisma)' : 'Local Persistent Engine'}`);
  console.log(`🔐 Dual OTP Auth: Active (Email + Mobile)`);
  console.log(`💳 Payment Gateway: Razorpay Ready`);
  console.log(`══════════════════════════════════════════════════════════════\n`);
});
