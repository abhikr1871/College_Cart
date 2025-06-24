const { Server } = require('socket.io');
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
const { saveMessage } = require('./controller');
const sendNotification = require('../notification/utils/sendNotification');

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket']
  });

  const userSocketMap = new Map(); // userId -> socketId
  const userStatusMap = new Map(); // userId -> status (online/offline)

  io.on('connection', (socket) => {
    console.log('✅ A user connected via', socket.conn.transport.name, 'ID:', socket.id);

    // Handle user connection
    socket.on('userConnected', (userId) => {
      const userIdStr = userId.toString();
      userSocketMap.set(userIdStr, socket.id);
      userStatusMap.set(userIdStr, 'online');
      
      // Broadcast user's online status
      console.log('🔗 User connected and broadcasting as online:', userIdStr);
      socket.broadcast.emit('userStatusChanged', { userId: userIdStr, status: 'online' });
      console.log('🔗 User connected and broadcasted online:', userIdStr);

      
      console.log(`🔗 User ${userId} connected with socket ID ${socket.id}`);
    });

    // Handle checking user status
    socket.on('getUserStatus', (userId) => {
      const userIdStr = userId.toString();
      const status = userStatusMap.get(userIdStr) || 'offline';
      console.log(`📊 Status request for user ${userIdStr}: ${status}`);
      
      socket.emit('userStatusChanged', { userId: userIdStr, status });
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ senderId, receiverId, message, senderName, receiverName }) => {
      try {
        console.log('📨 sendMessage event received:', { senderId, receiverId, message });

        const chatbox = await saveMessage({ senderId, receiverId, message, senderName, receiverName });
        const chatboxId = [senderId, receiverId].sort().join('_');
        const receiverSocketId = userSocketMap.get(receiverId.toString());
        const lastMsg = chatbox.messages[chatbox.messages.length - 1];

        // Prepare message data
        const messageData = {
          senderId,
          receiverId,
          senderName,
          receiverName,
          message: lastMsg.message,
          timestamp: lastMsg.timestamp,
          status: 'sent'
        };

        // If receiver is online
        if (receiverSocketId && userStatusMap.get(receiverId.toString()) === 'online') {
          io.to(receiverSocketId).emit('receiveMessage', messageData);
          
          // Send real-time notification
          io.to(receiverSocketId).emit('notification', {
            type: 'chat',
            fromUser: senderName,
            senderId,
            message: lastMsg.message,
            chatboxId,
            messageId: lastMsg._id
          });

          // Confirm delivery to sender
          socket.emit('messageStatus', { 
            messageId: lastMsg._id, 
            status: 'delivered' 
          });
        } else {
          // Receiver is offline - create persistent notification
          console.log(`📭 Receiver ${receiverId} is offline, creating persistent notification`);
          
          await sendNotification({
            toUser: receiverId,
            fromUser: senderId,
            message: `New message from ${senderName}: ${message}`,
            chatboxId,
            messageId: lastMsg._id
          });

          // Update sender about offline status
          socket.emit('messageStatus', { 
            messageId: lastMsg._id, 
            status: 'sent_offline',
            message: 'User is currently offline. They will receive your message when they return.'
          });
        }

      } catch (error) {
        console.error('❌ Error saving or sending message:', error);
        socket.emit('messageError', { 
          error: 'Failed to send message',
          details: error.message 
        });
      }
    });

    // Handle user typing status
    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
      const receiverSocketId = userSocketMap.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { senderId, isTyping });
      }
    });

    // Handle marking messages as read
    socket.on('markAsRead', ({ chatboxId, userId, messageId }) => {
      console.log(`📖 Marking messages as read for chatbox ${chatboxId} by user ${userId}`);
      // This could be extended to update message read status in database
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      for (let [userId, socketId] of userSocketMap) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          userStatusMap.set(userId, 'offline');
          
          // Broadcast user's offline status
          socket.broadcast.emit('userStatusChanged', { userId, status: 'offline' });
          
          console.log(`❌ User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
}

module.exports = setupWebSocket;
