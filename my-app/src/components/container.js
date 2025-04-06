import React, { useEffect, useState } from "react";
import "./container.css";
import Card from "./Card";
import Sidebar from "./Sidebar"; // ✅ import sidebar
import Chat from "./Chat"; // ✅ import chat
import { getItems } from "../services/api";
import socket from "../services/socket";

function Container() {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [chatDetails, setChatDetails] = useState(null); // ✅ holds sellerId, sellerName

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("username");

    if (storedUserId) setUserId(storedUserId);
    if (storedUserName) setUserName(storedUserName);
  }, []);

  const fetchData = async () => {
    try {
      const response = await getItems();
      setItems(response?.data);
    } catch (error) {
      console.error(error?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔔 Setup socket listener for notifications
  useEffect(() => {
    if (!userId) return;

    socket.emit("userConnected", userId);

    const handleNotification = (notif) => {
      console.log("📥 New notification:", notif);
      setNotifications((prev) => [...prev, notif]);
      setSidebarOpen(true); // auto-open sidebar
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [userId]);

  // 👉 When notification is clicked
  const handleNotificationClick = (notif) => {
    setChatDetails({
      sellerId: notif.senderId,
      sellerName: notif.senderName,
    });
    setSidebarOpen(false); // close sidebar when chat opens
  };

  const closeChat = () => setChatDetails(null);

  return (
    <>
      <Sidebar
        userName={userName}
        notifications={notifications}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNotificationClick={handleNotificationClick}
      />

      <div className="container">
        {items.map((item) => (
          <Card
            key={item?.id}
            item={item}
            userId={userId}
            userName={userName}
          />
        ))}
      </div>

      {chatDetails && (
        <Chat
          userId={userId}
          userName={userName}
          sellerId={chatDetails.sellerId}
          sellerName={chatDetails.sellerName}
          onClose={closeChat}
        />
      )}
    </>
  );
}

export default Container;
