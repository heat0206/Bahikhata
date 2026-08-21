const Application = require('../models/Application');

// GET /api/applications
// Returns all applications, newest first
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// POST /api/applications
// Creates a new application and returns it
const createApplication = async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      userId: req.user.id,
      oaReminderSent: false, // Always initialize server-side
    };
    const application = await Application.create(applicationData);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    // Mongoose validation errors have a 'name' of 'ValidationError'
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to create application' });
  }
};

// PUT /api/applications/:id
// Updates an existing application by its MongoDB _id
const updateApplication = async (req, res) => {
  try {
    const existingApp = await Application.findOne({ _id: req.params.id, userId: req.user.id });

    if (!existingApp) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updateData = { ...req.body };

    const newStatus = updateData.status !== undefined ? updateData.status : existingApp.status;
    
    // Reset oaReminderSent to false if:
    // 1. Transitioning into "OA - Upcoming" from another status
    // 2. Already/remaining "OA - Upcoming" and oaDate or oaTime has changed
    const isEnteringOaUpcoming = newStatus === 'OA - Upcoming' && existingApp.status !== 'OA - Upcoming';
    const isOaUpcomingAndRescheduled = newStatus === 'OA - Upcoming' && (
      (updateData.oaDate !== undefined && updateData.oaDate !== existingApp.oaDate) ||
      (updateData.oaTime !== undefined && updateData.oaTime !== existingApp.oaTime)
    );

    if (isEnteringOaUpcoming || isOaUpcomingAndRescheduled) {
      updateData.oaReminderSent = false;
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true } // Return the updated doc & run schema validation
    );

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to update application' });
  }
};

// DELETE /api/applications/:id
// Deletes an application by its MongoDB _id
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete application' });
  }
};

// POST /api/applications/trigger-reminders
// Manually trigger the OA reminder check on demand
const { checkAndSendOAReminders } = require('../jobs/oaReminderJob');

const triggerRemindersManually = async (req, res) => {
  try {
    const result = await checkAndSendOAReminders();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  triggerRemindersManually,
};
