const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getApplications,
  getStats,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addInterview,
  updateInterview,
  deleteInterview
} = require('../controllers/applicationController');

// All application routes require authentication
router.use(authMiddleware);

// Base application routes
router.get('/', getApplications);
router.post('/', createApplication);

// Statistics endpoint (MUST come before /:id per SRS Section 7)
router.get('/stats', getStats);

// Single application operations
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

// Interview subdocument operations
router.post('/:id/interviews', addInterview);
router.put('/:id/interviews/:interviewId', updateInterview);
router.delete('/:id/interviews/:interviewId', deleteInterview);

module.exports = router;
