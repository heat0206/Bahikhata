const nodemailer = require('nodemailer');
const { generateOAReminderEmail } = require('../templates/oaReminderTemplate');

let transporter = null;
let isConfigured = false;

/**
 * Initialize or retrieve the nodemailer transporter.
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const service = process.env.EMAIL_SERVICE;
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure = process.env.EMAIL_SECURE !== undefined ? process.env.EMAIL_SECURE === 'true' : port === 465;

  if ((service || host) && user && pass) {
    const transportConfig = service
      ? {
          service,
          auth: { user, pass },
        }
      : host === 'smtp.gmail.com' || host === 'gmail'
      ? {
          service: 'gmail',
          auth: { user, pass },
        }
      : {
          host,
          port,
          secure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false,
          },
        };

    transporter = nodemailer.createTransport(transportConfig);
    isConfigured = true;
    console.log(`[EmailService] SMTP transporter configured for ${service || host}`);
  } else {
    isConfigured = false;
  }

  return transporter;
}

/**
 * Allows setting a custom transporter (useful for Ethereal / integration tests).
 */
function setTransporter(customTransporter) {
  transporter = customTransporter;
  isConfigured = !!customTransporter;
}

/**
 * Send an OA Reminder email.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.userName - Recipient user's name
 * @param {string} params.companyName - Company name for the OA
 * @param {string} params.oaDate - OA date string (YYYY-MM-DD)
 * @param {string} params.oaTime - OA time string (HH:mm)
 * @returns {Promise<{ success: boolean, messageId?: string, skipped?: boolean, error?: string }>}
 */
async function sendOAReminder({ to, userName, companyName, oaDate, oaTime }) {
  if (!to) {
    return { success: false, error: 'Recipient email address is missing' };
  }

  const activeTransporter = getTransporter();

  if (!isConfigured || !activeTransporter) {
    console.warn(`[EmailService] SMTP credentials not configured. Skipping actual delivery for "${companyName}" OA reminder.`);
    return { success: false, skipped: true, reason: 'SMTP not configured' };
  }

  const { subject, text, html } = generateOAReminderEmail({
    userName,
    companyName,
    oaDate,
    oaTime,
  });

  const fromAddress = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"PrepBoard" <${process.env.EMAIL_USER}>` : '"PrepBoard" <no-reply@prepboard.com>');

  try {
    const info = await activeTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null,
    };
  } catch (error) {
    console.error(`[EmailService] Failed to send OA reminder email for "${companyName}":`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendOAReminder,
  getTransporter,
  setTransporter,
};
