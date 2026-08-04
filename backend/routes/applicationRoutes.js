const express = require('express');
const router = express.Router();

const {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');

// Each route maps to a controller function.
// Express calls the matching function when a request hits the route.
router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

module.exports = router;
