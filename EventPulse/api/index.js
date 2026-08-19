// Vercel serverless entry point.
// Socket.io needs a long-lived process, which serverless functions don't
// provide, so the REST API (including /health, /api-docs, and all /api
// routes) is served here, while the DB connection is established lazily
// and cached across warm invocations.
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = mongoose.connection.readyState === 1;
  }
  return app(req, res);
};
