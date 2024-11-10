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
    <div>
     {notifications.map((notification, index) => (
        <Notification
          key={index}
          message={notification.message}
          senderId={notification.senderId}
          messageContent={notification.messageContent}
        />
      ))}

      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Buy" element={<Buy />} />
          <Route path="/Profile" element={<Profile/>}/>
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
    </div>
  );
}

export default App;
