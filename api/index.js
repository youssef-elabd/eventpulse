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
