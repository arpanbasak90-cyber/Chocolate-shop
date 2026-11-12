import { config } from '../config/env.js';

/**
 * Send real Mobile SMS OTP via Twilio or Fast2SMS
 */
export async function sendSmsOtp({ toPhone, otpCode, isOwner = false }) {
  const cleanPhone = toPhone.replace(/\D/g, '');
  const messageText = `ZORA SHOP: Your ${isOwner ? 'Owner' : 'Customer'} verification code is ${otpCode}. Valid for 5 minutes. Do not share.`;

  // 1. Try Fast2SMS (popular in India: numbers starting with 91 or 10-digit Indian numbers)
  if (config.sms.fast2smsApiKey && cleanPhone.length >= 10) {
    try {
      const tenDigitPhone = cleanPhone.slice(-10);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': config.sms.fast2smsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variables_values: otpCode,
          route: 'otp',
          numbers: tenDigitPhone
        })
      });

      const result = await response.json();
      if (result.return) {
        console.log(`📱 SMS OTP delivered via Fast2SMS to +91 ${tenDigitPhone}`);
        return { success: true, provider: 'Fast2SMS' };
      } else {
        console.warn('Fast2SMS response warning:', result.message);
      }
    } catch (err) {
      console.error('Fast2SMS error:', err.message);
    }
  }

  // 2. Try Twilio
  if (config.sms.twilioSid && config.sms.twilioToken && config.sms.twilioFrom) {
    try {
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
      const auth = Buffer.from(`${config.sms.twilioSid}:${config.sms.twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedPhone);
      params.append('From', config.sms.twilioFrom);
      params.append('Body', messageText);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.sms.twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        }
      );

      const result = await response.json();
      if (result.sid) {
        console.log(`📱 SMS OTP delivered via Twilio to ${formattedPhone} (SID: ${result.sid})`);
        return { success: true, provider: 'Twilio', sid: result.sid };
      } else {
        console.warn('Twilio response warning:', result.message);
      }
    } catch (err) {
      console.error('Twilio SMS error:', err.message);
    }
  }

  // Fallback: Log clearly on server console when SMS credentials are not yet entered in .env
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`📱 [REAL MOBILE OTP NOTICE] To: ${toPhone}`);
  console.log(`🔑 Verification Code: ${otpCode}`);
  console.log(`💡 Configure FAST2SMS_API_KEY or TWILIO credentials in server/.env for live mobile transmission.`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  return { success: true, isDevConsole: true };
}

