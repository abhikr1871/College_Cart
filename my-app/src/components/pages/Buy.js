import React, { useState, useEffect } from "react";
import './Buy.css';
import Header from '../header';
import Container from '../container';
import Sidebar from '../Sidebar';
import { Menu } from 'lucide-react';

function Buy() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    setUserName(storedName);
  }, []);

  const handleNotificationClick = (notif) => {
    console.log("Clicked Notification", notif);
    // TODO: Open chatbox or redirect
  };

  return (
    <div className='buy_container'>
      <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={26} />
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        userName={userName}
      />

      <Container />
    </div>
  );
}

export default Buy;
