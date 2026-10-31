const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token (1 day expiry per FR-A6)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET || 'jobtrack_jwt_super_secret_key_2026_krish',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Field presence checks
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    // Password matching validation (FR-A2)
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryTargetTitle: user.primaryTargetTitle || '',
        targetJobTitles: user.targetJobTitles || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user and explicitly select password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Generic error message for both non-existent user and incorrect password (FR-A5)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryTargetTitle: user.primaryTargetTitle || '',
        targetJobTitles: user.targetJobTitles || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Please log in again' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryTargetTitle: user.primaryTargetTitle || '',
        targetJobTitles: user.targetJobTitles || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update target job titles for user
// @route   PUT /api/auth/target-titles
// @access  Private
const updateTargetTitles = async (req, res, next) => {
  try {
    const { primaryTargetTitle, targetJobTitles } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (primaryTargetTitle !== undefined) {
      user.primaryTargetTitle = primaryTargetTitle;
    }
    if (targetJobTitles !== undefined && Array.isArray(targetJobTitles)) {
      user.targetJobTitles = targetJobTitles;
    }
    await user.save();

    res.status(200).json({
      message: 'Target job titles saved successfully',
      primaryTargetTitle: user.primaryTargetTitle,
      targetJobTitles: user.targetJobTitles
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateTargetTitles
};
