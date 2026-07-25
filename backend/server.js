const app = require('./src/app');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const notificationService = require('./src/services/notificationService');

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`WebSocket connected: ${socket.id}`);
  socket.emit('notification:count', notificationService.getUnreadCount());

  socket.on('disconnect', () => {
    console.log(`WebSocket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});