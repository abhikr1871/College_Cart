const { Server } = require('socket.io');
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
const { saveMessage } = require('./controller'); // saveMessage includes notification
const Chatbox = require('./model');

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket']
  });

  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    console.log('✅ A user connected via', socket.conn.transport.name, 'ID:', socket.id);

    socket.on('userConnected', (userId) => {
      userSocketMap.set(userId.toString(), socket.id);
      console.log(`🔗 User ${userId} connected with socket ID ${socket.id}`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, senderName }) => {
      try {
        console.log('📨 sendMessage event received:', { senderId, receiverId, message });

        const chatbox = await saveMessage({ senderId, receiverId, message, senderName });
        const chatboxId = [senderId, receiverId].sort().join('_');

        const receiverSocketId = userSocketMap.get(receiverId.toString());

        if (receiverSocketId) {
          const lastMsg = chatbox.messages[chatbox.messages.length - 1];

          io.to(receiverSocketId).emit('receiveMessage', {
            senderId,
            receiverId,
            senderName,
            message: lastMsg.message,
            timestamp: lastMsg.timestamp
          });

          io.to(receiverSocketId).emit('notification', {
            type: 'chat',
            fromUser: senderName,
            message: `New message from ${senderName}`,
            chatboxId
          });
        } else {
          console.log(`📭 Receiver ${receiverId} is not currently connected`);
        }

      } catch (error) {
        console.error('❌ Error saving or sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      for (let [userId, socketId] of userSocketMap) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`❌ User ${userId} disconnected`);
          break;
        }
      }
    });
  });
}

module.exports = setupWebSocket;
