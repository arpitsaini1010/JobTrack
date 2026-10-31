const express = require('express');
const router = express.Router();
const { register, login, getMe, updateTargetTitles } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/target-titles', authMiddleware, updateTargetTitles);

module.exports = router;
