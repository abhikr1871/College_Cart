import React, { useEffect, useState } from "react";
import "./container.css";
import Card from "./Card";
import Sidebar from "./Sidebar"; 
import Chat from "./Chat"; 
import { getItems } from "../services/api";
import socket from "../services/socket";

function Container() {
  const [items, setItems] = useState([]); // Holds product items
  const [userId, setUserId] = useState(null); // Current user's ID
  const [userName, setUserName] = useState(""); // Current user's name
  const [notifications, setNotifications] = useState([]); // Notifications list
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar visibility
  const [chatDetails, setChatDetails] = useState(null); // Holds chat details (sellerId, sellerName)

  // Load user details from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");

    if (storedUserId) setUserId(storedUserId);
    if (storedUserName) setUserName(storedUserName);
  }, []);

  // Fetch product items
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

  // Fetch stored notifications from MongoDB
  useEffect(() => {
    if (!userId) return;

    // Notify the server that the user is online
    socket.emit("userConnected", userId);

    // Handle incoming notifications
    const handleNotification = (notif) => {
      console.log("📥 New notification received:", notif);

      // Validate notification data
      if (!notif.chatboxId || !notif.fromUser) {
        console.error("❌ Invalid notification data:", notif);
        return;
      }

      // Add the notification to the list and open the sidebar
      setNotifications((prev) => [...prev, notif]);
      setSidebarOpen(true); // Auto-open sidebar
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [userId]);

  //Handle notification click
  const handleNotificationClick = (notif) => {
    console.log("🔔 Notification clicked:", notif);

    // Validate notification data
    if (!notif.senderId || !notif.chatboxId) {
      console.error(" Missing required fields in notification:", notif);
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }

    // Set chat details and close the sidebar
    setChatDetails({
      sellerId: notif.senderId,
      sellerName: notif.senderName ,
    });
    setSidebarOpen(false); // Close sidebar when chat opens
  };

  // Close the chat
  const closeChat = () => setChatDetails(null);

  return (
    <>
      {/* Sidebar Component */}
      <Sidebar
        userName={userName}
        notifications={notifications}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNotificationClick={handleNotificationClick}
      />

      {/* Product Cards */}
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

      {/* Chat Component */}
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