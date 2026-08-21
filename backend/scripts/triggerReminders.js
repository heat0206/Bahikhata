/**
 * Manual Trigger Script for OA Reminders
 * Run anytime via: node scripts/triggerReminders.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { checkAndSendOAReminders, calculateTomorrowDate } = require('../jobs/oaReminderJob');

async function manualTrigger() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🔔 Manual OA Reminder Check');
  console.log('════════════════════════════════════════════════════════════');

  try {
    await connectDB();
    const timeZone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
    const tomorrow = calculateTomorrowDate(timeZone);

    console.log(`Timezone: ${timeZone}`);
    console.log(`Checking for upcoming OAs scheduled on: ${tomorrow}\n`);

    const result = await checkAndSendOAReminders();

    console.log('\n📊 Summary:');
    console.log(`- Eligible OAs Found : ${result.totalFound}`);
    console.log(`- Reminders Sent     : ${result.sentCount}`);
    console.log(`- Skipped (Pending)  : ${result.skippedCount}`);
    console.log(`- Failed             : ${result.failedCount}`);

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n⚠️ Notice: EMAIL_HOST / EMAIL_USER / EMAIL_PASS are not configured in backend/.env.');
      console.log('To send real emails to your inbox, configure your SMTP settings in backend/.env.');
    }
  } catch (error) {
    console.error('❌ Error during manual trigger:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

manualTrigger();
