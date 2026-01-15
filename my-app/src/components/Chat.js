import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { getMessages } from '../services/api';
import socket from '../services/socket';
import { X, Send } from 'lucide-react'; // Assuming lucide-react is installed

const Chat = ({ userId, sellerId, userName, sellerName, onClose }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [sellerStatus, setSellerStatus] = useState('offline');
    const [typingTimeout, setTypingTimeout] = useState(null);

    const chatboxId = [userId, sellerId].sort().join('_');
    const chatEndRef = useRef(null);

    // Initial load
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

        // Mark as read immediately when opening
        socket.emit('markAsRead', { chatboxId, userId });

    }, [chatboxId, userId]);

    // Socket listeners
    useEffect(() => {
        if (!userId || !sellerId) return;

        socket.emit('userConnected', userId);
        socket.emit('getUserStatus', sellerId);

        const handleReceiveMessage = (newMessage) => {
            if (newMessage.chatboxId && newMessage.chatboxId !== chatboxId) return; // Ignore other chats

            setChatHistory((prev) => [...prev, newMessage]);

            // Mark as read if window is open
            socket.emit('markAsRead', { chatboxId, userId, messageId: newMessage._id });
        };

        const handleMessageSent = ({ tempId, _id, status, timestamp }) => {
            setChatHistory((prev) =>
                prev.map(msg =>
                    msg.tempId === tempId
                        ? { ...msg, _id, status, timestamp } // Update optimistic message with real ID
                        : msg
                )
            );
        };

        const handleMessageStatus = (status) => {
            setChatHistory((prev) =>
                prev.map(msg =>
                    msg._id === status.messageId
                        ? { ...msg, status: status.status === 'sent_offline' ? 'sent' : status.status }
                        : msg
                )
            );
        };

        const handleMessagesRead = ({ chatboxId: rChatboxId, readerId }) => {
            if (rChatboxId === chatboxId && String(readerId) === String(sellerId)) {
                // The other person read our messages
                setChatHistory(prev => prev.map(msg =>
                    (msg.senderId === userId || msg.senderId === Number(userId))
                        ? { ...msg, read: true, status: 'read' }
                        : msg
                ));
            }
        };

        const handleUserTyping = ({ senderId, isTyping }) => {
            if (String(senderId) === String(sellerId)) {
                setIsTyping(isTyping);
            }
        };

        const handleUserStatus = ({ userId: statusUserId, status }) => {
            if (String(statusUserId) === String(sellerId)) {
                setSellerStatus(status);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('messageStatus', handleMessageStatus);
        socket.on('messageSent', handleMessageSent); // New listener
        socket.on('messagesRead', handleMessagesRead);
        socket.on('userTyping', handleUserTyping);
        socket.on('userStatusChanged', handleUserStatus);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('messageStatus', handleMessageStatus);
            socket.off('messageSent', handleMessageSent);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('userTyping', handleUserTyping);
            socket.off('userStatusChanged', handleUserStatus);
        };
    }, [chatboxId, userId, sellerId]);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isTyping]);

    const handleTyping = () => {
        socket.emit('typing', { senderId: userId, receiverId: sellerId, isTyping: true });
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(setTimeout(() => {
            socket.emit('typing', { senderId: userId, receiverId: sellerId, isTyping: false });
        }, 2000));
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const tempId = Date.now().toString(); // Temporary ID for optimistic UI
        const newMessage = {
            senderId: userId,
            receiverId: String(sellerId),
            senderName: String(userName),
            receiverName: String(sellerName),
            message,
            timestamp: new Date(),
            status: 'sending',
            read: false,
            tempId, // Track locally
        };

        socket.emit('sendMessage', newMessage);
        setChatHistory((prev) => [...prev, newMessage]);
        setMessage('');
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusIcon = (msg) => {
        if (msg.read || msg.status === 'read') return <span className="read-receipt read">✓✓</span>;
        if (msg.status === 'delivered') return <span className="read-receipt">✓✓</span>;
        if (msg.status === 'sent') return <span className="read-receipt">✓</span>;
        if (msg.status === 'sending') return <span className="read-receipt">🕒</span>;
        return null;
    };

    // Date grouping helper
    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const groupedMessages = groupMessagesByDate(chatHistory);

    return (
        <div className="chat-widget">
            <div className="chat-header" onClick={() => {/* Future: minimize logic */ }}>
                <div className="chat-header-info">
                    <h2>{sellerName}</h2>
                    <span className="status-indicator">
                        <span className={`status-dot ${sellerStatus}`}></span>
                        {sellerStatus === 'online' ? 'Online' : 'Offline'}
                    </span>
                </div>
                <button className="close-chat-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="chat-messages">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Loading...</div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="date-separator">
                                <span>{new Date(date).toDateString() === new Date().toDateString() ? 'Today' : date}</span>
                            </div>
                            {msgs.map((msg, index) => {
                                const isMe = String(msg.senderId) === String(userId) || (msg.senderName === userName);
                                return (
                                    <div key={index} className={`message-group ${isMe ? 'sent' : 'received'}`}>
                                        {!isMe && <span className="message-sender-name">{msg.senderName}</span>}
                                        <div className="message-bubble">
                                            {msg.message}
                                        </div>
                                        <div className="message-meta">
                                            {formatTime(msg.timestamp)}
                                            {isMe && getStatusIcon(msg)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}

                {isTyping && (
                    <div className="typing-container">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    onInput={handleTyping}
                    placeholder="Type a message..."
                />
                <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default Chat;
