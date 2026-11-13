import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { INITIAL_PRODUCTS, CATEGORIES } from '../../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const DATA_DIR = isServerless ? '/tmp/zora-data' : path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SOURCE_DB_FILE = path.join(__dirname, '../data/db.json');

// Initialize Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

let isPrismaConnected = false;

// Attempt PostgreSQL connection via Prisma
async function testPrismaConnection() {
  try {
    await prisma.$connect();
    isPrismaConnected = true;
    console.log('✅ Connected to PostgreSQL Database via Prisma.');
  } catch (err) {
    isPrismaConnected = false;
    console.warn('ℹ️ PostgreSQL not reachable at DATABASE_URL. Running with local persistent database.');
    console.warn(`   Prisma connection error: ${err.message?.split('\n')[0]}`);
    console.warn('   To connect to live PostgreSQL: set valid DATABASE_URL in server/.env and run: npm run prisma:push');
  }
}
testPrismaConnection();

// Local fallback DB initialization
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

      const initialData = {
        customers: [],
        adminUsers: [],
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
          contactEmail: 'zorashop.homemade@gmail.com',
          shopAddress: 'Handcrafted Boutique Kitchen, Ahmedabad, Gujarat, India',
          deliveryFeeThreshold: 500,
          standardDeliveryFee: 40,
          isCodEnabled: true,
          isOnlinePaymentEnabled: true,
          updatedAt: new Date().toISOString()
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('initLocalDb notice:', err.message);
  }
}

let memDb = null;

function readLocalDb() {
  if (memDb) return memDb;
  try {
    initLocalDb();
    if (fs.existsSync(DB_FILE)) {
      memDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return memDb;
    }
  } catch (err) {
    console.error('Error reading local db file:', err);
  }
  return { customers: [], adminUsers: [], otps: [], products: [], orders: [], payments: [] };
}

function writeLocalDb(data) {
  try {
    memDb = data;
    initLocalDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local db file:', err.message);
  }
}

// ============================================================================
// UNIFIED DATABASE SERVICE (Dual Engine: PostgreSQL / Local Persistent Fallback)
// ============================================================================
export const db = {
  prisma,
  isPostgresReady: () => isPrismaConnected,

  // 1. PRODUCTS
  async getProducts({ category, search, sortBy }) {
    if (isPrismaConnected) {
      try {
        const where = {};
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

        return await prisma.product.findMany({
          where,
          orderBy,
          include: { category: true }
        });
      } catch (e) {
        console.warn('Prisma getProducts fallback to local store:', e.message);
      }
    }

    const local = readLocalDb();
    let prods = [...(local.products || [])];

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
    if (isPrismaConnected) {
      try {
        return await prisma.product.findFirst({
          where: {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }]
          },
          include: { category: true }
        });
      } catch (e) {
        console.warn('Prisma getProductByIdOrSlug fallback:', e.message);
      }
    }

    const local = readLocalDb();
    return (local.products || []).find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
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

    if (isPrismaConnected) {
      try {
        return await prisma.product.create({ data: newProduct });
      } catch (e) {
        console.warn('Prisma createProduct fallback:', e.message);
      }
    }

    const local = readLocalDb();
    local.products.unshift(newProduct);
    writeLocalDb(local);
    return newProduct;
  },

  async updateProduct(id, data) {
    if (isPrismaConnected) {
      try {
        return await prisma.product.update({
          where: { id },
          data
        });
      } catch (e) {
        console.warn('Prisma updateProduct fallback:', e.message);
      }
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
    if (isPrismaConnected) {
      try {
        return await prisma.product.delete({ where: { id } });
      } catch (e) {
        console.warn('Prisma deleteProduct fallback:', e.message);
      }
    }

    const local = readLocalDb();
    local.products = (local.products || []).filter(p => p.id !== id);
    writeLocalDb(local);
    return true;
  },

  // 2. CUSTOMERS
  async findCustomerByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (isPrismaConnected) {
      try {
        return await prisma.customer.findUnique({
          where: { email: cleanEmail },
          include: { addresses: true, orders: true }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    return (local.customers || []).find(c => c.email.toLowerCase() === cleanEmail) || null;
  },

  async findCustomerByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.trim();
    if (isPrismaConnected) {
      try {
        return await prisma.customer.findUnique({
          where: { phone: cleanPhone },
          include: { addresses: true, orders: true }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    return (local.customers || []).find(c => c.phone === cleanPhone) || null;
  },

  async findCustomerById(id) {
    if (isPrismaConnected) {
      try {
        return await prisma.customer.findUnique({
          where: { id },
          include: { addresses: true, orders: true }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    return (local.customers || []).find(c => c.id === id) || null;
  },

  async createOrUpdateCustomer({ name, email, phone }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (isPrismaConnected) {
      try {
        return await prisma.customer.upsert({
          where: { email: cleanEmail },
          update: {
            name,
            phone: cleanPhone,
            isEmailVerified: true,
            isPhoneVerified: true
          },
          create: {
            name,
            email: cleanEmail,
            phone: cleanPhone,
            isEmailVerified: true,
            isPhoneVerified: true
          }
        });
      } catch (e) {
        console.warn('Prisma createOrUpdateCustomer fallback:', e.message);
      }
    }

    const local = readLocalDb();
    let cust = (local.customers || []).find(c => c.email.toLowerCase() === cleanEmail || c.phone === cleanPhone);

    if (cust) {
      cust.name = name;
      cust.email = cleanEmail;
      cust.phone = cleanPhone;
      cust.isEmailVerified = true;
      cust.isPhoneVerified = true;
      cust.updatedAt = new Date().toISOString();
    } else {
      cust = {
        id: `cust-${Date.now()}`,
        name,
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
    if (isPrismaConnected) {
      try {
        return await prisma.customer.findMany({
          include: { orders: true, addresses: true },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {}
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

  // 3. ADMIN USER
  async findAdminByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (isPrismaConnected) {
      try {
        return await prisma.adminUser.findUnique({
          where: { email: cleanEmail }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    return (local.adminUsers || []).find(a => a.email.toLowerCase() === cleanEmail) || null;
  },

  async createAdminUser({ name, email, phone, role = 'OWNER', passwordHash = null }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (isPrismaConnected) {
      try {
        return await prisma.adminUser.upsert({
          where: { email: cleanEmail },
          update: { name, phone: cleanPhone, role, passwordHash },
          create: { name, email: cleanEmail, phone: cleanPhone, role, passwordHash }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    let admin = (local.adminUsers || []).find(a => a.email.toLowerCase() === cleanEmail);
    if (admin) {
      admin.name = name;
      admin.phone = cleanPhone;
      admin.role = role;
      admin.passwordHash = passwordHash;
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

  // 4. VERIFICATION OTP RECORDS
  async saveOtp({ identifier, channel, type, otpHash, expiresAt }) {
    const cleanId = identifier.trim().toLowerCase();
    if (isPrismaConnected) {
      try {
        return await prisma.verificationOtp.create({
          data: {
            identifier: cleanId,
            channel,
            type,
            otpHash,
            expiresAt
          }
        });
      } catch (e) {}
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
    if (isPrismaConnected) {
      try {
        return await prisma.verificationOtp.findFirst({
          where: {
            identifier: cleanId,
            channel,
            type,
            isVerified: false
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    const matching = (local.otps || [])
      .filter(o => o.identifier === cleanId && o.channel === channel && o.type === type && !o.isVerified)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return matching[0] || null;
  },

  async incrementOtpAttempts(id) {
    if (isPrismaConnected) {
      try {
        return await prisma.verificationOtp.update({
          where: { id },
          data: { attempts: { increment: 1 } }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    const otp = (local.otps || []).find(o => o.id === id);
    if (otp) {
      otp.attempts = (otp.attempts || 0) + 1;
      writeLocalDb(local);
    }
  },

  async markOtpVerified(id) {
    if (isPrismaConnected) {
      try {
        return await prisma.verificationOtp.update({
          where: { id },
          data: { isVerified: true }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    const otp = (local.otps || []).find(o => o.id === id);
    if (otp) {
      otp.isVerified = true;
      writeLocalDb(local);
    }
  },

  // 5. ORDERS
  async createOrder({ customerId, customer, address, items, subtotal, deliveryFee, discount, grandTotal, paymentMethod, paymentStatus = 'PENDING', notes }) {
    const orderNumber = `ZORA-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      customerId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      address,
      items,
      subtotal,
      deliveryFee,
      discount,
      grandTotal,
      paymentMethod, // 'COD' | 'RAZORPAY' | 'UPI'
      paymentStatus, // 'PENDING' | 'PAID' | 'FAILED'
      orderStatus: 'Order Placed',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { status: 'Order Placed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
        { status: 'Confirmed', time: 'Pending', completed: false },
        { status: 'Preparing', time: 'Pending', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: 'Pending', completed: false }
      ]
    };

    if (isPrismaConnected) {
      try {
        // Create full relational order in PostgreSQL
        const created = await prisma.order.create({
          data: {
            id: newOrder.id,
            orderNumber,
            customerId,
            subtotal,
            deliveryFee,
            discount,
            grandTotal,
            paymentMethod,
            paymentStatus,
            orderStatus: 'Order Placed',
            notes,
            items: {
              create: items.map(it => ({
                productId: it.productId || it.id,
                name: it.name,
                packageType: it.packageType,
                packageName: it.packageName,
                price: Number(it.price),
                quantity: Number(it.quantity),
                total: Number(it.total),
                image: it.image
              }))
            },
            statusHistory: {
              create: {
                status: 'Order Placed',
                notes: 'Order submitted by customer',
                changedBy: 'CUSTOMER'
              }
            }
          },
          include: { items: true, statusHistory: true, customer: true }
        });
        return created;
      } catch (e) {
        console.warn('Prisma createOrder fallback:', e.message);
      }
    }

    const local = readLocalDb();
    local.orders.unshift(newOrder);
    writeLocalDb(local);
    return newOrder;
  },

  async getOrderByIdOrNumber(idOrNumber) {
    if (isPrismaConnected) {
      try {
        return await prisma.order.findFirst({
          where: {
            OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }]
          },
          include: { items: true, customer: true, statusHistory: true, payments: true }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    return (local.orders || []).find(o => o.id === idOrNumber || o.orderNumber === idOrNumber) || null;
  },

  async getOrdersByCustomerId(customerId) {
    if (isPrismaConnected) {
      try {
        return await prisma.order.findMany({
          where: { customerId },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    return (local.orders || []).filter(o => o.customerId === customerId);
  },

  async getAllOrders({ status, search } = {}) {
    if (isPrismaConnected) {
      try {
        const where = {};
        if (status && status !== 'All') where.orderStatus = status;
        if (search) {
          where.OR = [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } },
            { customer: { phone: { contains: search } } }
          ];
        }
        return await prisma.order.findMany({
          where,
          include: { items: true, customer: true, payments: true },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    let orders = [...(local.orders || [])];

    if (status && status !== 'All') {
      orders = orders.filter(o => o.orderStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.customer?.phone || '').includes(q)
      );
    }
    return orders;
  },

  async updateOrderStatus(orderId, newStatus, notes = '', changedBy = 'OWNER') {
    if (isPrismaConnected) {
      try {
        return await prisma.order.update({
          where: { id: orderId },
          data: {
            orderStatus: newStatus,
            statusHistory: {
              create: {
                status: newStatus,
                notes,
                changedBy
              }
            }
          },
          include: { items: true, statusHistory: true }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    const order = (local.orders || []).find(o => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.orderStatus = newStatus;
      order.updatedAt = new Date().toISOString();

      if (!order.timeline) order.timeline = [];
      const stepIdx = order.timeline.findIndex(t => t.status === newStatus);
      if (stepIdx !== -1) {
        order.timeline[stepIdx].completed = true;
        order.timeline[stepIdx].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        order.timeline.push({
          status: newStatus,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true
        });
      }
      writeLocalDb(local);
    }
    return order;
  },

  // 6. PAYMENTS
  async recordPayment({ orderId, gatewayOrderId, gatewayPaymentId, gatewaySignature, amount, currency = 'INR', status, rawData }) {
    if (isPrismaConnected) {
      try {
        const payment = await prisma.payment.create({
          data: {
            orderId,
            gateway: 'RAZORPAY',
            gatewayOrderId,
            gatewayPaymentId,
            gatewaySignature,
            amount,
            currency,
            status,
            rawWebhookData: typeof rawData === 'string' ? rawData : JSON.stringify(rawData || {})
          }
        });

        if (status === 'SUCCESS' || status === 'PAID') {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'Paid',
              orderStatus: 'Confirmed'
            }
          });
        }
        return payment;
      } catch (e) {}
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

    // Update order status
    const order = (local.orders || []).find(o => o.id === orderId || o.orderNumber === orderId);
    if (order && (status === 'SUCCESS' || status === 'PAID')) {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.updatedAt = new Date().toISOString();
    }

    writeLocalDb(local);
    return payment;
  },

  // 7. ADMIN STATS & REVENUE (Derived strictly from genuine DB records!)
  async getAdminStats() {
    const orders = await this.getAllOrders();
    const customers = await this.getAllCustomers();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing').length;
    const confirmedOrders = orders.filter(o => o.orderStatus === 'Confirmed').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    // REVENUE CALCULATION RULE:
    // Revenue is calculated ONLY from verified successful online payments and genuinely completed/delivered COD orders!
    const paidOrders = orders.filter(o =>
      (o.paymentStatus === 'Paid') ||
      (o.paymentMethod === 'COD' && o.orderStatus === 'Delivered')
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

  // 8. SETTINGS
  async getSettings() {
    if (isPrismaConnected) {
      try {
        const s = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
        if (s) return s;
      } catch (e) {}
    }
    const local = readLocalDb();
    return local.settings;
  },

  async updateSettings(newSettings) {
    if (isPrismaConnected) {
      try {
        return await prisma.storeSettings.upsert({
          where: { id: 'default' },
          update: newSettings,
          create: { id: 'default', ...newSettings }
        });
      } catch (e) {}
    }

    const local = readLocalDb();
    local.settings = { ...local.settings, ...newSettings, updatedAt: new Date().toISOString() };
    writeLocalDb(local);
    return local.settings;
  }
};

