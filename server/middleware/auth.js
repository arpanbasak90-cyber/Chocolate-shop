import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../services/database.js';

export const COOKIE_NAME_CUSTOMER = 'zora_cust_token';
export const COOKIE_NAME_ADMIN = 'zora_admin_token';

export function signToken(payload, expiresIn = config.jwtExpiresIn) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function setAuthCookie(res, cookieName, token) {
  const isProd = config.nodeEnv === 'production';
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearAuthCookie(res, cookieName) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax'
  });
}

/**
 * Customer Authentication Middleware
 */
export async function requireCustomer(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME_CUSTOMER] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please verify with Email & Mobile OTP.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded || decoded.role !== 'CUSTOMER') {
      return res.status(401).json({ success: false, message: 'Invalid customer session.' });
    }

    const customer = await db.findCustomerById(decoded.id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer account not found.' });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please verify OTP again.' });
  }
}

/**
 * Shopkeeper / Owner Authentication Middleware
 */
export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME_ADMIN] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Owner access restricted. Authentication required.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded || (decoded.role !== 'OWNER' && decoded.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'Access denied: Owner privileges required.' });
    }

    const admin = await db.findAdminByEmail(decoded.email);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ success: false, message: 'Owner account is inactive or unauthorized.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Admin session expired. Please verify OTP again.' });
  }
}

/**
 * Dual-Role Authentication Middleware (Owner OR Customer)
 * Authenticates either an Owner/Admin or a verified Customer.
 * Attaches req.admin and/or req.customer appropriately.
 * Returns HTTP 401 if unauthenticated.
 */
export async function authenticateUser(req, res, next) {
  try {
    const adminToken = req.cookies?.[COOKIE_NAME_ADMIN];
    const customerToken = req.cookies?.[COOKIE_NAME_CUSTOMER];
    const bearerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    // 1. Check Owner/Admin token
    const tokenToTryForAdmin = adminToken || bearerToken;
    if (tokenToTryForAdmin) {
      try {
        const decoded = jwt.verify(tokenToTryForAdmin, config.jwtSecret);
        if (decoded && (decoded.role === 'OWNER' || decoded.role === 'ADMIN')) {
          const admin = await db.findAdminByEmail(decoded.email);
          if (admin && admin.isActive) {
            req.admin = admin;
            req.userRole = 'OWNER';
            return next();
          }
        }
      } catch (adminErr) {
        // Not a valid admin token, proceed to check customer token
      }
    }

    // 2. Check Customer token
    const tokenToTryForCustomer = customerToken || bearerToken;
    if (tokenToTryForCustomer) {
      try {
        const decoded = jwt.verify(tokenToTryForCustomer, config.jwtSecret);
        if (decoded && decoded.role === 'CUSTOMER') {
          const customer = await db.findCustomerById(decoded.id);
          if (customer) {
            req.customer = customer;
            req.userRole = 'CUSTOMER';
            return next();
          }
        }
      } catch (custErr) {
        // Not a valid customer token
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in as a customer or shop owner.'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please verify your session.'
    });
  }
}

