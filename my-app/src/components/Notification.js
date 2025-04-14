import React, { useState } from 'react';
import './Notification.css';

const Notification = ({ message, senderId, senderName, chatboxId, onClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Handle cross mark click to dismiss the notification
  const handleCrossClick = (e) => {
    e.stopPropagation(); // Prevent triggering the notification click
    setIsVisible(false);
  };

  // Handle notification click
  const handleNotificationClick = () => {
    if (!chatboxId || !senderId) {
      console.error("❌ Missing required fields in notification:", { chatboxId, senderId });
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }

    // Trigger the onClick handler passed from the parent
    onClick({
      chatboxId,
      senderId,
      senderName,
      message,
    });
  };

  // Don't render if the notification is not visible
  if (!isVisible) return null;

  return (
    <div
      className="notification"
      onClick={handleNotificationClick}
    >
      <div className="notification-content">
        <p>
          <strong>{senderName}</strong>: {message}
        </p>
      </div>
      <button className="cross-btn" onClick={handleCrossClick}>
        &#10006; {/* Cross mark symbol */}
      </button>
    </div>
  );
};

export default Notification;