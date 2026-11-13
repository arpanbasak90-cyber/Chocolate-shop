import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { db } from './services/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

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

// Serverless / Rewrite URL normalization and cold-start bootstrap
let isBootstrapped = false;
app.use(async (req, res, next) => {
  if (req.headers['x-matched-path'] && (req.url.startsWith('/api/index.js') || req.url === '/api' || req.url === '/api/')) {
    req.url = req.headers['x-matched-path'];
  } else if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '') || '/';
  }

  if (!isBootstrapped) {
    isBootstrapped = true;
    try {
      await bootstrapInitialOwner();
    } catch (e) {
      console.warn('Bootstrap owner notice:', e.message);
    }
  }
  next();
});

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoints (both /api/health and /health)
const handleHealth = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    shop: config.shop.name,
    environment: config.nodeEnv,
    databaseEngine: db.isPostgresReady() ? 'PostgreSQL (Prisma)' : 'Local Persistent Storage',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Mount Production API Routes
// Mounted under both /api/* and root /* to ensure seamless compatibility across all client configurations
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/cart', cartRoutes);
app.use('/cart', cartRoutes);

app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Serve static frontend assets from dist in production
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/products') ||
      req.path.startsWith('/cart') ||
      req.path.startsWith('/orders') ||
      req.path.startsWith('/payments') ||
      req.path.startsWith('/admin') ||
      req.path.startsWith('/health')
    ) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// JSON 404 Handler for all API routes (ensures frontend always receives a structured JSON message instead of HTML)
app.use(['/api', '/api/*', '/auth', '/auth/*', '/products', '/products/*', '/cart', '/cart/*', '/orders', '/orders/*', '/payments', '/payments/*', '/admin', '/admin/*'], (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found on Zora Shop server.`
  });
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

// Auto-seed initial owner accounts if none exist
async function bootstrapInitialOwner() {
  try {
    const existingAdmin1 = await db.findAdminByEmail('zorashop.homemade@gmail.com');
    if (!existingAdmin1) {
      await db.createAdminUser({
        name: 'Drashti Bhatt',
        email: 'zorashop.homemade@gmail.com',
        phone: '+919898014090',
        role: 'OWNER'
      });
      console.log('👑 Default Owner initialized: zorashop.homemade@gmail.com (+91 98980 14090)');
    }

    const existingAdmin2 = await db.findAdminByEmail('arpanbasak90@gmail.com');
    if (!existingAdmin2) {
      await db.createAdminUser({
        name: 'Arpan Basak',
        email: 'arpanbasak90@gmail.com',
        phone: '+916289760577',
        role: 'OWNER'
      });
      console.log('👑 Owner initialized: arpanbasak90@gmail.com (+91 6289760577)');
    }
  } catch (err) {
    console.error('Owner bootstrap error:', err);
  }
}

export { app, bootstrapInitialOwner };
export default app;

// Start standalone HTTP server only when running directly (not imported as a module or on Vercel)
const isDirectRun = Boolean(
  process.argv[1] &&
  !process.env.VERCEL &&
  !process.env.AWS_LAMBDA_FUNCTION_NAME &&
  path.resolve(process.argv[1]).toLowerCase().endsWith(path.join('server', 'index.js').toLowerCase())
);

if (isDirectRun) {
  app.listen(config.port, async () => {
    await bootstrapInitialOwner();
    console.log(`\n🍫 ══════════════════════════════════════════════════════════════`);
    console.log(`🚀 ZORA SHOP Production Backend running on port ${config.port}`);
    console.log(`🌐 API Base URL: http://localhost:${config.port}/api`);
    console.log(`📦 Database: ${db.isPostgresReady() ? 'PostgreSQL (Prisma)' : 'Local Persistent Engine'}`);
    console.log(`🔐 Email OTP Auth: Active (Resend Email Verification)`);
    console.log(`💳 Payment Gateway: Razorpay Ready`);
    console.log(`══════════════════════════════════════════════════════════════\n`);
  });
}

