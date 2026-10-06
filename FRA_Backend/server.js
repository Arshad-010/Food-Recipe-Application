const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB
connectDB();

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
const isOriginAllowed = (origin) => {
  // Allow requests with no origin (like mobile apps, curl, Postman)
  if (!origin) return true;
  // Allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, 5175, 5176, 5177, 3000)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Allow local network IP addresses during development/demo (e.g. 192.168.x.x, 10.x.x.x)
  if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) return true;
  // Allow configured CLIENT_URL
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  // Allow in development mode
  if (process.env.NODE_ENV !== 'production') return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging in non-production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiLimiter);

// Static uploads directory (for local file fallback if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Food Recipe Application API is healthy and operational',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Root API Welcome Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Food Recipe App REST API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);


// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server if run directly
let server;
if (require.main === module || !process.env.TEST_MODE) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(` Food Recipe App Server is running on port: ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    if (process.env.GOOGLE_CLIENT_ID) {
      console.log(` Google OAuth: ENABLED (Client ID: ${process.env.GOOGLE_CLIENT_ID.slice(0, 16)}...)`);
    } else {
      console.warn(` Google OAuth: DISABLED (GOOGLE_CLIENT_ID missing in backend .env)`);
    }
    console.log(`===============================================`);
  });
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  }
});

module.exports = app;
