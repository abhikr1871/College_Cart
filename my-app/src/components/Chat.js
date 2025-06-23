import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { getMessages } from '../services/api';
import socket from '../services/socket';

const Chat = ({ userId, sellerId, userName, sellerName, onClose }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [sellerStatus, setSellerStatus] = useState('offline');
    const [typingTimeout, setTypingTimeout] = useState(null);

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

        const handleMessageStatus = (status) => {
            console.log("📤 Message status update:", status);
            setChatHistory((prev) => 
                prev.map(msg => 
                    msg._id === status.messageId 
                        ? { ...msg, status: status.status } 
                        : msg
                )
            );
        };

        const handleUserTyping = ({ senderId, isTyping }) => {
            if (senderId === sellerId) {
                setIsTyping(isTyping);
            }
        };

        const handleUserStatus = ({ userId: statusUserId, status }) => {
            if (statusUserId === sellerId) {
                setSellerStatus(status);
            }
        };

        const handleNotification = (data) => {
            console.log("🔔 Received notification:", data);
            if (data.messageId) {
                socket.emit('markAsRead', { chatboxId, userId, messageId: data.messageId });
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('messageStatus', handleMessageStatus);
        socket.on('userTyping', handleUserTyping);
        socket.on('userStatusChanged', handleUserStatus);
        socket.on('notification', handleNotification);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('messageStatus', handleMessageStatus);
            socket.off('userTyping', handleUserTyping);
            socket.off('userStatusChanged', handleUserStatus);
            socket.off('notification', handleNotification);
        };
    }, [chatboxId, userId, sellerId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleTyping = () => {
        socket.emit('typing', { senderId: userId, receiverId: sellerId, isTyping: true });
        
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        
        setTypingTimeout(setTimeout(() => {
            socket.emit('typing', { senderId: userId, receiverId: sellerId, isTyping: false });
        }, 2000));
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const newMessage = {
            senderId: userId,
            receiverId: String(sellerId),
            senderName: String(userName),
            receiverName: String(sellerName),
            message,
            timestamp: new Date(),
            status: 'sending',
        };

        console.log("📤 Emitting sendMessage:", newMessage);
        socket.emit('sendMessage', newMessage);

        setChatHistory((prev) => [...prev, newMessage]);
        setMessage('');
    };

    const handleCloseChat = () => {
        socket.emit('markAsRead', { chatboxId, userId });
        onClose();
    };

    const getMessageStatus = (status) => {
        switch(status) {
            case 'sending': return '⌛';
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'sent_offline': return '📤';
            default: return '';
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h2>Chat with {sellerName}</h2>
                    <span className={`status-indicator ${sellerStatus}`}>
                        {sellerStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
                    </span>
                </div>
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
                            <div className="message-info">
                                <span className="timestamp">
                                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                                {msg.senderId === userId && (
                                    <span className="message-status">
                                        {getMessageStatus(msg.status)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="typing-indicator">
                        {sellerName} is typing...
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    onInput={handleTyping}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
