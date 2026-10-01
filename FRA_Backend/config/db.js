const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Supports MONGOOSE_URI and MONGODB_URI environment variables
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGOOSE_URI;
    
    if (!mongoUri) {
      throw new Error('Database connection string is missing in environment variables (MONGODB_URI or MONGOOSE_URI)');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'food_recipe_db',
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host} (DB: ${conn.connection.name})`);

    // Event listeners for connection monitoring
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error]:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Disconnected] Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // In production we would exit, but we log cleanly
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
