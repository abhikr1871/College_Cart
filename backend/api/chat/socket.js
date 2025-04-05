const { Server } = require('socket.io');
const { saveMessage } = require('./controller');

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('userConnected', (userId) => {
      userSocketMap.set(userId.toString(), socket.id); // Ensure string ID
      console.log(`User ${userId} connected with socket ID ${socket.id}`);
    });

    // Message handling
    socket.on('sendMessage', async ({ senderId, receiverId, message, senderName }) => {
      try {
        // const chatbox = await saveMessage({ senderId, receiverId, message, senderName }); // Include senderName
    
        // Send message to the receiver if online
        const receiverSocketId = userSocketMap.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', {
            senderId,
            receiverId,
            senderName,  // Send senderName to receiver
            message,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error saving or sending message:', error);
      }
    });
    

    // Disconnect
    socket.on('disconnect', () => {
      userSocketMap.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
    });
  });
}

module.exports = setupWebSocket;
