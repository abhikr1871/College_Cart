// Chat.js
import React, { useState, useEffect } from 'react';
import './Chat.css';
import { fetchChatHistory, sendMessageToAPI } from '../services/api'; // Correct paths
import socket from '../services/socket'; // Import the configured socket instance

const Chat = ({ userId, sellerId, onClose }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Load chat history on component mount
  useEffect(() => {
    // Debugging: check if userId and contactId are passed correctly
    if (!userId || !sellerId) {
      console.error("userId or sellerId is undefined", { userId, sellerId });
      return; // Prevent loading chat history if IDs are missing
    }

    const loadChatHistory = async () => {
      try {
        const data = await fetchChatHistory(userId, sellerId);
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
  }, [userId, sellerId]); // Dependencies on userId and contactId to reload chat when they change

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
  
    const newMessage = {
      senderId: userId,      // Pass the buyer's ID
      receiverId: sellerId, // Pass the seller's ID
      message: message
    };
  
    try {
      // Send the message to the backend
      await sendMessageToAPI(newMessage);
  
      // Emit the message to the WebSocket
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
