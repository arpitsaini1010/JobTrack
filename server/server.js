require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === clientUrl || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'JobTrack API is running',
    version: '1.0.0'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);

// Serve frontend build if client/dist exists
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'JobTrack API is running (Client build not found. Run npm run build)',
      version: '1.0.0',
      apiHealth: '/api/health'
    });
  });
}

// Centralized error handler
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 JobTrack Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://0.0.0.0:${PORT}/api`);
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