const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

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
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// Mount Routes
app.use('/api/auth', authRoutes);
// app.use('/api/recipes', recipeRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/shopping-list', shoppingListRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/admin', adminRoutes);

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server if run directly
let server;
if (require.main === module || !process.env.TEST_MODE) {
  server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Food Recipe App Server is running on port: ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
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
