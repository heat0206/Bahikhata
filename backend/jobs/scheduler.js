const cron = require('node-cron');
const { checkAndSendOAReminders } = require('./oaReminderJob');

let morningTask = null;
let nightTask = null;
let isJobRunning = false;

/**
 * Wrapper to ensure only one instance of checkAndSendOAReminders executes at a time.
 */
async function runReminderJobWithLock(triggerName) {
  if (isJobRunning) {
    console.warn(`[Scheduler] Skipping ${triggerName} trigger: an OA reminder job is already running.`);
    return;
  }

  isJobRunning = true;
  console.log(`[Scheduler] Executing scheduled OA reminder check (${triggerName})...`);

  try {
    await checkAndSendOAReminders();
  } catch (error) {
    console.error(`[Scheduler] Uncaught error during ${triggerName} reminder job:`, error);
  } finally {
    isJobRunning = false;
  }
}

/**
 * Initialize the OA Reminder scheduler.
 * Runs at 05:00 AM and 11:00 PM in the configured timezone.
 */
function initScheduler() {
  const timeZone = process.env.APP_TIMEZONE || 'Asia/Kolkata';

  // Stop any existing tasks if re-initializing
  stopScheduler();

  // Morning check at 05:00 AM
  morningTask = cron.schedule(
    '0 5 * * *',
    () => {
      runReminderJobWithLock('Morning 05:00 AM');
    },
    {
      timezone: timeZone,
    }
  );

  // Night backup check at 11:00 PM (23:00)
  nightTask = cron.schedule(
    '0 23 * * *',
    () => {
      runReminderJobWithLock('Night 11:00 PM');
    },
    {
      timezone: timeZone,
    }
  );

  console.log(`[Scheduler] OA Reminder scheduler initialized. Scheduled for 05:00 AM and 11:00 PM (Timezone: ${timeZone}).`);
}

/**
 * Stop and clean up running scheduler tasks.
 */
function stopScheduler() {
  if (morningTask) {
    morningTask.stop();
    morningTask = null;
  }
  if (nightTask) {
    nightTask.stop();
    nightTask = null;
  }
}

module.exports = {
  initScheduler,
  stopScheduler,
  runReminderJobWithLock,
};
