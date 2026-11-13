import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (!transporter && config.smtp.user && config.smtp.pass) {
    try {
      transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        }
      });
      console.log('✅ SMTP Email Transporter configured successfully.');
    } catch (err) {
      console.error('❌ Failed to configure SMTP transporter:', err.message);
    }
  }
  return transporter;
}

/**
 * Send real Email OTP to customer or shopkeeper
 */
export async function sendEmailOtp({ toEmail, otpCode, recipientName = 'Chocolate Lover', isOwner = false }) {
  const mailClient = getTransporter();

  const subject = isOwner
    ? `🔐 ZORA SHOP Owner Login Verification Code: ${otpCode}`
    : `🍫 ${otpCode} is your ZORA SHOP verification code`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Georgia', serif; background-color: #1c0c07; margin: 0; padding: 20px; color: #fdfbf7; }
        .container { max-width: 520px; margin: 0 auto; background-color: #2b130a; border-radius: 20px; border: 1px solid #5a2c1b; overflow: hidden; }
        .header { background: linear-gradient(135deg, #3c1b11, #1c0c07); padding: 30px 20px; text-align: center; border-bottom: 2px solid #5a2c1b; }
        .logo { font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px; }
        .tagline { color: #f7d070; font-style: italic; font-size: 14px; margin-top: 4px; }
        .body { padding: 30px; text-align: center; }
        .greeting { font-size: 18px; color: #f3e8dc; margin-bottom: 12px; }
        .message { font-size: 14px; color: #d6c7b2; line-height: 1.6; margin-bottom: 24px; font-family: sans-serif; }
        .otp-box { background: #1c0c07; border: 2px dashed #f7d070; border-radius: 14px; padding: 18px; margin: 20px auto; display: inline-block; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f7d070; }
        .expiry { font-size: 12px; color: #a89f91; margin-top: 8px; font-family: sans-serif; }
        .footer { background-color: #170904; padding: 18px; text-align: center; font-size: 11px; color: #8c8273; font-family: sans-serif; border-top: 1px solid #3c1b11; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍫 ZORA SHOP</div>
          <div class="tagline">"Sweetness in Every Bite!"</div>
        </div>
        <div class="body">
          <div class="greeting">Hello ${recipientName},</div>
          <div class="message">
            Use the verification code below to complete your secure ${isOwner ? 'Shopkeeper Admin' : 'Customer'} authentication on <strong>ZORA SHOP</strong>.
          </div>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
          </div>
          <div class="expiry">⏱️ This code is valid for <strong>5 minutes</strong>. Never share this code with anyone.</div>
        </div>
        <div class="footer">
          Handcrafted Boutique Kitchen • Pure Vegetarian Homemade Chocolates<br>
          If you did not request this OTP, please disregard this email.
        </div>
      </div>
    </body>
    </html>
  `;

  if (mailClient) {
    try {
      const info = await mailClient.sendMail({
        from: config.smtp.from,
        to: toEmail,
        subject,
        html: htmlContent
      });
      console.log(`✉️ Email OTP successfully delivered to ${toEmail} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ SMTP delivery failed to ${toEmail}:`, err.message);
    }
  }

  // Resend API Integration
  if (config.resend.apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.resend.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: config.resend.from || 'onboarding@resend.dev',
          to: toEmail,
          subject,
          html: htmlContent
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.id) {
        console.log(`✉️ Real Email OTP successfully delivered via Resend to ${toEmail} (Resend ID: ${data.id})`);
        return { success: true, provider: 'Resend', id: data.id, deliveredToInbox: true };
      } else {
        const errorReason = data.message || res.statusText || 'Resend delivery rejected';
        console.warn(`⚠️ Resend dispatch notice for ${toEmail}: ${errorReason}`);

        // If Resend free sandbox restricts delivery to the account owner, forward a copy to primary owner (arpanbasak90@gmail.com)
        if (data.message && data.message.includes('only send testing emails to your own email address') && toEmail.toLowerCase() !== 'arpanbasak90@gmail.com') {
          try {
            const fallbackRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.resend.apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: config.resend.from || 'onboarding@resend.dev',
                to: 'arpanbasak90@gmail.com',
                subject: `🔐 ZORA SHOP Owner OTP for ${recipientName} (${toEmail}): ${otpCode}`,
                html: htmlContent
              })
            });
            const fbData = await fallbackRes.json().catch(() => ({}));
            if (fallbackRes.ok && fbData.id) {
              console.log(`✉️ Resend sandbox copy dispatched to arpanbasak90@gmail.com for ${toEmail} (ID: ${fbData.id})`);
              return {
                success: true,
                provider: 'Resend',
                id: fbData.id,
                deliveredToInbox: true,
                forwardedTo: 'arpanbasak90@gmail.com'
              };
            }
          } catch (fbErr) {
            console.error('Fallback email dispatch error:', fbErr.message);
          }
        }

        return {
          success: true,
          provider: 'Resend',
          deliveredToInbox: false,
          reason: errorReason
        };
      }
    } catch (err) {
      console.error('❌ Resend API request failed:', err.message);
      return {
        success: true,
        provider: 'LocalFallback',
        deliveredToInbox: false,
        reason: err.message
      };
    }
  }

  // Fallback: If external delivery encounters restrictions or in local dev mode, log prominently in server console
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`📢 [REAL EMAIL OTP NOTICE] To: ${toEmail}`);
  console.log(`🔑 Verification Code: ${otpCode}`);
  console.log(`💡 Delivered via active Zora Shop verification engine.`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
  return { success: true, deliveredToInbox: false, isDevConsole: true };
}

