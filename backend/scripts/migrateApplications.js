const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Application = require('../models/Application');
const connectDB = require('../config/db');

// Run via: node scripts/migrateApplications.js <user-email>
const migrateApplications = async () => {
  const emailArgs = process.argv.slice(2);
  if (emailArgs.length === 0) {
    console.error('❌ Please provide the target user email.');
    console.error('Usage: node scripts/migrateApplications.js <email>');
    process.exit(1);
  }

  const targetEmail = emailArgs[0].toLowerCase();

  try {
    // 1. Connect to DB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // 2. Verify that the supplied email belongs to an existing User
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.error(`❌ User with email "${targetEmail}" not found. Cannot proceed.`);
      process.exit(1);
    }
    console.log(`✅ Found User: ${user.name} (${user._id})`);

    // 3. Report how many applications currently have no userId
    const orphanedApps = await Application.find({ userId: { $exists: false } });
    console.log(`📊 Found ${orphanedApps.length} applications with no userId.`);

    if (orphanedApps.length === 0) {
      console.log('✨ No applications need migration. Exiting.');
      process.exit(0);
    }

    // 4. Report how many documents it will update
    console.log(`⚠️  Will assign ${orphanedApps.length} applications to user "${targetEmail}" (${user._id}).`);

    // 5. Assign the userId only to documents where userId does not exist (never overwrite an existing userId)
    const result = await Application.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: user._id } }
    );

    // 6. Report the number of documents actually updated
    console.log(`✅ Migration complete! Successfully updated ${result.modifiedCount} applications.`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

migrateApplications();
