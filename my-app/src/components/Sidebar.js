import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { X, Bell, MessageCircle } from "lucide-react";
import { markNotificationAsRead, getUserChatboxes } from "../services/api"; 

function Sidebar({ userName, notifications, isOpen, onClose, onNotificationClick, onChatSelect }) {
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('notifications');
  const [chatContacts, setChatContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Fetch chat contacts when sidebar opens
  useEffect(() => {
    const fetchChatContacts = async () => {
      if (!isOpen || !localStorage.getItem('userId')) return;
      
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem('userId');
        const contacts = await getUserChatboxes(userId);
        setChatContacts(contacts);
        console.log(contacts);
      } catch (error) {
        console.error('Failed to fetch chat contacts:', error);
        setError('Failed to load chat contacts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatContacts();
  }, [isOpen]);

  const handleNotificationClick = async (notif) => {
    console.log("notif", notif);
    console.log('onNotificationClick', onNotificationClick);
    console.log('notifications', notifications);
    
    // Validate that notification has required ID
    if (!notif.messageId) {
      console.error('❌ Notification missing messageId:', notif);
      return;
    }

    try {
      // Handle the notification click callback first
      if (onNotificationClick) {
        try {
          await onNotificationClick(notif);
        } catch (clickError) {
          console.error('❌ Error in onNotificationClick:', clickError);
          // Continue with marking as read even if click handler fails
        }
      }

      // Mark as read in backend first
      await markNotificationAsRead(notif.messageId);
      console.log(`✅ Notification with ID ${notif.messageId} marked as read`);

      // Only remove from UI after successful backend update
      setVisibleNotifications((prev) =>
        prev.filter((notification) => notification.messageId !== notif.messageId)
      );

    } catch (error) {
      console.error(`❌ Failed to mark notification as read with ID ${notif.messageId}:`, error);
      // Optionally show user-facing error message here
    }
  };

  const handleChatClick = (contact) => {
    console.log("contact", contact, "onChatSelect", onChatSelect);
    if (onChatSelect) {
      onChatSelect({
        sellerId: contact.otherUserId,
        sellerName: contact.otherUserName,
        chatboxId: contact.chatboxId
      });
    }
    onClose();
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            Notifications
            {visibleNotifications.length > 0 && (
              <span className="notification-badge">{visibleNotifications.length}</span>
            )}
          </button>
          <button 
            className={`tab-button ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            <MessageCircle size={20} />
            Chats
            {chatContacts.some(c => c.unreadCount > 0) && (
              <span className="notification-badge">
                {chatContacts.reduce((sum, c) => sum + c.unreadCount, 0)}
              </span>
            )}
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">
          <span className="user-circle">👤</span>
          <span className="username">{userName || "User"}</span>
        </div>
      </div>

      <div className="sidebar-content">
        {activeTab === 'notifications' ? (
          <div className="sidebar-notifications">
            {visibleNotifications.length === 0 ? (
              <div className="no-notifications">
                <p>No new notifications</p>
                <small>You're all caught up!</small>
              </div>
            ) : (
              visibleNotifications.map((notif, index) => (
                <div 
                  key={notif._id || index} 
                  className="notification-item"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <strong>{notif.fromUser}</strong>
                    </div>
                    <p className="notification-message">{notif.message}</p>
                  </div>
                  <button
                    className="dismiss-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notif);
                    }}
                    title="Dismiss Notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="sidebar-chats">
            {loading ? (
              <div className="loading-state">
                <p>Loading chats...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={() => setActiveTab('chats')}>Try Again</button>
              </div>
            ) : chatContacts.length === 0 ? (
              <div className="no-chats">
                <p>No recent chats</p>
                <small>Start a conversation from any item!</small>
              </div>
            ) : (
              chatContacts.map((contact) => (
                <div 
                  key={contact.chatboxId} 
                  className="chat-contact"
                  onClick={() => handleChatClick(contact)}
                >
                  <div className="contact-avatar">👤</div>
                  <div className="contact-info">
                    <strong>{contact.otherUserName}</strong>
                    <small>{contact.lastMessage || 'Start chatting!'}</small>
                    <span className="last-message-time">
                      {new Date(contact.lastMessageTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  {contact.unreadCount > 0 && (
                    <span className="unread-count">{contact.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
