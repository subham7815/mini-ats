const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

let mongoMemoryServer = null;

const checkAndSeed = async () => {
  try {
    const Job = require('../models/Job');
    const count = await Job.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Auto-seeding initial recruitment data...');
      const { seedData } = require('../scripts/seed');
      await seedData(false);
    }
  } catch (err) {
    console.warn('⚠️  Auto-seed notice:', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-app';
  const forceMemory = process.env.DEMO_MODE === 'true';

  if (!forceMemory) {
    try {
      console.log(`📡 Connecting to MongoDB at ${uri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      await checkAndSeed();
      return conn;
    } catch (err) {
      console.log(`⚠️  No local MongoDB detected (${err.message}).`);
      console.log('🔄 Launching zero-configuration In-Memory MongoDB engine...');
    }
  }

  // Fallback to in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB engine running at ${memoryUri}`);
    await checkAndSeed();
    return conn;
  } catch (memErr) {
    console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
    throw memErr;
  }
};

const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (e) {
    // Ignore close errors
  }
};

process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = connectDB;
module.exports.closeDB = closeDB;
