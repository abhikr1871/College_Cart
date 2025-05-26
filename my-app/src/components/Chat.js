import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { getMessages } from '../services/api';
import socket from '../services/socket';

const Chat = ({ userId, sellerId, userName, sellerName, onClose }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const chatboxId = [userId, sellerId].sort().join('_');
    const chatEndRef = useRef(null);

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const messages = await getMessages(chatboxId);
                setChatHistory(Array.isArray(messages) ? messages : []);
            } catch (error) {
                console.error("❌ Failed to fetch chat history:", error);
            } finally {
                setLoading(false);
            }
        };

        loadChatHistory();
    }, [chatboxId]);

    useEffect(() => {
        if (!userId || !sellerId) {
            console.error("Missing userId or sellerId", { userId, sellerId });
            return;
        }

        socket.emit('userConnected', userId);
        console.log("🔌 userConnected event emitted:", userId);

        const handleReceiveMessage = (newMessage) => {
            console.log("📥 Received message via socket:", newMessage);
            setChatHistory((prev) => [...prev, newMessage]);
        };

        const handleNotification = (data) => {
            console.log("🔔 Received notification:", data); // Log the entire notification data
            if (data.messageId) {
                if (window.confirm(`${data.message}\nMark as read?`)) {
                    handleNotificationClick(data.messageId);
                }
            } else {
                console.error("Notification data is missing messageId:", data);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('notification', handleNotification);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('notification', handleNotification);
        };
    }, [chatboxId, userId, sellerId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (!userId || !sellerId) return;

        // Emit "markAsRead" when the chatbox is open
        socket.emit('markAsRead', { chatboxId, userId });

        return () => {
            // Optionally, handle cleanup if needed
        };
    }, [chatboxId, userId]);

    const handleNotificationClick = (messageId) => {
        if (!messageId) {
            console.error("❌ Cannot mark notification as read: messageId is undefined");
            return;
        }

        // Emit "markAsRead" when the user clicks the notification
        socket.emit('markAsRead', { chatboxId, userId, messageId });
        alert("Notification marked as read!");
    };

    const handleSendMessage = async () => {
        console.log(sellerName);
        if (!message.trim()) return;

        const newMessage = {
            senderId: userId,
            receiverId: String(sellerId),
            senderName: String(userName),
            receiverName: String(sellerName), // <-- Added receiverName
            message,
            timestamp: new Date(),
            read: false,
        };

        console.log("\uD83D\uDCE4 Emitting sendMessage:", newMessage);
        socket.emit('sendMessage', newMessage);

        setChatHistory((prev) => [...prev, newMessage]);
        setMessage('');
    };


    const handleCloseChat = () => {
        socket.emit('markAsRead', { chatboxId, userId });
        onClose();
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat with {sellerName}</h2>
                <button onClick={handleCloseChat}>Close</button>
            </div>

            <div className="chat-history">
                {loading ? (
                    <p className="loading">Loading chat history...</p>
                ) : (
                    chatHistory.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.senderId === userId ? 'sent' : 'received'}`}
                        >
                            <strong>{msg.senderId === userId ? 'You' : msg.senderName}:</strong> {msg.message}
                            <span className="timestamp">
                                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
