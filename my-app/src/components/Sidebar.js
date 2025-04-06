import React from "react";
import "./Sidebar.css";
import { X } from "lucide-react";

function Sidebar({ userName, notifications, onNotificationClick, isOpen, onClose }) {
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

      {/* 🔔 Notifications */}
      <div className="sidebar-notifications">
        <h4>Notifications</h4>
        {notifications.length === 0 ? (
          <p className="no-notif">No new notifications</p>
        ) : (
          notifications.map((notif, index) => (
            <div
              key={index}
              className="notification-item"
              onClick={() => onNotificationClick(notif)}
            >
              <b>{notif.senderName}:</b> <span>{notif.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
