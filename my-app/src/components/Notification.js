import React, { useState } from 'react';
import './Notification.css'; // Ensure you have some basic styling here

const Notification = ({ message, senderId, messageContent }) => {
  const [isCrossed, setIsCrossed] = useState(false);

  // Handle cross mark click to toggle the crossed-out style
  const handleCrossClick = () => {
    setIsCrossed(!isCrossed);
  };

  return (
    <div className={`notification ${isCrossed ? 'crossed' : ''}`}>
      <div className="notification-content">
        <p><strong>{senderId}</strong>: {messageContent}</p>
        <p>{message}</p>
      </div>
      <button className="cross-btn" onClick={handleCrossClick}>
        &#10006; {/* Cross mark symbol */}
      </button>
    </div>
  );
};

export default Notification;
