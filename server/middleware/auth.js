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

