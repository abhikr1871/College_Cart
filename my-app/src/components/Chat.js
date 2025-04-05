import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { getMessages, sendMessage } from '../services/api';
import socket from '../services/socket';

const Chat = ({ userId, sellerId, onClose }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const chatboxId = `${userId}_${sellerId}`;
    const chatEndRef = useRef(null); // For auto-scrolling

    // Load chat history on mount
    useEffect(() => {
        if (!userId || !sellerId) {
            console.error("❌ Missing userId or sellerId", { userId, sellerId });
            return;
        }

        const loadChatHistory = async () => {
            try {
                const data = await getMessages(chatboxId);
                setChatHistory(data || []);
            } catch (error) {
                console.error("❌ Failed to fetch chat history:", error);
            }
        };

        loadChatHistory();

        // Socket: Listen for incoming messages
        const handleReceiveMessage = (newMessage) => {
            setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [chatboxId]);

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const newMessage = { senderId: userId, receiverId: sellerId, message };

        try {
            await sendMessage(newMessage);
            socket.emit('sendMessage', newMessage);
            setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
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
                    <div key={index} className={`chat-message ${msg.senderId === userId ? "sent" : "received"}`}>
                        <strong>{msg.senderId === userId ? 'You' : 'Other'}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={chatEndRef} /> {/* Auto-scroll target */}
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
