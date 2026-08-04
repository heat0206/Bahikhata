const Application = require('../models/Application');

// GET /api/applications
// Returns all applications, newest first
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// POST /api/applications
// Creates a new application and returns it
const createApplication = async (req, res) => {
  try {
    const application = await Application.create(req.body);
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
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the updated doc & run schema validation
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

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
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete application' });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};
