import React from 'react';
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

function App() {
  const notifications = useSocket();

  return (
    <BrowserRouter>
      {/* 🔔 Notification Area */}
     <div className="notification-container">
        {notifications.map((notification, index) => (
          <Notification
            key={index}
            message={notification.message || notification.messageContent}
            senderId={notification.senderId}
            type={notification.type} // Add type prop for different styles
            messageContent={notification.messageContent}
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
    </BrowserRouter>
  );
}

export default App;
