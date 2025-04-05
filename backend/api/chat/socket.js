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

    // socket.on('sendMessage', async (messageData) => {
    //   console.log('Message received:', messageData);

    //   try {
    //     const chatbox = await saveMessage(messageData);
    //     console.log('Chatbox after saving:', chatbox);

    //     if (!chatbox || !chatbox.messages.length) {
    //       console.error('Message not saved correctly');
    //       return;
    //     }

    //     const savedMessage = chatbox.messages[chatbox.messages.length - 1];
    //     console.log('Message saved to DB:', savedMessage);

    //     const receiverSocketId = userSocketMap.get(messageData.receiverId.toString());
    //     if (receiverSocketId) {
    //       io.to(receiverSocketId).emit('receiveMessage', savedMessage);
    //       io.to(receiverSocketId).emit('notification', {
    //         message: 'You have a new message!',
    //         senderId: messageData.senderId,
    //         messageContent: messageData.message,
    //       });
    //       console.log(`Message sent to ${messageData.receiverId}`);
    //     } else {
    //       console.log(`Receiver ${messageData.receiverId} is not connected`);
    //     }
    //   } catch (error) {
    //     console.error('Error saving message:', error);
    //   }
    // });

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
