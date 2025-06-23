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

  const handleNotificationClick = (notif) => {
    if (!notif.chatboxId || !notif.senderId) {
      console.error("❌ Missing fields in notification:", notif);
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }

    // Prevent reopening if the same chatbox is already open
    if (chatDetails && chatDetails.chatboxId === notif.chatboxId) {
      console.log("✅ Chat already open for this chatbox.");
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

    try {
      await deleteNotification(notifId);
    } catch (error) {
      console.error("❌ Failed to delete notification from backend:", error);
    }
  };

  const closeChat = () => setChatDetails(null);

  return (
    <BrowserRouter>
      <Header 
        onNotificationClick={() => setIsSidebarOpen(true)}
        showNotificationBadge={visibleNotifications.length > 0}
      />
      
      <Sidebar
        userName={userName}
        notifications={visibleNotifications}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNotificationClick={handleNotificationClick}
      />

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

      {chatDetails && (
        <Chat
          userId={chatDetails.userId}
          userName={chatDetails.userName}
          sellerId={chatDetails.sellerId}
          sellerName={chatDetails.sellerName}
          onClose={closeChat}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
