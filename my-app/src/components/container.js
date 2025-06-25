import React, { useEffect, useState } from "react";
import "./container.css";
import Card from "./Card";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import { getItems } from "../services/api";
import socket from "../services/socket";

function Container() {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatDetails, setChatDetails] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");

    if (storedUserId) setUserId(storedUserId);
    if (storedUserName) setUserName(storedUserName);
  }, []);

  const fetchData = async () => {
    try {
      const response = await getItems();
      setItems(response?.data);
    } catch (error) {
      console.error("Error fetching items:", error?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    socket.emit("userConnected", userId);

    const handleNotification = (notif) => {
      console.log("📥 New notification received:", notif);

      if (!notif.chatboxId || !notif.fromUser) {
        console.error("❌ Invalid notification data:", notif);
        return;
      }

      setNotifications(() => [notif]);
      setSidebarOpen(true);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [userId]);

  const handleNotificationClick = (notif) => {
    console.log("🔔 Notification clicked:", notif);

    if (!notif.senderId || !notif.senderName) {
      console.error("❌ Missing required fields in notification:", notif);
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }

    setChatDetails({
      sellerId: notif.senderId,
      sellerName: notif.senderName,
    });
    setSidebarOpen(false);
  };

  const handleChatSelect = (contact) => {
    console.log("💬 Chat selected:", contact);

    if (!contact.sellerId || !contact.sellerName) {
      console.error("❌ Missing required fields in contact:", contact);
      alert("Cannot open this chat due to missing information.");
      return;
    }

    setChatDetails({
      sellerId: contact.sellerId,
      sellerName: contact.sellerName,
    });
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
        onChatSelect={handleChatSelect}
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
