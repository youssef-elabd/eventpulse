require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' },
});
app.set('io', io);
initSocket(io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] EventPulse API running on port ${PORT}`);
  });
};

start();

module.exports = server;
