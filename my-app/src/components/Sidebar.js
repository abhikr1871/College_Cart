import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { X } from "lucide-react";
import { deleteNotification } from "../services/api"; // Import the deleteNotification API

function Sidebar({ userName, notifications, isOpen, onClose }) {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Update visible notifications when the notifications prop changes
  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Handle cross button click to remove a notification
  const handleRemoveNotification = async (notif) => {
    try {
      // Remove the notification from the frontend
      setVisibleNotifications((prev) =>
        prev.filter((notification) => notification !== notif)
      );

      // Call the backend API to delete the notification
      await deleteNotification(notif.id); // Assuming `notif.id` is the notification ID
      console.log(`✅ Notification with ID ${notif.id} deleted successfully`);
    } catch (error) {
      console.error(`❌ Failed to delete notification with ID ${notif.id}:`, error);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* ❌ Close Button */}
      <button className="close-btn" onClick={onClose}>
        <X size={24} />
      </button>

      {/* 👤 User Info */}
      <div className="sidebar-profile">
        <span className="user-circle">👤</span>
        <span className="username">{userName || "Logged In User"}</span>
      </div>

      {/* Notifications */}
      <div className="sidebar-notifications">
        <h4>Notifications</h4>
        {visibleNotifications.length === 0 ? (
          <p className="no-notif">No new notifications</p>
        ) : (
          visibleNotifications.map((notif, index) => (
            <div
              key={index}
              className="notification-item"
              onClick={(e) => e.stopPropagation()} // Disable click behavior
            >
              <b>{notif.senderName || "Unknown"}:</b> <span>{notif.message}</span>
              <button
                className="cross-btn"
                onClick={() => handleRemoveNotification(notif)}
                title="Dismiss Notification"
              >
                &#10006; {/* Cross mark symbol */}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;