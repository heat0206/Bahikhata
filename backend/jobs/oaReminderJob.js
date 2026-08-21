const Application = require('../models/Application');
const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * Calculates tomorrow's date string (YYYY-MM-DD) in the specified timezone.
 * Defaults to process.env.APP_TIMEZONE or 'Asia/Kolkata'.
 */
function calculateTomorrowDate(timeZone = process.env.APP_TIMEZONE || 'Asia/Kolkata') {
  const now = new Date();
  
  // Format current date parts in target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year').value, 10);
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10) - 1; // 0-indexed
  const day = parseInt(parts.find((p) => p.type === 'day').value, 10);

  // Construct target UTC date and advance by 1 day
  const targetDate = new Date(Date.UTC(year, month, day));
  targetDate.setUTCDate(targetDate.getUTCDate() + 1);

  const tomorrowYear = targetDate.getUTCFullYear();
  const tomorrowMonth = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const tomorrowDay = String(targetDate.getUTCDate()).padStart(2, '0');

  return `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
}

/**
 * Main reminder function.
 * Finds all OA - Upcoming applications scheduled for tomorrow that haven't been reminded yet,
 * and sends an email reminder to each user.
 */
async function checkAndSendOAReminders() {
  const timeZone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
  const tomorrowDateStr = calculateTomorrowDate(timeZone);

  console.log(`[OA Reminder] Starting reminder check for tomorrow: ${tomorrowDateStr} (Timezone: ${timeZone})`);

  let eligibleApps = [];
  try {
    eligibleApps = await Application.find({
      status: 'OA - Upcoming',
      oaDate: tomorrowDateStr,
      oaReminderSent: { $ne: true },
    }).populate('userId', 'name email');
  } catch (error) {
    console.error('[OA Reminder] Database query error while finding eligible applications:', error.message);
    return {
      success: false,
      error: error.message,
      totalFound: 0,
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
    };
  }

  const totalFound = eligibleApps.length;
  console.log(`[OA Reminder] Found ${totalFound} eligible application(s) needing reminder.`);

  if (totalFound === 0) {
    console.log('[OA Reminder] Reminder check completed. No emails needed.');
    return {
      success: true,
      totalFound: 0,
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
    };
  }

  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const app of eligibleApps) {
    // 1. Validate associated user and email
    if (!app.userId || !app.userId.email) {
      console.warn(`[OA Reminder] Application "${app.companyName}" (${app._id}) has no valid associated user or email. Skipping.`);
      skippedCount++;
      continue;
    }

    // 2. Validate OA date
    if (!app.oaDate || typeof app.oaDate !== 'string') {
      console.warn(`[OA Reminder] Application "${app.companyName}" (${app._id}) has invalid oaDate. Skipping.`);
      skippedCount++;
      continue;
    }

    // 3. Attempt email delivery
    try {
      console.log(`[OA Reminder] Sending reminder for "${app.companyName}" to user (${app.userId._id})...`);
      
      const result = await emailService.sendOAReminder({
        to: app.userId.email,
        userName: app.userId.name,
        companyName: app.companyName,
        oaDate: app.oaDate,
        oaTime: app.oaTime || '',
      });

      if (result.success) {
        // Mark as sent only after successful delivery
        await Application.updateOne(
          { _id: app._id },
          { $set: { oaReminderSent: true } }
        );
        sentCount++;
        console.log(`[OA Reminder] Reminder sent successfully for "${app.companyName}".`);
      } else if (result.skipped) {
        skippedCount++;
        console.log(`[OA Reminder] Delivery skipped for "${app.companyName}" (${result.reason || 'unconfigured'}). Reminder left pending.`);
      } else {
        failedCount++;
        console.error(`[OA Reminder] Failed to send reminder for "${app.companyName}":`, result.error);
      }
    } catch (sendError) {
      failedCount++;
      console.error(`[OA Reminder] Unexpected error sending reminder for "${app.companyName}":`, sendError.message);
    }
  }

  console.log(`[OA Reminder] Reminder check completed. Total: ${totalFound}, Sent: ${sentCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`);

  return {
    success: true,
    totalFound,
    sentCount,
    failedCount,
    skippedCount,
  };
}

module.exports = {
  checkAndSendOAReminders,
  calculateTomorrowDate,
};
