import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { getMessages, sendMessage } from '../services/api';
import socket from '../services/socket';

const Chat = ({ userId, sellerId, onClose }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const chatboxId = [userId, sellerId].sort().join('_'); // consistent format
    const chatEndRef = useRef(null); // For auto-scrolling

    // Load chat history on mount
    useEffect(() => {
        if (!userId || !sellerId) {
            console.error("❌ Missing userId or sellerId", { userId, sellerId });
            return;
        }

        const loadChatHistory = async () => {
            try {
                const messages = await getMessages(chatboxId);
                setChatHistory(Array.isArray(messages) ? messages : []);
            } catch (error) {
                console.error("❌ Failed to fetch chat history:", error);
            }
        };

        loadChatHistory();

        // Socket: Listen for incoming messages
        const handleReceiveMessage = (newMessage) => {
            setChatHistory((prev) => [...prev, newMessage]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [chatboxId, userId, sellerId]);

    // Scroll to bottom when chatHistory changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Send message handler
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const newMessage = { senderId: userId, receiverId: sellerId, message };

        try {
            await sendMessage(newMessage);
            socket.emit('sendMessage', newMessage);
            setChatHistory((prev) => [...prev, newMessage]);
            setMessage('');
        } catch (error) {
            console.error("❌ Failed to send message:", error);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat with {sellerId}</h2>
                <button onClick={onClose}>Close</button>
            </div>

            <div className="chat-history">
                {chatHistory.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${msg.senderId === userId ? 'sent' : 'received'}`}
                    >
                        <strong>{msg.senderId === userId ? 'You' : 'Other'}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={chatEndRef} />
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
