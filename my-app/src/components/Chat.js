import React, { useState, useEffect } from 'react';
import './Chat.css';
import { getMessages, sendMessage } from '../services/api'; // Correct paths
import socket from '../services/socket'; // Import socket instance

const Chat = ({ userId, sellerId, onClose }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Derive chatboxId from userId and sellerId
  const chatboxId = `${userId}_${sellerId}`;

  // Load chat history on component mount
  useEffect(() => {
    if (!userId || !sellerId) {
      console.error("userId or sellerId is undefined", { userId, sellerId });
      return; // Prevent loading chat history if IDs are missing
    }

    const loadChatHistory = async () => {
      try {
        const data = await getMessages(chatboxId);
        setChatHistory(data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    loadChatHistory();

    // Listen for incoming messages
    socket.on('receiveMessage', (newMessage) => {
      setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [chatboxId]); // Reload chat when chatboxId changes

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      senderId: userId,
      receiverId: sellerId,
      message: message,
    };

    try {
      // Send the message to the backend
      await sendMessage(newMessage);

      // Emit the message to WebSocket
      socket.emit('sendMessage', newMessage);

      // Update chat history with the new message
      setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
      setMessage(''); // Clear message input
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with {sellerId}</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="chat-history" style={{ height: '400px', overflowY: 'scroll' }}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.senderId === userId ? "sent" : "received"}`}>
            <strong>{msg.senderId === userId ? 'You' : 'Other'}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
