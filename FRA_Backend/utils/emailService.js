const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter supporting Gmail App Password, SMTP, and Dev fallback
 */
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // Gmail SMTP service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

/**
 * Send email utility
 * 
 * @param {Object} options
 * @param {string} options.email - Recipient address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text version
 * @param {string} [options.html] - HTML body
 */
const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailFrom =
    process.env.EMAIL_FROM ||
    `${process.env.FROM_NAME || 'Food Recipe App'} <${emailUser || 'noreply@recipehaven.com'}>`;

  const transporter = createTransporter();

  if (transporter) {
    try {
      const mailOptions = {
        from: emailFrom,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service]: Message delivered to ${options.email} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`[Email Service Warning]: Failed to deliver email via SMTP (${err.message}). Logging to console for development.`);
    }
  }

  // Development Fallback Console Log (safe formatting without leaking sensitive keys)
  console.log(`\n================== [OUTGOING EMAIL NOTIFICATION] ==================`);
  console.log(`To: ${options.email}`);
  console.log(`From: ${emailFrom}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`------------------------------------------------------------------`);
  console.log(options.message);
  console.log(`==================================================================\n`);

  return { success: true, fallback: true };
};

/**
 * Send 6-digit Password Reset OTP Email with Food Recipe App branding
 * 
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - 6-digit verification code
 * @param {number} expireMinutes - Expiration time in minutes (default: 10)
 */
const sendOtpEmail = async (email, name, otp, expireMinutes = 10) => {
  const subject = 'Your Food Recipe App Password Reset OTP';

  const plainMessage = `Hello ${name || 'Chef'},\n\nYour Food Recipe App verification code is:\n${otp}\n\nThis code will expire in ${expireMinutes} minutes.\n\nSecurity Notice: For your security, do not share this code with anyone.\n\nIf you did not request this verification code, please ignore this email.\n\nHappy cooking,\nFood Recipe App Team`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #fafaf9; border-radius: 24px; border: 1px solid #e7e5e4;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 50px; height: 50px; border-radius: 16px; background: linear-gradient(135deg, #ea580c, #f59e0b); line-height: 50px; color: #ffffff; font-size: 26px; font-weight: bold;">
          👨‍🍳
        </div>
        <h1 style="color: #1c1917; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0; letter-spacing: -0.5px;">Food Recipe App</h1>
        <p style="color: #78716c; font-size: 13px; margin: 0;">Password Reset Verification</p>
      </div>

      <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #f5f5f4;">
        <p style="color: #292524; font-size: 15px; margin-top: 0;">Hello ${name ? `<strong>${name}</strong>` : 'Chef'},</p>
        <p style="color: #44403c; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Your verification code is:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; padding: 14px 32px; background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 16px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #b45309;">
              ${otp}
            </span>
          </div>
          <p style="color: #b45309; font-size: 12px; font-weight: 600; margin-top: 10px;">
            ⏱️ Valid for ${expireMinutes} minutes
          </p>
        </div>

        <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 12px 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #9a3412; font-size: 12px; margin: 0; line-height: 1.5;">
            <strong>Security Warning:</strong> Never share this verification code with anyone. Food Recipe App representatives will never ask you for this code.
          </p>
        </div>

        <p style="color: #78716c; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
          If you did not request this verification code, please ignore this email. Your password will remain unchanged and your account is secure.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #a8a29e; font-size: 11px; margin: 0;">
          &copy; ${new Date().getFullYear()} Food Recipe App. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    email,
    subject,
    message: plainMessage,
    html,
  });
};

/**
 * Send Password Changed Confirmation Email
 */
const sendPasswordChangedEmail = async (email, name) => {
  const subject = 'Your Food Recipe App Password Was Successfully Changed';

  const plainMessage = `Hello ${name || 'Chef'},\n\nYour Food Recipe App account password was successfully updated.\n\nIf you did not make this change, please contact support or reset your password immediately.\n\nHappy cooking,\nFood Recipe App Team`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #fafaf9; border-radius: 24px; border: 1px solid #e7e5e4;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 50px; height: 50px; border-radius: 16px; background: linear-gradient(135deg, #10b981, #059669); line-height: 50px; color: #ffffff; font-size: 26px; font-weight: bold;">
          🔒
        </div>
        <h1 style="color: #1c1917; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0; letter-spacing: -0.5px;">Food Recipe App</h1>
        <p style="color: #78716c; font-size: 13px; margin: 0;">Security Notification</p>
      </div>

      <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #f5f5f4;">
        <p style="color: #292524; font-size: 15px; margin-top: 0;">Hello ${name ? `<strong>${name}</strong>` : 'Chef'},</p>
        <p style="color: #44403c; font-size: 14px; line-height: 1.6;">
          Your Food Recipe App account password was successfully changed. You can now use your new password to sign in.
        </p>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #065f46; font-size: 12px; margin: 0; line-height: 1.5;">
            If you did not perform this change, please reset your password immediately to secure your account.
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #a8a29e; font-size: 11px; margin: 0;">
          &copy; ${new Date().getFullYear()} Food Recipe App. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    email,
    subject,
    message: plainMessage,
    html,
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
};
