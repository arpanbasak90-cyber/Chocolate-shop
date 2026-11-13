import crypto from 'crypto';
import validator from 'validator';
import { db } from '../services/database.js';
import { sendEmailOtp } from '../services/emailService.js';
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
 * 1. CUSTOMER: Initiate Email OTP Verification
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
    const cleanEmail = email.trim().toLowerCase();
    const formattedPhone = cleanPhone.length >= 10
      ? (cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`)
      : (cleanPhone ? `+91${cleanPhone}` : '+910000000000');

    // Generate secure 6-digit Email OTP
    const emailOtp = generateSecureOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Store hashed OTP record in DB
    await db.saveOtp({
      identifier: cleanEmail,
      channel: 'EMAIL',
      type: 'CUSTOMER_AUTH',
      otpHash: hashOtp(emailOtp),
      expiresAt
    });

    // Deliver Real OTP to customer's email
    const delivery = await sendEmailOtp({ toEmail: cleanEmail, otpCode: emailOtp, recipientName: name.trim(), isOwner: false });

    return res.status(200).json({
      success: true,
      message: delivery?.deliveredToInbox
        ? `A 6-digit verification code has been delivered to ${cleanEmail}. (Check inbox or spam)`
        : `A 6-digit verification code was generated for ${cleanEmail}.`,
      details: {
        email: cleanEmail,
        phone: formattedPhone,
        expiresInMinutes: 5,
        deliveredToInbox: !!delivery?.deliveredToInbox,
        ...(!delivery?.deliveredToInbox ? {
          devCode: emailOtp,
          devNotice: delivery?.reason || 'Resend Testing Sandbox: Inbox delivery restricted to account owner email (arpanbasak90@gmail.com).'
        } : {})
      }
    });
  } catch (error) {
    console.error('Error in sendCustomerOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
  }
}

/**
 * 2. CUSTOMER: Complete Email OTP Verification
 */
export async function verifyCustomerOtp(req, res) {
  try {
    const { name, email, phone, emailOtp } = req.body;

    if (!email || !emailOtp) {
      return res.status(400).json({
        success: false,
        message: 'Email address and 6-digit Email OTP must be provided.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : (cleanPhone ? `+${cleanPhone}` : '');

    // Verify Email OTP
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

    // Mark OTP as verified to prevent replay
    await db.markOtpVerified(emailRecord.id);

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
      message: 'Email address verified successfully!',
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
 * 5. ADMIN / SHOPKEEPER: Initiate Owner Login with Email OTP
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
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.saveOtp({
      identifier: admin.email,
      channel: 'EMAIL',
      type: 'ADMIN_AUTH',
      otpHash: hashOtp(emailOtp),
      expiresAt
    });

    const delivery = await sendEmailOtp({ toEmail: admin.email, otpCode: emailOtp, recipientName: admin.name, isOwner: true });

    return res.status(200).json({
      success: true,
      message: delivery?.deliveredToInbox
        ? `Verification code dispatched to your registered Owner Email address (${admin.email}). (Check inbox or spam)`
        : `Owner verification code generated for ${admin.email}.`,
      details: {
        email: admin.email,
        deliveredToInbox: !!delivery?.deliveredToInbox,
        ...(!delivery?.deliveredToInbox ? {
          devCode: emailOtp,
          devNotice: delivery?.reason || 'Resend Testing Sandbox: Inbox delivery restricted to account owner email (arpanbasak90@gmail.com).'
        } : {})
      }
    });
  } catch (error) {
    console.error('Error in sendAdminOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate owner verification.' });
  }
}

/**
 * 6. ADMIN / SHOPKEEPER: Verify Email OTP & Authenticate
 */
export async function verifyAdminOtp(req, res) {
  try {
    const { email, emailOtp } = req.body;

    if (!email || !emailOtp) {
      return res.status(400).json({ success: false, message: 'Owner Email and 6-digit Email OTP are required.' });
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

    await db.markOtpVerified(emailRecord.id);

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
      message: 'Initial Shopkeeper Owner Account created securely. Owner can now authenticate using Email OTP.',
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

