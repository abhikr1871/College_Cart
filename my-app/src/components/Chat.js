import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { getMessages } from '../services/api';
import socket from '../services/socket';

const Chat = ({ userId, sellerId, userName, sellerName, onClose }) => {
    // console.log('🔗 Chat component rendered with userId:', userId, 'sellerId:', sellerId, 'userName:', userName, 'sellerName:', sellerName);
    // console.log('🔗 Data types - userId:', typeof userId, 'sellerId:', typeof sellerId);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [sellerStatus, setSellerStatus] = useState('offline');
    const [typingTimeout, setTypingTimeout] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 520 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const chatboxId = [userId, sellerId].sort().join('_');
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const handleMouseDown = (e) => {
        if (e.target.closest('.chat-header')) {
            setIsDragging(true);
            const rect = chatContainerRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && chatContainerRef.current) {
            const maxX = window.innerWidth - chatContainerRef.current.offsetWidth;
            const maxY = window.innerHeight - chatContainerRef.current.offsetHeight;
            
            let newX = e.clientX - dragOffset.x;
            let newY = e.clientY - dragOffset.y;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            setPosition({ x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

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
    //   console.log("🔌 userConnected event emitted:", userId);

        socket.emit('getUserStatus', sellerId);
    //   console.log("📊 Requesting status for seller:", sellerId);

        const handleReceiveMessage = (newMessage) => {
        //   console.log("📥 Received message via socket:", newMessage);
            setChatHistory((prev) => [...prev, newMessage]);
        };

        const handleMessageStatus = (status) => {
            // console.log("📤 Message status update:", status);
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
            // console.log(`📊 Received status update for user ${statusUserId}: ${status}`);
            if (statusUserId === sellerId || statusUserId === sellerId.toString()) {
                // console.log(`📊 Updating seller ${sellerId} status from ${sellerStatus} to: ${status}`);
                setSellerStatus(status);
            }
        };

        const handleNotification = (data) => {
            // console.log("🔔 Received notification:", data);
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

        // console.log("📤 Emitting sendMessage:", newMessage);
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
        <div 
            ref={chatContainerRef}
            className={`chat-container ${isDragging ? 'dragging' : ''}`}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="chat-header" style={{ cursor: 'grab' }}>
                <div className="chat-header-info">
                    <h2>Chat with {sellerName}</h2>
                    <span className={`status-indicator ${sellerStatus}`}>
                        {sellerStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
                        <small style={{marginLeft: '10px', fontSize: '0.7em', opacity: 0.8}}>
                            (Status: {sellerStatus})
                        </small>
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
