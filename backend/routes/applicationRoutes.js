const express = require('express');
const router = express.Router();

const {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');

const { protect } = require('../middleware/authMiddleware');

// Each route maps to a controller function.
// Express calls the matching function when a request hits the route.
router.get('/', protect, getApplications);
router.post('/', protect, createApplication);
router.put('/:id', protect, updateApplication);
router.delete('/:id', protect, deleteApplication);

module.exports = router;
