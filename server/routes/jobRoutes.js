const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getJobFeed,
  syncJobs,
  applyAndTrack,
  simulateClose
} = require('../controllers/jobController');

// All job feed interactions require authentication
router.use(authMiddleware);

router.get('/', getJobFeed);
router.post('/sync', syncJobs);
router.post('/apply-and-track', applyAndTrack);
router.post('/:id/simulate-close', simulateClose);

module.exports = router;
