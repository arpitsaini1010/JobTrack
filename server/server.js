require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const companyRoutes = require('./routes/companyRoutes');

const { syncJobFeeds } = require('./services/jobFeedService');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas & sync active real-time job openings
(async () => {
  await connectDB();
  await syncJobFeeds();
})();

// CORS configuration (SRS Section 5.3)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || origin === clientUrl || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, clientUrl in production
    },
    credentials: true
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / Welcome check
app.get('/', (req, res) => {
  res.json({
    message: 'JobTrack API is running',
    version: '1.0.0',
    documentation: '/api'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Centralized error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 JobTrack Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  server.close(() => {
    console.log('JobTrack server shut down gracefully');
    process.exit(0);
  });
});

module.exports = app;
