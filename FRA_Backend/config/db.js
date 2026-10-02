const mongoose = require('mongoose');
const User = require('../models/User');
const { seedDatabase } = require('../seed/seedData');

/**
 * Ensure default demo users exist for testing & instant access
 */
async function ensureDefaultUsers() {
  try {
    let admin = await User.findOne({ email: 'admin@recipehaven.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Master Chef Admin',
        email: 'admin@recipehaven.com',
        password: 'Password@123',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
        bio: 'Executive Chef & Culinary Director at RecipeHaven.',
        preferences: {
          cuisines: ['Italian', 'French', 'Indian', 'Japanese'],
          dietType: 'None',
        },
      });
      console.log('[Auth Setup]: Created Admin user -> admin@recipehaven.com / Password@123');
    }

    let demoChef = await User.findOne({ email: 'chef@recipehaven.com' });
    if (!demoChef) {
      demoChef = await User.create({
        name: 'Sarah Jenkins',
        email: 'chef@recipehaven.com',
        password: 'Password@123',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        bio: 'Home cook passionate about Mediterranean cuisine, artisan baking and quick weeknight meals.',
        preferences: {
          cuisines: ['Mediterranean', 'Mexican', 'Thai'],
          dietType: 'Vegetarian',
        },
      });
      console.log('[Auth Setup]: Created Demo User -> chef@recipehaven.com / Password@123');
    }

    await seedDatabase(admin);
  } catch (err) {
    console.error('[Default Users Setup Error]:', err.message);
  }
}

/**
 * Connect to MongoDB database
 * Seamless fallback to MongoMemoryServer if remote cluster is unreachable (e.g. IP whitelist)
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGOOSE_URI;

  if (mongoUri) {
    try {
      console.log('[MongoDB]: Attempting connection to configured URI...');
      const conn = await mongoose.connect(mongoUri, {
        dbName: process.env.DB_NAME || 'food_recipe_db',
        serverSelectionTimeoutMS: 3500, // 3.5 seconds fast failover if remote IP not whitelisted
      });

      console.log(`[MongoDB Connected]: ${conn.connection.host} (DB: ${conn.connection.name})`);
      await ensureDefaultUsers();
      return conn;
    } catch (error) {
      console.warn(`[MongoDB Warning]: Remote MongoDB unreachable (${error.message}).`);
      console.warn('[MongoDB]: Starting seamless In-Memory MongoDB engine so app is 100% operational...');
    }
  }

  // Fallback to in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();

    const conn = await mongoose.connect(memoryUri, {
      dbName: 'food_recipe_db',
    });

    console.log(`[MongoDB In-Memory Connected]: ${memoryUri}`);
    await ensureDefaultUsers();
    return conn;
  } catch (err) {
    console.error(`[MongoDB Critical Error]: Could not start MongoDB engine: ${err.message}`);
  }
};

module.exports = connectDB;
