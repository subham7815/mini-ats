const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const candidateRoutes = require('./routes/candidateRoutes');
const jobRoutes = require('./routes/jobRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const searchRoutes = require('./routes/searchRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// Dynamic CORS configuration supporting Vercel deployments and local development
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://mini-ats-one.vercel.app'
];

if (process.env.CLIENT_URL) {
  defaultOrigins.push(process.env.CLIENT_URL.replace(/\/+$/, ''));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, serverless health probes)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (
        defaultOrigins.includes(normalizedOrigin) ||
        /\.vercel\.app$/.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Rate limiting (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 1. Root endpoints
const rootInfo = {
  message: 'Mini ATS API is running',
  status: 'OK',
  version: '1.0.0',
  documentation: {
    health: '/api/health',
    jobs: '/api/jobs',
    candidates: '/api/candidates',
    dashboard: {
      metrics: '/api/dashboard/metrics',
      pipeline: '/api/dashboard/pipeline',
      applicationsOverTime: '/api/dashboard/applications-over-time',
      sources: '/api/dashboard/sources',
      activity: '/api/dashboard/activity'
    },
    search: '/api/search?q={query}'
  }
};

app.get('/', (req, res) => {
  res.status(200).json(rootInfo);
});

app.get('/api', (req, res) => {
  res.status(200).json(rootInfo);
});

// 2. Health check endpoint (always responds even if DB is still connecting)
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'ATS API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStates[mongoose.connection.readyState] || 'unknown',
      connected: isDbConnected
    }
  });
});

// 3. Database connection middleware for functional API endpoints
app.use(async (req, res, next) => {
  // Root and health checks do not require active DB connection
  if (req.path === '/' || req.path === '/api' || req.path === '/api/health') {
    return next();
  }

  try {
    const connectDB = require('./config/db');
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in request handler:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection error. Please verify MONGODB_URI in your Vercel Project Settings.',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
});

// 4. API Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

// 5. 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    status: 404
  });
});

// 6. Global error handler
app.use(errorHandler);

module.exports = app;
