const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

dns.setServers(['8.8.8.8']);

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI);

  isConnected = true;

  console.log(`[db] Connected to MongoDB: ${mongoose.connection.name}`);

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
    isConnected = false;
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
  isConnected = false;
}

module.exports = { connectDB, disconnectDB };