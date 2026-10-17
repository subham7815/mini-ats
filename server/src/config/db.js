const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Try loading environment variables from possible local paths if not already provided
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
  dotenv.config({ path: path.join(__dirname, '../../.env') });
  dotenv.config();
}

let mongoMemoryServer = null;

// Global cached connection for serverless environments (Vercel Functions)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

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
  // If already connected, reuse connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection promise is in-flight, await it
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  const isVercel = Boolean(process.env.VERCEL);
  const forceMemory = process.env.DEMO_MODE === 'true';

  // 1. If running on Vercel (Production Serverless)
  if (isVercel) {
    if (!uri) {
      const err = new Error(
        'MONGODB_URI environment variable is not defined on Vercel. Please set MONGODB_URI in your Vercel Project Settings.'
      );
      console.error(`❌ ${err.message}`);
      throw err;
    }

    console.log('📡 Connecting to MongoDB Atlas (Vercel Serverless)...');
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10
      })
      .then(async (m) => {
        console.log(`✅ MongoDB connected: ${m.connection.host}`);
        await checkAndSeed();
        return m;
      });

    try {
      cached.conn = await cached.promise;
      global.lastDbError = null;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      global.lastDbError = error.message;
      console.error(`❌ MongoDB connection error on Vercel: ${error.message}`);
      throw error;
    }
  }

  // 2. If running in Local Development / Test
  const localUri = uri || 'mongodb://localhost:27017/ats-app';

  if (!forceMemory) {
    try {
      console.log(`📡 Connecting to MongoDB at ${localUri}...`);
      cached.promise = mongoose
        .connect(localUri, {
          serverSelectionTimeoutMS: 2500
        })
        .then(async (m) => {
          console.log(`✅ MongoDB connected: ${m.connection.host}`);
          await checkAndSeed();
          return m;
        });

      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.log(`⚠️  No local MongoDB detected (${err.message}).`);
      console.log('🔄 Launching zero-configuration In-Memory MongoDB engine for local use...');
    }
  }

  // 3. Local fallback to In-Memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create();
    }
    const memoryUri = mongoMemoryServer.getUri();

    cached.promise = mongoose.connect(memoryUri).then(async (m) => {
      console.log(`✅ In-Memory MongoDB engine running at ${memoryUri}`);
      await checkAndSeed();
      return m;
    });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (memErr) {
    cached.promise = null;
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
      mongoMemoryServer = null;
    }
    cached.conn = null;
    cached.promise = null;
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
