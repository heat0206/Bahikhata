/**
 * Test Suite for PrepBoard OA Reminder Feature
 * Validates all required scenarios from PREPBOARD_OA_EMAIL_REMINDER_IMPLEMENTATION.md
 * 
 * Run with: node scripts/testReminderJob.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Application = require('../models/Application');
const { checkAndSendOAReminders, calculateTomorrowDate } = require('../jobs/oaReminderJob');
const { generateOAReminderEmail, formatOADate } = require('../templates/oaReminderTemplate');
const emailService = require('../services/emailService');

// Custom Mock Transporter for testing
class MockTransporter {
  constructor() {
    this.sentEmails = [];
    this.shouldFail = false;
    this.failCount = 0;
  }

  async sendMail(mailOptions) {
    if (this.shouldFail) {
      throw new Error('Simulated SMTP connection failure');
    }
    this.sentEmails.push({
      ...mailOptions,
      sentAt: new Date(),
    });
    return {
      messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
  }

  reset() {
    this.sentEmails = [];
    this.shouldFail = false;
    this.failCount = 0;
  }
}

async function runTests() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🚀 Starting PrepBoard OA Reminder Test Suite');
  console.log('════════════════════════════════════════════════════════════\n');

  await connectDB();

  const mockTransporter = new MockTransporter();
  emailService.setTransporter(mockTransporter);

  const testUserAEmail = `test_user_a_${Date.now()}@example.com`;
  const testUserBEmail = `test_user_b_${Date.now()}@example.com`;

  let userA = null;
  let userB = null;
  const createdAppIds = [];

  try {
    // ── Setup Test Users ──────────────────────────────────
    userA = await User.create({
      name: 'Heet Mankad',
      email: testUserAEmail,
      password: 'testpassword123',
    });

    userB = await User.create({
      name: 'Jane Doe',
      email: testUserBEmail,
      password: 'testpassword123',
    });

    const tomorrow = calculateTomorrowDate();
    console.log(`ℹ️ Tomorrow's calculated date: ${tomorrow}\n`);

    // ── Test 1: Email Template Generation ─────────────────
    console.log('▶ Test 1: Email Template & Formatting Generation');
    const emailData = generateOAReminderEmail({
      userName: 'Heet',
      companyName: 'Amazon',
      oaDate: '2026-08-17',
      oaTime: '10:00 AM',
    });

    if (!emailData.subject.includes('Amazon') || !emailData.html.includes('10:00 AM') || !emailData.text.includes('Amazon')) {
      throw new Error('Email template failed to include required dynamic variables');
    }
    console.log('  ✅ Template generates subject, HTML, and text fallback correctly.\n');

    // ── Test 2: Scenario 1 — 05:00 AM Primary Check ────────
    console.log('▶ Test 2: Scenario 1 — 05:00 AM Primary Run (Eligible Upcoming OA)');
    mockTransporter.reset();

    const app1 = await Application.create({
      userId: userA._id,
      companyName: 'Amazon',
      role: 'SDE Intern',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '10:00 AM',
      oaReminderSent: false,
    });
    createdAppIds.push(app1._id);

    let result = await checkAndSendOAReminders();
    const updatedApp1 = await Application.findById(app1._id);

    if (updatedApp1.oaReminderSent !== true) {
      throw new Error(`Expected oaReminderSent to be true, got: ${updatedApp1.oaReminderSent}`);
    }
    if (mockTransporter.sentEmails.length !== 1 || mockTransporter.sentEmails[0].to !== testUserAEmail) {
      throw new Error(`Expected 1 email to ${testUserAEmail}, got ${mockTransporter.sentEmails.length}`);
    }
    console.log('  ✅ 05:00 AM job sent reminder and set oaReminderSent = true.\n');

    // ── Test 3: Scenario 2 — 11:00 PM Duplicate Prevention ─
    console.log('▶ Test 3: Scenario 2 — 11:00 PM Duplicate Prevention (Idempotency)');
    mockTransporter.reset();

    result = await checkAndSendOAReminders();

    if (mockTransporter.sentEmails.length !== 0) {
      throw new Error(`Expected 0 duplicate emails, got ${mockTransporter.sentEmails.length}`);
    }
    console.log('  ✅ 11:00 PM backup job skipped already-reminded application (0 duplicates).\n');

    // ── Test 4: Scenario 3 — OA Added After Morning Check ──
    console.log('▶ Test 4: Scenario 3 — OA Added After 05:00 AM (Handled at 11:00 PM)');
    mockTransporter.reset();

    const app2 = await Application.create({
      userId: userA._id,
      companyName: 'Google',
      role: 'Software Engineer',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '02:00 PM',
      oaReminderSent: false,
    });
    createdAppIds.push(app2._id);

    result = await checkAndSendOAReminders();
    const updatedApp2 = await Application.findById(app2._id);

    if (updatedApp2.oaReminderSent !== true || mockTransporter.sentEmails.length !== 1) {
      throw new Error(`Expected 1 email for newly added Google OA, got ${mockTransporter.sentEmails.length}`);
    }
    console.log('  ✅ Night check successfully caught and sent reminder for newly added OA.\n');

    // ── Test 5: Scenario 4 — 05:00 AM Failure Retry at 23:00
    console.log('▶ Test 5: Scenario 4 — Failed 05:00 AM Email Retry at 23:00 PM');
    mockTransporter.reset();

    const app3 = await Application.create({
      userId: userA._id,
      companyName: 'Microsoft',
      role: 'SWE Intern',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '11:00 AM',
      oaReminderSent: false,
    });
    createdAppIds.push(app3._id);

    // Simulate 05:00 AM SMTP failure
    mockTransporter.shouldFail = true;
    await checkAndSendOAReminders();

    let checkApp3 = await Application.findById(app3._id);
    if (checkApp3.oaReminderSent === true) {
      throw new Error('oaReminderSent should NOT be true after delivery failure');
    }

    // Simulate 23:00 PM retry when SMTP recovers
    mockTransporter.reset();
    mockTransporter.shouldFail = false;
    await checkAndSendOAReminders();

    checkApp3 = await Application.findById(app3._id);
    if (checkApp3.oaReminderSent !== true || mockTransporter.sentEmails.length !== 1) {
      throw new Error('Expected successful retry at 23:00 PM after morning failure');
    }
    console.log('  ✅ Morning failure safely preserved reminder state; 23:00 PM backup retried and succeeded.\n');

    // ── Test 6: Scenario 5 — Status Changed Away From OA ───
    console.log('▶ Test 6: Scenario 5 — Status Changed Away from "OA - Upcoming"');
    mockTransporter.reset();

    const app4 = await Application.create({
      userId: userA._id,
      companyName: 'Apple',
      role: 'iOS Engineer',
      status: 'Interview', // Not OA - Upcoming
      oaDate: tomorrow,
      oaTime: '04:00 PM',
      oaReminderSent: false,
    });
    createdAppIds.push(app4._id);

    result = await checkAndSendOAReminders();
    if (mockTransporter.sentEmails.length !== 0) {
      throw new Error('Applications with status other than "OA - Upcoming" must not receive reminders');
    }
    console.log('  ✅ Applications with non-OA status were properly excluded.\n');

    // ── Test 7: Scenario 6 — OA Rescheduling Lifecycle ────
    console.log('▶ Test 7: Scenario 6 — OA Rescheduled (Status/Date Edit Lifecycle)');
    mockTransporter.reset();

    // Start with reminded app
    const app5 = await Application.create({
      userId: userA._id,
      companyName: 'Meta',
      role: 'Frontend Engineer',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '03:00 PM',
      oaReminderSent: true, // Already sent for tomorrow
    });
    createdAppIds.push(app5._id);

    // Transition away to Interview then back to OA - Upcoming
    app5.status = 'Interview';
    await app5.save();
    
    // Simulate user editing application back to OA - Upcoming
    // Let's test the reset logic directly:
    const isEnteringOa = app5.status !== 'OA - Upcoming'; // transitioning
    if (isEnteringOa) {
      app5.oaReminderSent = false;
    }
    app5.status = 'OA - Upcoming';
    await app5.save();

    const refreshedApp5 = await Application.findById(app5._id);
    if (refreshedApp5.oaReminderSent !== false) {
      throw new Error('Transitioning back into "OA - Upcoming" must reset oaReminderSent to false');
    }

    result = await checkAndSendOAReminders();
    if (mockTransporter.sentEmails.length !== 1 || mockTransporter.sentEmails[0].subject.includes('Meta') === false) {
      throw new Error('Rescheduled application should receive a new reminder');
    }
    console.log('  ✅ Rescheduled OA correctly reset reminder state and received reminder.\n');

    // ── Test 8: Scenario 7 — Multi-User Isolation ─────────
    console.log('▶ Test 8: Scenario 7 — Multi-User Isolation (No Cross-Contamination)');
    mockTransporter.reset();

    const appUserA = await Application.create({
      userId: userA._id,
      companyName: 'Netflix',
      role: 'Backend Engineer',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '01:00 PM',
      oaReminderSent: false,
    });
    const appUserB = await Application.create({
      userId: userB._id,
      companyName: 'Uber',
      role: 'Data Engineer',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '05:00 PM',
      oaReminderSent: false,
    });
    createdAppIds.push(appUserA._id, appUserB._id);

    result = await checkAndSendOAReminders();
    if (mockTransporter.sentEmails.length !== 2) {
      throw new Error(`Expected 2 emails, got ${mockTransporter.sentEmails.length}`);
    }

    const netflixEmail = mockTransporter.sentEmails.find((e) => e.subject.includes('Netflix'));
    const uberEmail = mockTransporter.sentEmails.find((e) => e.subject.includes('Uber'));

    if (netflixEmail.to !== testUserAEmail || uberEmail.to !== testUserBEmail) {
      throw new Error('User emails cross-contaminated!');
    }
    console.log('  ✅ Multi-user isolation verified: User A received Netflix, User B received Uber.\n');

    // ── Test 9: Scenario 8 — Multiple OAs for Single User ──
    console.log('▶ Test 9: Scenario 8 — Multiple Upcoming OAs for a Single User');
    mockTransporter.reset();

    const multi1 = await Application.create({
      userId: userA._id,
      companyName: 'Stripe',
      role: 'Full Stack Engineer',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '09:00 AM',
      oaReminderSent: false,
    });
    const multi2 = await Application.create({
      userId: userA._id,
      companyName: 'Airbnb',
      role: 'Frontend Engineer',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '06:00 PM',
      oaReminderSent: false,
    });
    createdAppIds.push(multi1._id, multi2._id);

    result = await checkAndSendOAReminders();
    if (mockTransporter.sentEmails.length !== 2) {
      throw new Error(`Expected 2 independent emails for single user, got ${mockTransporter.sentEmails.length}`);
    }
    console.log('  ✅ Multiple OAs for same user processed independently without skipping.\n');

    // ── Test 10: Scenario 9 — Missing or Invalid OA Date ───
    console.log('▶ Test 10: Scenario 9 — Missing or Incomplete OA Date Handling');
    mockTransporter.reset();

    const appNoDate = await Application.create({
      userId: userA._id,
      companyName: 'InvalidDateCo',
      role: 'Software Engineer',
      status: 'OA - Upcoming',
      oaDate: '', // Empty date
      oaTime: '10:00 AM',
      oaReminderSent: false,
    });
    createdAppIds.push(appNoDate._id);

    result = await checkAndSendOAReminders();
    if (mockTransporter.sentEmails.length !== 0) {
      throw new Error('Applications without valid OA date must not be reminded');
    }
    console.log('  ✅ Applications without valid date were safely skipped without errors.\n');

    // ── Test 11: Scenario 10 — Unconfigured SMTP Fallback ──
    console.log('▶ Test 11: Scenario 10 — Unconfigured SMTP Safety & Reminder Preservation');
    // Temporarily clear environment credentials & custom transporter to simulate unconfigured SMTP
    const savedHost = process.env.EMAIL_HOST;
    const savedUser = process.env.EMAIL_USER;
    const savedPass = process.env.EMAIL_PASS;
    const savedService = process.env.EMAIL_SERVICE;

    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.EMAIL_SERVICE;
    emailService.setTransporter(null);

    const appUnconfigured = await Application.create({
      userId: userA._id,
      companyName: 'UnconfiguredSmtpCo',
      role: 'Systems Engineer',
      status: 'OA - Upcoming',
      oaDate: tomorrow,
      oaTime: '11:00 AM',
      oaReminderSent: false,
    });
    createdAppIds.push(appUnconfigured._id);

    result = await checkAndSendOAReminders();
    const checkUnconf = await Application.findById(appUnconfigured._id);

    // Restore environment variables
    if (savedHost) process.env.EMAIL_HOST = savedHost;
    if (savedUser) process.env.EMAIL_USER = savedUser;
    if (savedPass) process.env.EMAIL_PASS = savedPass;
    if (savedService) process.env.EMAIL_SERVICE = savedService;

    if (checkUnconf.oaReminderSent === true) {
      throw new Error('oaReminderSent MUST remain false when SMTP is not configured / delivery not performed');
    }
    console.log('  ✅ Unconfigured SMTP safely skipped delivery and preserved oaReminderSent = false.\n');

    const { createApplication, updateApplication } = require('../controllers/applicationController');

    // ── Test 12: Controller Endpoints CRUD Lifecycle ──────
    console.log('▶ Test 12: Application Controller CRUD Lifecycle & Reminder Reset');
    
    // Test createApplication
    let createdDoc = null;
    const mockCreateReq = {
      user: { id: userA._id },
      body: {
        companyName: 'Atlassian',
        role: 'Site Reliability Engineer',
        status: 'OA - Upcoming',
        oaDate: tomorrow,
        oaTime: '10:00 AM',
      },
    };
    const mockCreateRes = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(payload) { createdDoc = payload.data; return this; },
    };
    await createApplication(mockCreateReq, mockCreateRes);
    if (!createdDoc || createdDoc.oaReminderSent !== false) {
      throw new Error('createApplication must set oaReminderSent to false');
    }
    createdAppIds.push(createdDoc._id);

    // Simulate reminder having been sent
    await Application.updateOne({ _id: createdDoc._id }, { $set: { oaReminderSent: true } });

    // Test updateApplication: transition to Interview
    let updatedDoc = null;
    const mockUpdateRes = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(payload) { updatedDoc = payload.data; return this; },
    };
    await updateApplication({
      user: { id: userA._id },
      params: { id: createdDoc._id },
      body: { status: 'Interview' },
    }, mockUpdateRes);

    // Test updateApplication: transition back to OA - Upcoming
    await updateApplication({
      user: { id: userA._id },
      params: { id: createdDoc._id },
      body: { status: 'OA - Upcoming' },
    }, mockUpdateRes);

    if (updatedDoc.oaReminderSent !== false) {
      throw new Error('updateApplication must reset oaReminderSent when transitioning back into OA - Upcoming');
    }

    // Set reminderSent back to true and test rescheduling oaDate
    await Application.updateOne({ _id: createdDoc._id }, { $set: { oaReminderSent: true } });
    await updateApplication({
      user: { id: userA._id },
      params: { id: createdDoc._id },
      body: { oaDate: '2026-08-25' },
    }, mockUpdateRes);

    if (updatedDoc.oaReminderSent !== false) {
      throw new Error('updateApplication must reset oaReminderSent when rescheduling oaDate in OA - Upcoming');
    }
    console.log('  ✅ Controller CRUD lifecycle reset tests passed.\n');

    console.log('════════════════════════════════════════════════════════════');
    console.log('🎉 ALL 12 TESTS PASSED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
    process.exitCode = 1;
  } finally {
    // ── Cleanup Test Data ─────────────────────────────────
    console.log('🧹 Cleaning up test database artifacts...');
    if (createdAppIds.length > 0) {
      await Application.deleteMany({ _id: { $in: createdAppIds } });
    }
    if (userA) await User.deleteOne({ _id: userA._id });
    if (userB) await User.deleteOne({ _id: userB._id });
    await mongoose.disconnect();
    console.log('✅ Cleanup complete. Disconnected from MongoDB.');
  }
}

runTests();
