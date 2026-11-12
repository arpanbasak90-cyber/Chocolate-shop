import crypto from 'crypto';
import validator from 'validator';
import { db } from '../services/database.js';
import { sendEmailOtp } from '../services/emailService.js';
import { sendSmsOtp } from '../services/smsService.js';
import { signToken, setAuthCookie, clearAuthCookie, COOKIE_NAME_CUSTOMER, COOKIE_NAME_ADMIN } from '../middleware/auth.js';
import { config } from '../config/env.js';

// Helper to hash OTP with salt
function hashOtp(otpCode) {
  return crypto.createHash('sha256').update(`${otpCode}_${config.jwtSecret}`).digest('hex');
}

// Generate random 6-digit OTP
function generateSecureOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * 1. CUSTOMER: Initiate Dual OTP Verification (Email + Mobile)
 */
export async function sendCustomerOtp(req, res) {
  try {
    const { name, email, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!email || !validator.isEmail(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid Email address is required.' });
    }
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit Mobile number is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    // Generate separate 6-digit OTPs
    const emailOtp = generateSecureOtp();
    const mobileOtp = generateSecureOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Store hashed OTP records in DB
    await db.saveOtp({
      identifier: cleanEmail,
      channel: 'EMAIL',
      type: 'CUSTOMER_AUTH',
      otpHash: hashOtp(emailOtp),
      expiresAt
    });

    await db.saveOtp({
      identifier: formattedPhone,
      channel: 'SMS',
      type: 'CUSTOMER_AUTH',
      otpHash: hashOtp(mobileOtp),
      expiresAt
    });

    // Deliver Real OTPs through providers
    await Promise.all([
      sendEmailOtp({ toEmail: cleanEmail, otpCode: emailOtp, recipientName: name.trim(), isOwner: false }),
      sendSmsOtp({ toPhone: formattedPhone, otpCode: mobileOtp, isOwner: false })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Separate verification OTPs have been sent to your Email address and Mobile number. Both are required.',
      details: {
        email: cleanEmail,
        phone: formattedPhone,
        expiresInMinutes: 5
      }
    });
  } catch (error) {
    console.error('Error in sendCustomerOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification codes. Please try again.' });
  }
}

/**
 * 2. CUSTOMER: Complete Dual OTP Verification (Verifies BOTH Email & Mobile OTPs)
 */
export async function verifyCustomerOtp(req, res) {
  try {
    const { name, email, phone, emailOtp, mobileOtp } = req.body;

    if (!email || !phone || !emailOtp || !mobileOtp) {
      return res.status(400).json({
        success: false,
        message: 'Both Email OTP and Mobile OTP must be provided.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    // 1. Verify Email OTP
    const emailRecord = await db.getLatestOtp({ identifier: cleanEmail, channel: 'EMAIL', type: 'CUSTOMER_AUTH' });
    if (!emailRecord) {
      return res.status(400).json({ success: false, message: 'No active OTP found for this email. Please request a new code.' });
    }
    if (new Date() > new Date(emailRecord.expiresAt)) {
      return res.status(400).json({ success: false, message: 'The Email OTP has expired. Please request a new code.' });
    }
    if (emailRecord.attempts >= 5) {
      return res.status(400).json({ success: false, message: 'Too many incorrect Email OTP attempts. Please request a fresh code.' });
    }
    if (emailRecord.otpHash !== hashOtp(emailOtp.trim())) {
      await db.incrementOtpAttempts(emailRecord.id);
      return res.status(400).json({ success: false, message: 'Invalid Email OTP code. Please check and re-enter.' });
    }

    // 2. Verify Mobile OTP
    const mobileRecord = await db.getLatestOtp({ identifier: formattedPhone, channel: 'SMS', type: 'CUSTOMER_AUTH' });
    if (!mobileRecord) {
      return res.status(400).json({ success: false, message: 'No active OTP found for this mobile number.' });
    }
    if (new Date() > new Date(mobileRecord.expiresAt)) {
      return res.status(400).json({ success: false, message: 'The Mobile OTP has expired. Please request a new code.' });
    }
    if (mobileRecord.attempts >= 5) {
      return res.status(400).json({ success: false, message: 'Too many incorrect Mobile OTP attempts.' });
    }
    if (mobileRecord.otpHash !== hashOtp(mobileOtp.trim())) {
      await db.incrementOtpAttempts(mobileRecord.id);
      return res.status(400).json({ success: false, message: 'Invalid Mobile OTP code. Please check and re-enter.' });
    }

    // Mark both OTPs as verified to prevent replay
    await Promise.all([
      db.markOtpVerified(emailRecord.id),
      db.markOtpVerified(mobileRecord.id)
    ]);

    // Create or retrieve verified customer record in DB
    const customer = await db.createOrUpdateCustomer({
      name: (name || 'Chocolate Lover').trim(),
      email: cleanEmail,
      phone: formattedPhone
    });

    // Sign session token and set secure HTTP-only cookie
    const token = signToken({ id: customer.id, email: customer.email, role: 'CUSTOMER' });
    setAuthCookie(res, COOKIE_NAME_CUSTOMER, token);

    return res.status(200).json({
      success: true,
      message: 'Both Email and Mobile number verified successfully!',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses || []
      },
      token
    });
  } catch (error) {
    console.error('Error in verifyCustomerOtp:', error);
    return res.status(500).json({ success: false, message: 'Verification error. Please try again.' });
  }
}

/**
 * 3. CUSTOMER: Get Current Profile
 */
export async function getCustomerMe(req, res) {
  return res.status(200).json({
    success: true,
    customer: {
      id: req.customer.id,
      name: req.customer.name,
      email: req.customer.email,
      phone: req.customer.phone,
      addresses: req.customer.addresses || []
    }
  });
}

/**
 * 4. CUSTOMER: Logout
 */
export function customerLogout(req, res) {
  clearAuthCookie(res, COOKIE_NAME_CUSTOMER);
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

/**
 * 5. ADMIN / SHOPKEEPER: Initiate Owner Login with Dual OTP
 */
export async function sendAdminOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Owner email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await db.findAdminByEmail(cleanEmail);

    if (!admin || !admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized email. Only registered shopkeeper accounts can request admin verification.'
      });
    }

    const emailOtp = generateSecureOtp();
    const mobileOtp = generateSecureOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.saveOtp({
      identifier: admin.email,
      channel: 'EMAIL',
      type: 'ADMIN_AUTH',
      otpHash: hashOtp(emailOtp),
      expiresAt
    });

    await db.saveOtp({
      identifier: admin.phone,
      channel: 'SMS',
      type: 'ADMIN_AUTH',
      otpHash: hashOtp(mobileOtp),
      expiresAt
    });

    await Promise.all([
      sendEmailOtp({ toEmail: admin.email, otpCode: emailOtp, recipientName: admin.name, isOwner: true }),
      sendSmsOtp({ toPhone: admin.phone, otpCode: mobileOtp, isOwner: true })
    ]);

    // Mask phone for security display e.g. +91 98*****090
    const maskedPhone = admin.phone.replace(/(\+\d{2}\s?\d{2})\d+(\d{3})/, '$1*****$2');

    return res.status(200).json({
      success: true,
      message: 'Dual verification OTPs dispatched to registered Owner Email and Mobile number.',
      details: {
        email: admin.email,
        phoneMasked: maskedPhone
      }
    });
  } catch (error) {
    console.error('Error in sendAdminOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate owner verification.' });
  }
}

/**
 * 6. ADMIN / SHOPKEEPER: Verify Dual OTPs & Authenticate
 */
export async function verifyAdminOtp(req, res) {
  try {
    const { email, emailOtp, mobileOtp } = req.body;

    if (!email || !emailOtp || !mobileOtp) {
      return res.status(400).json({ success: false, message: 'Email, Email OTP, and Mobile OTP are all required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await db.findAdminByEmail(cleanEmail);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ success: false, message: 'Unauthorized owner account.' });
    }

    // Verify Email OTP
    const emailRecord = await db.getLatestOtp({ identifier: admin.email, channel: 'EMAIL', type: 'ADMIN_AUTH' });
    if (!emailRecord || new Date() > new Date(emailRecord.expiresAt) || emailRecord.otpHash !== hashOtp(emailOtp.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired Email OTP code.' });
    }

    // Verify Mobile OTP
    const mobileRecord = await db.getLatestOtp({ identifier: admin.phone, channel: 'SMS', type: 'ADMIN_AUTH' });
    if (!mobileRecord || new Date() > new Date(mobileRecord.expiresAt) || mobileRecord.otpHash !== hashOtp(mobileOtp.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired Mobile SMS OTP code.' });
    }

    await Promise.all([
      db.markOtpVerified(emailRecord.id),
      db.markOtpVerified(mobileRecord.id)
    ]);

    const token = signToken({ id: admin.id, email: admin.email, role: 'OWNER' });
    setAuthCookie(res, COOKIE_NAME_ADMIN, token);

    return res.status(200).json({
      success: true,
      message: 'Owner successfully authenticated.',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('Error in verifyAdminOtp:', error);
    return res.status(500).json({ success: false, message: 'Admin authentication failed.' });
  }
}

/**
 * 7. ADMIN / SHOPKEEPER: Secure Initial Setup
 * Protected by secret ADMIN_SETUP_SECRET from server environment.
 */
export async function setupInitialOwner(req, res) {
  try {
    const { setupSecret, name, email, phone } = req.body;

    if (setupSecret !== config.adminSetupSecret) {
      return res.status(403).json({ success: false, message: 'Invalid setup secret. Unauthorized attempt.' });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required to register initial owner.' });
    }

    const admin = await db.createAdminUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'OWNER'
    });

    console.log(`👑 Initial Shopkeeper Owner Account registered: ${admin.email} (${admin.phone})`);
    return res.status(201).json({
      success: true,
      message: 'Initial Shopkeeper Owner Account created securely. Owner can now authenticate using Dual Email & Mobile OTP.',
      admin: {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error in setupInitialOwner:', error);
    return res.status(500).json({ success: false, message: 'Failed to create owner account.' });
  }
}

/**
 * 8. ADMIN: Get Current Session Profile
 */
export async function getAdminMe(req, res) {
  return res.status(200).json({
    success: true,
    admin: {
      id: req.admin.id,
      name: req.admin.name,
      email: req.admin.email,
      phone: req.admin.phone,
      role: req.admin.role
    }
  });
}

/**
 * 9. ADMIN: Logout
 */
export function adminLogout(req, res) {
  clearAuthCookie(res, COOKIE_NAME_ADMIN);
  return res.status(200).json({ success: true, message: 'Owner console session terminated.' });
}
