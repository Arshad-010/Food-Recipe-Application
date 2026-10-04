/**
 * Standalone Seed Script Entry Point
 * Can be run via: npm run seed or node FRA_Backend/seed/index.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const { sampleRecipes, seedDatabase } = require('./seedData');
const User = require('../models/User');

const runStandaloneSeed = async () => {
  try {
    console.log('[Seed Runner]: Connecting to database...');
    await connectDB();

    const admin = await User.findOne({ email: 'admin@recipehaven.com' });
    if (!admin) {
      console.log('[Seed Runner]: Admin user not found. Ensure default users first.');
      process.exit(1);
    }

    console.log('[Seed Runner]: Running database seed...');
    await seedDatabase(admin);
    console.log('[Seed Runner]: Seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Runner Error]:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runStandaloneSeed();
}

module.exports = {
  sampleRecipes,
  seedDatabase,
  runStandaloneSeed,
};
