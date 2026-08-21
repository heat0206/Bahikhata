const mongoose = require('mongoose');

// Schema defines the shape of each application document in MongoDB.
// companyName and role are required — everything else is optional.
// timestamps: true adds createdAt and updatedAt automatically.
const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // temporarily false to not break existing apps without userId
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    appliedThrough: {
      type: String,
      trim: true,
      default: '',
    },
    appliedOn: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      trim: true,
      default: '',
    },
    oaDate: {
      type: String,
      trim: true,
      default: '',
    },
    oaTime: {
      type: String,
      trim: true,
      default: '',
    },
    jobLink: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    oaReminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Application', applicationSchema);
