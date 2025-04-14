import React, { useState } from 'react';
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

function App() {
  const notifications = useSocket();
  const [chatDetails, setChatDetails] = useState(null); // Holds chat details (e.g., sellerId, chatboxId)

  // Handle notification click
  const handleNotificationClick = (notif) => {
    console.log("🔔 Notification clicked:", notif);

    // Validate notification data
    if (!notif.chatboxId || !notif.senderId) {
      console.error("❌ Missing required fields in notification:", notif);
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }

    // Set chat details to open the Chat component
    setChatDetails({
      sellerId: notif.senderId,
      sellerName: notif.senderName,
      chatboxId: notif.chatboxId,
    });
  };

  // Close the chat
  const closeChat = () => setChatDetails(null);

  return (
    <BrowserRouter>
      {/* 🔔 Notification Area */}
      <div className="notification-container">
        {notifications.map((notification, index) => (
          <Notification
            key={index}
            message={notification.message || notification.messageContent}
            senderId={notification.senderId}
            senderName={notification.senderName}
            chatboxId={notification.chatboxId}
            onClick={handleNotificationClick} // Pass the click handler
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

      {/* Chat Component */}
      {chatDetails && (
        <Chat
          userId={localStorage.getItem('userId')} // Retrieve userId from localStorage
          userName={localStorage.getItem('username')} // Retrieve userName from localStorage
          sellerId={chatDetails.sellerId}
          sellerName={chatDetails.sellerName}
          onClose={closeChat}
        />
      )}
    </BrowserRouter>
  );
}

export default App;