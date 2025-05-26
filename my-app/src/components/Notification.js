import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ id, message, senderId, senderName, chatboxId, onClick, onDismiss , chatopened}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer); // Cleanup
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss && id) {
      onDismiss(id); // inform parent (to mark as read or remove from state)
    }
  };

  const handleCrossClick = (e) => {
    e.stopPropagation();
    handleDismiss();
  };

  const handleNotificationClick = () => {
    if (!chatboxId || !senderId) {
      alert("This notification is incomplete and cannot open the chat.");
      return;
    }
    if(!chatopened){

      onClick?.({ chatboxId, senderId, senderName, message });
    }
      handleDismiss(); // dismiss when clicked
  };

  if (!isVisible) return null;

  return (
    <div className="notification" onClick={handleNotificationClick}>
      <div className="notification-content">
        <p>
          <strong>{senderName}</strong>: {message}
        </p>
      </div>
      <button className="cross-btn" onClick={handleCrossClick}>
        &#10006;
      </button>
    </div>
  );
};

export default Notification;
