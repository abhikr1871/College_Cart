import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Notification from './components/Notification.js';
import useSocket from './hooks/useSocket.js';

import Home from "./components/pages/Home.js";
import Login from "./components/pages/Login.js";
import Signup from "./components/pages/Signup.js";
import Buy from "./components/pages/Buy.js";
import Sell from "./components/pages/Sell.js";
import PrivateRoute from "./components/privateRoute.js";
import Profile from './components/pages/Profile.js';
import Chat from './components/Chat.js';

import Header from "./components/header";   // <-- Add this
import Sidebar from "./components/Sidebar"; // <-- Add this

import { deleteNotification } from './services/api.js';

function App() {
  const [chatDetails, setChatDetails] = useState(null);
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);  // <-- Sidebar state

  const toggleSidebar = () => setSidebarOpen(prev => !prev); // <-- Sidebar toggle

  const socketNotifications = useSocket();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  // Merge new socket notifications into visibleNotifications
  useEffect(() => {
    if (socketNotifications.length > 0) {
      setVisibleNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const newOnes = socketNotifications.filter((n) => !existingIds.has(n._id));
        return [...prev, ...newOnes];
      });
    }
  }, [socketNotifications]);

  // 🟡 Handle notification click
  const handleNotificationClick = (notif) => {
    if (!notif.chatboxId || !notif.senderId) {
      console.error("❌ Missing fields in notification:", notif);
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }

    // 🛑 Prevent reopening if the same chatbox is already open
    if (chatDetails && chatDetails.chatboxId === notif.chatboxId) {
      console.log("✅ Chat already open for this chatbox.");
      return;
    }

    // 🧠 Reverse sender and receiver from notification
    // If current user is the receiver, other is sender
    const isCurrentUserSender = notif.senderId === userId;

    const otherUserId = isCurrentUserSender ? notif.receiverId : notif.senderId;
    const otherUserName = isCurrentUserSender ? notif.receiverName : notif.senderName;

    setChatDetails({
      sellerId: otherUserId,
      sellerName: otherUserName,
      chatboxId: notif.chatboxId
    });

    // Dismiss the clicked notification
    setVisibleNotifications((prev) =>
      prev.filter((n) => n._id !== notif._id)
    );
  };

  // 🗑️ Handle notification dismiss
  const handleNotificationDismiss = async (notifId) => {
    setVisibleNotifications((prev) =>
      prev.filter((n) => n._id !== notifId)
    );

    try {
      await deleteNotification(notifId);
    } catch (error) {
      console.error("❌ Failed to delete notification from backend:", error);
    }
  };

  const closeChat = () => setChatDetails(null);

  return (
    <BrowserRouter>
      {/* Add Header & Sidebar components */}
      <Header
        toggleSidebar={toggleSidebar}
        // optionally pass other props, e.g. notifications, badge, etc.
      />
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* 🔔 Notifications */}
      <div className="notification-container">
        {visibleNotifications.map((notification) => (
          <Notification
            key={notification._id}
            id={notification._id}
            message={notification.message || notification.messageContent}
            senderId={notification.senderId}
            senderName={notification.senderName}
            chatboxId={notification.chatboxId}
            receiverId={notification.receiverId}
            receiverName={notification.receiverName}
            onClick={handleNotificationClick}
            onDismiss={handleNotificationDismiss}
          />
        ))}
      </div>

      {/* 🧭 Routes */}
      <Routes>
        <Route index element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Buy" element={<Buy />} />
        <Route path="/Profile" element={<Profile />} />
        <Route
          path="/Sell"
          element={
            <PrivateRoute>
              <Sell />
            </PrivateRoute>
          }
        />
      </Routes>

      {/* 💬 Chat Popup */}
      {chatDetails && (
        <Chat
          userId={userId}
          userName={userName}
          sellerId={chatDetails.sellerId}
          sellerName={chatDetails.sellerName}
          onClose={closeChat}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
