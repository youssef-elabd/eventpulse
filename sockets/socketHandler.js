const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('joinEvent', (eventId) => {
      if (!eventId) return;
      socket.join(`event:${eventId}`);
      socket.emit('joinedEvent', { eventId });
    });

    socket.on('leaveEvent', (eventId) => {
      if (!eventId) return;
      socket.leave(`event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
