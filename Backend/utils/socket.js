const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Initialise Socket.io on the HTTP server.
 * Call once from server.js.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware: authenticate socket connection via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow unauthenticated connections (public pages); role won't be set
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Client sends its role + userId after connecting
    socket.on('join', ({ role, userId }) => {
      if (role === 'kitchen' || role === 'admin') {
        socket.join('kitchen_room');
        console.log(`Socket ${socket.id} joined kitchen_room (${role})`);
      }
      if (role === 'delivery' && userId) {
        socket.join(`delivery_${userId}`);
        console.log(`Socket ${socket.id} joined delivery_${userId}`);
      }
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.io initialised');
  return io;
};

/** Emit a new-order event to the kitchen room */
const emitNewOrder = (order) => {
  if (!io) return;
  io.to('kitchen_room').emit('new_order', order);
};

/** Emit an order-status-updated event to the specific user's room */
const emitOrderStatusUpdate = (userId, order) => {
  if (!io) return;
  io.to(`user_${userId}`).emit('order_status_updated', order);
};

const emitDeliveryAssignment = (deliveryUserId, order) => {
  if (!io || !deliveryUserId) return;
  io.to(`delivery_${deliveryUserId}`).emit('delivery_assignment', order);
};

const emitDeliveryChat = (userId, deliveryUserId, message) => {
  if (!io) return;
  if (userId) io.to(`user_${userId}`).emit('delivery_chat_message', message);
  if (deliveryUserId) io.to(`delivery_${deliveryUserId}`).emit('delivery_chat_message', message);
};

const emitDeliveryTrackingUpdate = (userId, deliveryUserId, payload) => {
  if (!io) return;
  if (userId) io.to(`user_${userId}`).emit('delivery_tracking_update', payload);
  if (deliveryUserId) io.to(`delivery_${deliveryUserId}`).emit('delivery_tracking_update', payload);
};

const getIO = () => io;

module.exports = {
  initSocket,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitDeliveryAssignment,
  emitDeliveryChat,
  emitDeliveryTrackingUpdate,
  getIO,
};
