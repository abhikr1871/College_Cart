import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Notification from './components/Notification.js';
import useSocket from './hooks/useSocket.js';
import Sidebar from './components/Sidebar.js';

import Home from "./components/pages/Home.js";
import Login from "./components/pages/Login.js";
import Signup from "./components/pages/Signup.js";
import Buy from "./components/pages/Buy.js";
import Sell from "./components/pages/Sell.js";
import PrivateRoute from "./components/privateRoute.js";
import Profile from './components/pages/Profile.js';
import Chat from './components/Chat.js';
import { deleteNotification } from './services/api.js';
import Header from './components/header.js';

function App() {
  const [chatDetails, setChatDetails] = useState(null);
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const socketNotifications = useSocket();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  // Handle socket notifications globally
  useEffect(() => {
    if (socketNotifications.length > 0) {
      setVisibleNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const newOnes = socketNotifications.filter((n) => !existingIds.has(n._id));
        
        // Show toast notifications for new messages
        newOnes.forEach(notification => {
          if (!chatDetails || chatDetails.chatboxId !== notification.chatboxId) {
            setNotifications(prev => [...prev, notification]);
          }
        });
        
        return [...prev, ...newOnes];
      });
    }
  }, [socketNotifications, chatDetails]);

  // Auto dismiss notifications after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications([]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notifications]);

  const handleNotificationClick = (notif) => {
    if (!notif.chatboxId || !notif.senderId) {
      console.error("❌ Missing fields in notification:", notif);
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }

    // Prevent reopening if the same chatbox is already open
    if (chatDetails && chatDetails.chatboxId === notif.chatboxId) {
      // console.log("✅ Chat already open for this chatbox.");
      return;
    }

    // Set up chat details
    setChatDetails({
      userId: userId,
      userName: userName,
      sellerId: notif.senderId,
      sellerName: notif.senderName,
      chatboxId: notif.chatboxId
    });

    // Close sidebar after opening chat
    setIsSidebarOpen(false);
  };

  const handleNotificationDismiss = async (notifId) => {
    setVisibleNotifications((prev) =>
      prev.filter((n) => n._id !== notifId)
    );
    setNotifications((prev) =>
      prev.filter((n) => n._id !== notifId)
    );

    try {
      await deleteNotification(notifId);
    } catch (error) {
      console.error("❌ Failed to delete notification from backend:", error);
    }
  };

  const closeChat = () => setChatDetails(null);

  const handleChatSelect = (contact) => {
    setChatDetails({
      userId: userId,
      userName: userName,
      sellerId: contact.sellerId,
      sellerName: contact.sellerName,
      chatboxId: contact.chatboxId
    });
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header 
          onNotificationClick={() => setIsSidebarOpen(true)}
          showNotificationBadge={visibleNotifications.length > 0}
        />
        
        {/* Toast Notifications */}
        <div className="notifications-container">
          {notifications.map((notif) => (
            <Notification
              key={notif._id}
              id={notif._id}
              message={notif.message}
              senderId={notif.senderId}
              senderName={notif.senderName}
              chatboxId={notif.chatboxId}
              onClick={handleNotificationClick}
              onDismiss={handleNotificationDismiss}
              chatopened={chatDetails?.chatboxId === notif.chatboxId}
            />
          ))}
        </div>

        <Sidebar
          userName={userName}
          notifications={visibleNotifications}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNotificationClick={handleNotificationClick}
          onChatSelect={handleChatSelect}
        />

        <Routes>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/sell"
            element={
              <PrivateRoute>
                <Sell />
              </PrivateRoute>
            }
          />
        </Routes>

        {chatDetails && (
          <Chat
            userId={chatDetails.userId}
            userName={chatDetails.userName}
            sellerId={chatDetails.sellerId}
            sellerName={chatDetails.sellerName}
            onClose={closeChat}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
