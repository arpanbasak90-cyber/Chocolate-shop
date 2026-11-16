import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PRODUCTS, CATEGORIES } from '../../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const DATA_DIR = isServerless ? '/tmp/zora-data' : path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SOURCE_DB_FILE = path.join(__dirname, '../data/db.json');

// Global Prisma Singleton pattern (critical for serverless / lambda environments to prevent connection exhaustion)
let globalPrisma = null;
let isPrismaConnected = false;
let prismaConnectingPromise = null;

// Legacy ID mapping to guarantee smooth backward compatibility with existing carts
const LEGACY_ID_MAP = {
  'prod-plain': '1',
  'prod-almond': '2',
  'prod-dryfruit': '3',
  'prod-oreo': '4',
  'prod-rasmalai': '5',
  'prod-tuttifrutti': '6',
  'prod-jelly': '7',
  'prod-walnut': '8',
  'prod-gulkand': '9'
};

/**
 * Standardize order status strings across frontend and backend
 */
export function mapOrderStatus(status) {
  if (!status) return 'Order Placed';
  const clean = status.trim().toLowerCase();
  if (clean === 'order placed') return 'Order Placed';
  if (clean === 'confirmed' || clean === 'order confirmed') return 'Confirmed';
  if (clean === 'preparing' || clean === 'preparing your chocolates') return 'Preparing';
  if (clean === 'out for delivery') return 'Out for Delivery';
  if (clean === 'delivered') return 'Delivered';
  if (clean === 'cancelled' || clean === 'rejected') return 'Cancelled';
  return status;
}

/**
 * Robust Prisma connection manager with health verification
 */
async function getPrismaClient() {
  if (globalPrisma && isPrismaConnected) {
    return globalPrisma;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('postgres')) {
    if (isProduction) {
      throw new Error(
        'CRITICAL PRODUCTION ERROR: PostgreSQL DATABASE_URL is not configured in production environment. Persistent database is mandatory.'
      );
    }
    return null;
  }

  if (prismaConnectingPromise) {
    return await prismaConnectingPromise;
  }

  prismaConnectingPromise = (async () => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      if (!globalPrisma) {
        globalPrisma = new PrismaClient({
          datasources: {
            db: { url: dbUrl }
          },
          log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
        });
      }
      await globalPrisma.$connect();
      // Verify connectivity with a quick query
      await globalPrisma.$queryRaw`SELECT 1`;
      isPrismaConnected = true;
      console.log('✅ PostgreSQL Database connected successfully via Prisma.');
      return globalPrisma;
    } catch (err) {
      isPrismaConnected = false;
      console.error('❌ PostgreSQL Database connection failed:', err.message);
      if (isProduction) {
        throw new Error(`Production PostgreSQL connection error: ${err.message}. Persistent storage unavailable.`);
      }
      return null;
    } finally {
      prismaConnectingPromise = null;
    }
  })();

  return await prismaConnectingPromise;
}

// Initial connection attempt on boot
getPrismaClient().catch(() => {});

// ============================================================================
// LOCAL DEVELOPMENT FALLBACK DATABASE (DEV-ONLY)
// ============================================================================
function getInitialData() {
  return {
    customers: [],
    adminUsers: [
      {
        id: 'admin-owner',
        name: 'Abhijit Saha',
        email: 'abhijitsaha23485@gmail.com',
        phone: '+916289760577',
        role: 'OWNER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    otps: [],
    categories: CATEGORIES.filter(c => c !== 'All Chocolates').map(c => ({
      id: `cat-${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: c,
      slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    })),
    products: INITIAL_PRODUCTS.map(p => ({
      ...p,
      ingredients: JSON.stringify(p.ingredients || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })),
    orders: [],
    payments: [],
    statusHistory: [],
    settings: {
      id: 'default',
      shopName: 'ZORA SHOP',
      tagline: 'Sweetness in Every Bite!',
      whatsappNumber: '+91 6289760577',
      contactEmail: 'abhijitsaha23485@gmail.com',
      shopAddress: 'Handcrafted Boutique Kitchen, Ahmedabad, Gujarat, India',
      deliveryFeeThreshold: 500,
      standardDeliveryFee: 40,
      isCodEnabled: true,
      isOnlinePaymentEnabled: true,
      updatedAt: new Date().toISOString()
    }
  };
}

function initLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      if (isServerless && fs.existsSync(SOURCE_DB_FILE)) {
        fs.copyFileSync(SOURCE_DB_FILE, DB_FILE);
        return;
      }
      const initialData = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('initLocalDb notice:', err.message);
  }
}

let memDb = null;

const SIMULATED_EMAILS = new Set([
  'aarav.patel@testmail.com',
  'customertest@gmail.com',
  'priyasharma@gmail.com',
  'basakarpan979@gmail.com',
  'priyanka.sen@demo.com',
  'rohan.mehta@example.com',
  'aditya.k@example.com',
  'rohan.sharma@example.com'
]);

function sanitizeDb(data) {
  if (!data) return data;
  if (Array.isArray(data.customers)) {
    data.customers = data.customers.filter(c => {
      const email = (c.email || '').toLowerCase().trim();
      return email && !SIMULATED_EMAILS.has(email) && !email.endsWith('@testmail.com') && !email.endsWith('@example.com') && !email.endsWith('@demo.com');
    });
  }
  if (Array.isArray(data.orders)) {
    data.orders = data.orders.filter(o => {
      const custEmail = (o.customer?.email || '').toLowerCase().trim();
      const orderNum = (o.orderNumber || '').toUpperCase();
      const isSimulated = SIMULATED_EMAILS.has(custEmail) ||
        custEmail.endsWith('@testmail.com') ||
        custEmail.endsWith('@example.com') ||
        custEmail.endsWith('@demo.com') ||
        orderNum === 'ZORA-752333' ||
        o.id === 'order-1794471167667';
      return !isSimulated;
    });
  }
  return data;
}

function readLocalDb() {
  if (memDb) return sanitizeDb(memDb);
  try {
    initLocalDb();
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      if (content && content.trim()) {
        memDb = sanitizeDb(JSON.parse(content));
        return memDb;
      }
    }
  } catch (err) {
    console.warn('Error reading local db file, falling back to in-memory store:', err.message);
  }
  memDb = sanitizeDb(getInitialData());
  return memDb;
}

function writeLocalDb(data) {
  memDb = sanitizeDb(data);
  try {
    initLocalDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(memDb, null, 2), 'utf8');
  } catch (err) {
    console.warn('Notice writing local db file:', err.message);
  }
}

// ============================================================================
// UNIFIED DATABASE SERVICE
// ============================================================================
export const db = {
  get prisma() {
    return globalPrisma;
  },
  isPostgresReady: () => isPrismaConnected,

  /**
   * Complete database health inspection
   * Reports engine: 'PostgreSQL' ONLY when the real PostgreSQL query succeeds
   */
  async checkHealth() {
    try {
      const client = await getPrismaClient();
      if (client) {
        const start = Date.now();
        await client.$queryRaw`SELECT 1`;
        const latencyMs = Date.now() - start;
        return {
          connected: true,
          engine: 'PostgreSQL',
          latencyMs,
          isProduction
        };
      }
    } catch (err) {
      return {
        connected: false,
        engine: 'Disconnected',
        error: err.message,
        isProduction
      };
    }

    if (isProduction) {
      return {
        connected: false,
        engine: 'Disconnected',
        error: 'DATABASE_URL is not set or PostgreSQL is unreachable.',
        isProduction: true
      };
    }

    return {
      connected: false,
      engine: 'Disconnected',
      error: 'PostgreSQL database connection is not active.',
      isProduction: false
    };
  },

  // ==========================================================================
  // 1. PRODUCTS
  // ==========================================================================
  async getProducts({ category, search, sortBy } = {}) {
    const client = await getPrismaClient();
    if (client) {
      const where = { isAvailable: true };
      if (category && category !== 'All Chocolates') {
        where.category = { name: category };
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } }
        ];
      }
      let orderBy = { createdAt: 'desc' };
      if (sortBy === 'price-low') orderBy = { piecePrice: 'asc' };
      if (sortBy === 'price-high') orderBy = { piecePrice: 'desc' };
      if (sortBy === 'rating') orderBy = { rating: 'desc' };

      const products = await client.product.findMany({
        where,
        orderBy,
        include: { category: true }
      });
      return products;
    }

    const local = readLocalDb();
    let prods = [...(local.products || [])].filter(p => p.isAvailable !== false);

    if (category && category !== 'All Chocolates') {
      prods = prods.filter(p => p.category === category || p.category?.name === category);
    }
    if (search) {
      const q = search.toLowerCase();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-low') prods.sort((a, b) => a.piecePrice - b.piecePrice);
    if (sortBy === 'price-high') prods.sort((a, b) => b.piecePrice - a.piecePrice);
    if (sortBy === 'rating') prods.sort((a, b) => b.rating - a.rating);

    return prods;
  },

  async getProductByIdOrSlug(idOrSlug) {
    if (!idOrSlug) return null;
    const cleanId = String(idOrSlug).trim();
    const mappedId = Object.prototype.hasOwnProperty.call(LEGACY_ID_MAP, cleanId) ? LEGACY_ID_MAP[cleanId] : cleanId;

    const client = await getPrismaClient();
    if (client) {
      const prod = await client.product.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { id: mappedId },
            { slug: cleanId },
            { slug: mappedId }
          ]
        },
        include: { category: true }
      });
      if (prod) return prod;
    }

    const local = readLocalDb();
    return (local.products || []).find(p =>
      p.id === cleanId ||
      p.id === mappedId ||
      p.slug === cleanId ||
      p.slug === mappedId
    ) || null;
  },

  async createProduct(data) {
    const id = data.id || `prod-${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct = {
      id,
      slug,
      name: data.name,
      piecePrice: Number(data.piecePrice),
      boxPrice: Number(data.boxPrice),
      approxPiecesPer250g: data.approxPiecesPer250g || '20-24 pcs',
      category: data.category || 'Classics',
      tag: data.tag || 'Handmade',
      badge: data.badge || 'Fresh Batch',
      rating: 5.0,
      reviewsCount: 1,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription || data.shortDescription,
      ingredients: typeof data.ingredients === 'string' ? data.ingredients : JSON.stringify(data.ingredients || []),
      dietary: '100% Pure Vegetarian',
      shelfLife: data.shelfLife || '45 Days',
      isAvailable: data.isAvailable !== false,
      isBestseller: !!data.isBestseller,
      image: data.image || '/chocolate-placeholder.svg',
      prepTime: data.prepTime || 'Freshly Prepared'
    };

    const client = await getPrismaClient();
    if (client) {
      return await client.product.create({ data: newProduct });
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot create product in production. Persistent PostgreSQL required.');
    }

    const local = readLocalDb();
    local.products.unshift(newProduct);
    writeLocalDb(local);
    return newProduct;
  },

  async updateProduct(id, data) {
    const client = await getPrismaClient();
    if (client) {
      return await client.product.update({
        where: { id },
        data
      });
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot update product in production. Persistent PostgreSQL required.');
    }

    const local = readLocalDb();
    const idx = (local.products || []).findIndex(p => p.id === id);
    if (idx === -1) return null;
    local.products[idx] = {
      ...local.products[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    writeLocalDb(local);
    return local.products[idx];
  },

  async deleteProduct(id) {
    const client = await getPrismaClient();
    if (client) {
      return await client.product.delete({ where: { id } });
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot delete product in production. Persistent PostgreSQL required.');
    }

    const local = readLocalDb();
    local.products = (local.products || []).filter(p => p.id !== id);
    writeLocalDb(local);
    return true;
  },

  // ==========================================================================
  // 2. CUSTOMERS
  // ==========================================================================
  async findCustomerByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const client = await getPrismaClient();
    if (client) {
      return await client.customer.findUnique({
        where: { email: cleanEmail },
        include: { addresses: true, orders: true }
      });
    }

    const local = readLocalDb();
    return (local.customers || []).find(c => (c.email || '').toLowerCase() === cleanEmail) || null;
  },

  async findCustomerByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.trim();
    const client = await getPrismaClient();
    if (client) {
      return await client.customer.findUnique({
        where: { phone: cleanPhone },
        include: { addresses: true, orders: true }
      });
    }

    const local = readLocalDb();
    return (local.customers || []).find(c => c.phone === cleanPhone) || null;
  },

  async findCustomerById(id) {
    if (!id) return null;
    const client = await getPrismaClient();
    if (client) {
      return await client.customer.findUnique({
        where: { id },
        include: { addresses: true, orders: true }
      });
    }

    const local = readLocalDb();
    return (local.customers || []).find(c => c.id === id) || null;
  },

  async createOrUpdateCustomer({ name, email, phone }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    const client = await getPrismaClient();
    if (client) {
      // Find existing by email or phone to prevent unique constraint crashes
      const existing = await client.customer.findFirst({
        where: {
          OR: [{ email: cleanEmail }, { phone: cleanPhone }]
        }
      });

      if (existing) {
        return await client.customer.update({
          where: { id: existing.id },
          data: {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            isEmailVerified: true,
            isPhoneVerified: true
          }
        });
      }

      return await client.customer.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          isEmailVerified: true,
          isPhoneVerified: true
        }
      });
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot register customer. Production PostgreSQL database is unavailable.');
    }

    const local = readLocalDb();
    let cust = (local.customers || []).find(c => (c.email || '').toLowerCase() === cleanEmail || c.phone === cleanPhone);

    if (cust) {
      cust.name = cleanName;
      cust.email = cleanEmail;
      cust.phone = cleanPhone;
      cust.isEmailVerified = true;
      cust.isPhoneVerified = true;
      cust.updatedAt = new Date().toISOString();
    } else {
      cust = {
        id: `cust-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        isEmailVerified: true,
        isPhoneVerified: true,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      local.customers.push(cust);
    }

    writeLocalDb(local);
    return cust;
  },

  async getAllCustomers() {
    const client = await getPrismaClient();
    if (client) {
      const customers = await client.customer.findMany({
        include: {
          orders: {
            include: { items: true, address: true },
            orderBy: { createdAt: 'desc' }
          },
          addresses: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isEmailVerified: c.isEmailVerified,
        isPhoneVerified: c.isPhoneVerified,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        ordersCount: (c.orders || []).length,
        orders: c.orders || [],
        addresses: c.addresses || []
      }));
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot retrieve customer records. Production PostgreSQL database is unavailable.');
    }

    const local = readLocalDb();
    return (local.customers || []).map(c => {
      const custOrders = (local.orders || []).filter(o => o.customerId === c.id);
      return {
        ...c,
        ordersCount: custOrders.length,
        orders: custOrders
      };
    });
  },

  // ==========================================================================
  // 3. ADMIN USER (STORE OWNER)
  // ==========================================================================
  async findAdminByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const client = await getPrismaClient();
    if (client) {
      const admin = await client.adminUser.findUnique({
        where: { email: cleanEmail }
      });
      if (admin) return admin;
    }

    const local = readLocalDb();
    const admin = (local.adminUsers || []).find(a => (a.email || '').toLowerCase() === cleanEmail && (a.email || '').toLowerCase() !== 'arpanbasak90@gmail.com') || null;
    if (admin && admin.isActive === undefined) {
      admin.isActive = true;
    }
    return admin;
  },

  async createAdminUser({ name, email, phone, role = 'OWNER', passwordHash = null }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const client = await getPrismaClient();
    if (client) {
      return await client.adminUser.upsert({
        where: { email: cleanEmail },
        update: { name, phone: cleanPhone, role, passwordHash, isActive: true },
        create: { name, email: cleanEmail, phone: cleanPhone, role, passwordHash, isActive: true }
      });
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot create owner account. Production PostgreSQL database is unavailable.');
    }

    const local = readLocalDb();
    let admin = (local.adminUsers || []).find(a => (a.email || '').toLowerCase() === cleanEmail);
    if (admin) {
      admin.name = name;
      admin.phone = cleanPhone;
      admin.role = role;
      admin.passwordHash = passwordHash;
      admin.isActive = true;
      admin.updatedAt = new Date().toISOString();
    } else {
      admin = {
        id: `admin-${Date.now()}`,
        name,
        email: cleanEmail,
        phone: cleanPhone,
        role,
        passwordHash,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      local.adminUsers.push(admin);
    }
    writeLocalDb(local);
    return admin;
  },

  // ==========================================================================
  // 4. VERIFICATION OTP RECORDS
  // ==========================================================================
  async saveOtp({ identifier, channel, type, otpHash, expiresAt }) {
    const cleanId = identifier.trim().toLowerCase();
    const client = await getPrismaClient();
    if (client) {
      return await client.verificationOtp.create({
        data: {
          identifier: cleanId,
          channel,
          type,
          otpHash,
          expiresAt
        }
      });
    }

    const local = readLocalDb();
    const newOtp = {
      id: `otp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      identifier: cleanId,
      channel,
      type,
      otpHash,
      attempts: 0,
      expiresAt: expiresAt.toISOString(),
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    local.otps.push(newOtp);
    writeLocalDb(local);
    return newOtp;
  },

  async getLatestOtp({ identifier, channel, type }) {
    const cleanId = identifier.trim().toLowerCase();
    const client = await getPrismaClient();
    if (client) {
      return await client.verificationOtp.findFirst({
        where: {
          identifier: cleanId,
          channel,
          type,
          isVerified: false
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const local = readLocalDb();
    const matching = (local.otps || [])
      .filter(o => o.identifier === cleanId && o.channel === channel && o.type === type && !o.isVerified)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return matching[0] || null;
  },

  async incrementOtpAttempts(id) {
    const client = await getPrismaClient();
    if (client) {
      return await client.verificationOtp.update({
        where: { id },
        data: { attempts: { increment: 1 } }
      });
    }

    const local = readLocalDb();
    const otp = (local.otps || []).find(o => o.id === id);
    if (otp) {
      otp.attempts = (otp.attempts || 0) + 1;
      writeLocalDb(local);
    }
  },

  async markOtpVerified(id) {
    const client = await getPrismaClient();
    if (client) {
      return await client.verificationOtp.update({
        where: { id },
        data: { isVerified: true }
      });
    }

    const local = readLocalDb();
    const otp = (local.otps || []).find(o => o.id === id);
    if (otp) {
      otp.isVerified = true;
      writeLocalDb(local);
    }
  },

  // ==========================================================================
  // 5. ORDERS & CHECKOUT PERSISTENCE
  // ==========================================================================
  async findRecentDuplicateOrder({ customerId, grandTotal, withinSeconds = 30 }) {
    const thresholdTime = new Date(Date.now() - withinSeconds * 1000);
    const client = await getPrismaClient();

    if (client) {
      return await client.order.findFirst({
        where: {
          customerId,
          grandTotal,
          createdAt: { gte: thresholdTime }
        },
        include: { items: true, customer: true, address: true, statusHistory: true }
      });
    }

    const local = readLocalDb();
    return (local.orders || []).find(o =>
      o.customerId === customerId &&
      Math.abs(o.grandTotal - grandTotal) < 0.01 &&
      new Date(o.createdAt) >= thresholdTime
    ) || null;
  },

  async createOrder({ customerId, customer, address, items, subtotal, deliveryFee, discount, grandTotal, paymentMethod, paymentStatus = 'PENDING', notes }) {
    const orderNumber = `ZORA-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanEmail = customer.email.trim().toLowerCase();
    const cleanPhone = customer.phone.trim();

    const client = await getPrismaClient();

    if (client) {
      // 1. Ensure Customer exists in PostgreSQL
      let dbCustomer = await client.customer.findFirst({
        where: {
          OR: [{ id: customerId }, { email: cleanEmail }, { phone: cleanPhone }]
        }
      });

      if (!dbCustomer) {
        dbCustomer = await client.customer.create({
          data: {
            name: customer.name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            isEmailVerified: true,
            isPhoneVerified: true
          }
        });
      } else if (dbCustomer.name !== customer.name.trim()) {
        dbCustomer = await client.customer.update({
          where: { id: dbCustomer.id },
          data: { name: customer.name.trim() }
        });
      }

      // 2. Persist Delivery Address in PostgreSQL linked to Customer
      const dbAddress = await client.address.create({
        data: {
          customerId: dbCustomer.id,
          house: address.house.trim(),
          street: address.street.trim(),
          landmark: (address.landmark || '').trim() || null,
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
          instructions: (address.instructions || '').trim() || null
        }
      });

      // 3. Resolve Product foreign keys safely to avoid constraint failure
      const orderItemsData = [];
      for (const it of items) {
        let validProductId = null;
        const targetId = it.productId || it.id;
        if (targetId) {
          const prodRecord = await this.getProductByIdOrSlug(targetId).catch(() => null);
          if (prodRecord) validProductId = prodRecord.id;
        }

        orderItemsData.push({
          productId: validProductId,
          name: it.name,
          packageType: it.packageType,
          packageName: it.packageName,
          price: Number(it.price),
          quantity: Number(it.quantity),
          total: Number(it.total),
          image: it.image || null
        });
      }

      // 4. Create complete relational Order in PostgreSQL
      const created = await client.order.create({
        data: {
          orderNumber,
          customerId: dbCustomer.id,
          addressId: dbAddress.id,
          subtotal: Number(subtotal),
          deliveryFee: Number(deliveryFee),
          discount: Number(discount),
          grandTotal: Number(grandTotal),
          paymentMethod,
          paymentStatus,
          orderStatus: 'Order Placed',
          notes: notes || null,
          items: {
            create: orderItemsData
          },
          statusHistory: {
            create: {
              status: 'Order Placed',
              notes: 'Order confirmed and placed by customer',
              changedBy: 'CUSTOMER'
            }
          }
        },
        include: {
          items: true,
          customer: true,
          address: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          payments: true
        }
      });

      console.log(`✅ Order committed to PostgreSQL: ${created.orderNumber} (ID: ${created.id})`);
      return created;
    }

    // In production, NEVER pretend order succeeded if persistent database is down!
    if (isProduction) {
      throw new Error(
        'CRITICAL DATABASE ERROR: Order cannot be placed. Persistent PostgreSQL storage is not connected in production.'
      );
    }

    // Local dev JSON fallback only
    const local = readLocalDb();
    let localCust = (local.customers || []).find(c => (c.email || '').toLowerCase() === cleanEmail || c.phone === cleanPhone);
    if (!localCust) {
      localCust = {
        id: customerId || `cust-${Date.now()}`,
        name: customer.name,
        email: cleanEmail,
        phone: cleanPhone,
        isEmailVerified: true,
        isPhoneVerified: true,
        addresses: [address],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      local.customers.push(localCust);
    }

    const resolvedItems = [];
    for (const it of (items || [])) {
      let validProductId = null;
      const targetId = it.productId || it.id;
      if (targetId) {
        const prodRecord = await this.getProductByIdOrSlug(targetId).catch(() => null);
        if (prodRecord) validProductId = prodRecord.id;
      }
      resolvedItems.push({
        productId: validProductId,
        name: it.name,
        packageType: it.packageType,
        packageName: it.packageName,
        price: Number(it.price),
        quantity: Number(it.quantity),
        total: Number(it.total),
        image: it.image || null
      });
    }

    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      customerId: localCust.id,
      customer: {
        name: customer.name,
        email: cleanEmail,
        phone: cleanPhone
      },
      address,
      items: resolvedItems,
      subtotal,
      deliveryFee,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      orderStatus: 'Order Placed',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          status: 'Order Placed',
          notes: 'Order confirmed and placed by customer',
          changedBy: 'CUSTOMER',
          createdAt: new Date().toISOString()
        }
      ],
      timeline: [
        { status: 'Order Placed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
        { status: 'Confirmed', time: 'Pending', completed: false },
        { status: 'Preparing', time: 'Pending', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: 'Pending', completed: false }
      ]
    };

    local.orders.unshift(newOrder);
    writeLocalDb(local);
    return newOrder;
  },

  async getOrderByIdOrNumber(idOrNumber) {
    if (!idOrNumber) return null;
    const client = await getPrismaClient();

    if (client) {
      return await client.order.findFirst({
        where: {
          OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }]
        },
        include: {
          items: true,
          customer: true,
          address: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          payments: true
        }
      });
    }

    const local = readLocalDb();
    return (local.orders || []).find(o => o.id === idOrNumber || o.orderNumber === idOrNumber) || null;
  },

  async getOrdersByCustomerId(customerId) {
    if (!customerId) return [];
    const client = await getPrismaClient();

    if (client) {
      return await client.order.findMany({
        where: { customerId },
        include: {
          items: true,
          address: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const local = readLocalDb();
    return (local.orders || []).filter(o => o.customerId === customerId);
  },

  async getAllOrders({ status, search } = {}) {
    const client = await getPrismaClient();

    if (client) {
      const where = {};
      if (status && status !== 'All') {
        where.orderStatus = mapOrderStatus(status);
      }
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { phone: { contains: search } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } }
        ];
      }

      const orders = await client.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
          address: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders;
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot retrieve orders. Production PostgreSQL database is unavailable.');
    }

    const local = readLocalDb();
    let orders = [...(local.orders || [])];

    if (status && status !== 'All') {
      const mapped = mapOrderStatus(status);
      orders = orders.filter(o => o.orderStatus === mapped || o.orderStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.customer?.phone || '').includes(q) ||
        (o.customer?.email || '').toLowerCase().includes(q)
      );
    }
    return orders;
  },

  async updateOrderStatus(orderId, newStatus, notes = '', changedBy = 'OWNER') {
    const mappedStatus = mapOrderStatus(newStatus);
    const client = await getPrismaClient();

    if (client) {
      const existing = await client.order.findFirst({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }] }
      });
      if (!existing) return null;

      const updated = await client.order.update({
        where: { id: existing.id },
        data: {
          orderStatus: mappedStatus,
          statusHistory: {
            create: {
              status: mappedStatus,
              notes: notes || `Order status updated to "${mappedStatus}" by ${changedBy}`,
              changedBy
            }
          }
        },
        include: {
          items: true,
          customer: true,
          address: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          payments: true
        }
      });
      return updated;
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot update order status. Production PostgreSQL database is unavailable.');
    }

    const local = readLocalDb();
    const order = (local.orders || []).find(o => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.orderStatus = mappedStatus;
      order.updatedAt = new Date().toISOString();

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        id: `hist-${Date.now()}`,
        status: mappedStatus,
        notes: notes || `Order status updated to "${mappedStatus}" by ${changedBy}`,
        changedBy,
        createdAt: new Date().toISOString()
      });

      if (!order.timeline) order.timeline = [];
      const stepIdx = order.timeline.findIndex(t => t.status === mappedStatus);
      if (stepIdx !== -1) {
        order.timeline[stepIdx].completed = true;
        order.timeline[stepIdx].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        order.timeline.push({
          status: mappedStatus,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true
        });
      }
      writeLocalDb(local);
    }
    return order;
  },

  // ==========================================================================
  // 6. PAYMENTS
  // ==========================================================================
  async recordPayment({ orderId, gatewayOrderId, gatewayPaymentId, gatewaySignature, amount, currency = 'INR', status, rawData }) {
    const client = await getPrismaClient();

    if (client) {
      const existing = await client.order.findFirst({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }] }
      });
      if (!existing) return null;

      const payment = await client.payment.create({
        data: {
          orderId: existing.id,
          gateway: 'RAZORPAY',
          gatewayOrderId,
          gatewayPaymentId,
          gatewaySignature,
          amount: Number(amount),
          currency,
          status,
          rawWebhookData: typeof rawData === 'string' ? rawData : JSON.stringify(rawData || {})
        }
      });

      if (status === 'SUCCESS' || status === 'PAID') {
        await client.order.update({
          where: { id: existing.id },
          data: {
            paymentStatus: 'Paid',
            orderStatus: 'Confirmed',
            statusHistory: {
              create: {
                status: 'Confirmed',
                notes: `Payment verified via Razorpay (${gatewayPaymentId})`,
                changedBy: 'SYSTEM'
              }
            }
          }
        });
      }
      return payment;
    }

    const local = readLocalDb();
    const payment = {
      id: `pay-${Date.now()}`,
      orderId,
      gateway: 'RAZORPAY',
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      amount,
      currency,
      status,
      rawData,
      createdAt: new Date().toISOString()
    };

    local.payments.push(payment);

    const order = (local.orders || []).find(o => o.id === orderId || o.orderNumber === orderId);
    if (order && (status === 'SUCCESS' || status === 'PAID')) {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.updatedAt = new Date().toISOString();
    }

    writeLocalDb(local);
    return payment;
  },

  // ==========================================================================
  // 7. ADMIN STATS & REVENUE (Live Database Aggregations)
  // ==========================================================================
  async getAdminStats() {
    const client = await getPrismaClient();

    if (client) {
      const [
        totalOrders,
        totalCustomers,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        paidOrders
      ] = await Promise.all([
        client.order.count(),
        client.customer.count(),
        client.order.count({
          where: { orderStatus: { in: ['Order Placed', 'Confirmed', 'Preparing'] } }
        }),
        client.order.count({
          where: { orderStatus: 'Confirmed' }
        }),
        client.order.count({
          where: { orderStatus: 'Delivered' }
        }),
        client.order.count({
          where: { orderStatus: { in: ['Cancelled', 'Rejected'] } }
        }),
        client.order.findMany({
          where: {
            OR: [
              { paymentStatus: { in: ['Paid', 'PAID', 'Success', 'SUCCESS'] } },
              {
                paymentMethod: { in: ['COD', 'Cash on Delivery', 'Cash On Delivery', 'cash on delivery'] },
                orderStatus: 'Delivered'
              }
            ]
          },
          select: { grandTotal: true, paymentMethod: true }
        })
      ]);

      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

      return {
        totalCustomers,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        avgOrderValue,
        onlinePaymentsCount: paidOrders.filter(o => o.paymentMethod === 'RAZORPAY' || o.paymentMethod === 'UPI').length,
        codOrdersCount: paidOrders.filter(o => o.paymentMethod === 'COD').length
      };
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot retrieve statistics. Production PostgreSQL database is unavailable.');
    }

    const orders = await this.getAllOrders();
    const customers = await this.getAllCustomers();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing').length;
    const confirmedOrders = orders.filter(o => o.orderStatus === 'Confirmed').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    const isCod = (method) => {
      if (!method) return false;
      const m = method.toLowerCase();
      return m === 'cod' || m.includes('cash on delivery');
    };

    const isPaid = (status) => {
      if (!status) return false;
      const s = status.toLowerCase();
      return s === 'paid' || s === 'success';
    };

    const paidOrders = orders.filter(o =>
      isPaid(o.paymentStatus) ||
      (isCod(o.paymentMethod) && o.orderStatus === 'Delivered')
    );

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    return {
      totalCustomers: customers.length,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue,
      onlinePaymentsCount: orders.filter(o => o.paymentMethod === 'RAZORPAY' || o.paymentMethod === 'UPI').length,
      codOrdersCount: orders.filter(o => o.paymentMethod === 'COD').length
    };
  },

  // ==========================================================================
  // 8. SETTINGS
  // ==========================================================================
  async getSettings() {
    const client = await getPrismaClient();
    if (client) {
      const s = await client.storeSettings.findUnique({ where: { id: 'default' } }).catch(() => null);
      if (s) return s;
    }
    const local = readLocalDb();
    return local.settings;
  },

  async updateSettings(newSettings) {
    const client = await getPrismaClient();
    if (client) {
      return await client.storeSettings.upsert({
        where: { id: 'default' },
        update: newSettings,
        create: { id: 'default', ...newSettings }
      });
    }

    if (isProduction) {
      throw new Error('Database Error: Cannot update store settings in production. PostgreSQL required.');
    }

    const local = readLocalDb();
    local.settings = { ...local.settings, ...newSettings, updatedAt: new Date().toISOString() };
    writeLocalDb(local);
    return local.settings;
  }
};
