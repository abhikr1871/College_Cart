const { Server } = require('socket.io');
const { saveMessageToDatabase } = require('./controller'); // Import the save message function

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins, adjust for your needs
      methods: ['GET', 'POST'],
    },
  });

  // Map to store user socket IDs
  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Store the socket ID for the user when they log in
    socket.on('userConnected', (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ID ${socket.id}`);
    });

    // Listen for 'sendMessage' event
    socket.on('sendMessage', async (message) => {
      console.log('Message received:', message);

      // Save message to database
      try {
        const savedMessage = await saveMessageToDatabase(message);
        console.log('Message saved to DB:', savedMessage);

        // Emit message to the receiver's socket
        const receiverSocketId = userSocketMap.get(message.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', savedMessage);
          io.to(receiverSocketId).emit('notification', {
            message: 'You have a new message!',
            senderId: message.senderId,
            messageContent: message.message,
          });
          console.log(`Message sent to ${message.receiverId}`);
        } else {
          console.log(`Receiver ${message.receiverId} is not connected`);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      // Remove user from the socket map when they disconnect
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
