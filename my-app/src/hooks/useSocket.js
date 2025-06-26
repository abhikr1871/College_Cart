import { useEffect, useState, useCallback } from 'react';
import socket from '../services/socket';
import api from '../services/api';
import { getUserId } from '../context/Authcontext';

const useSocket = (onNewNotification) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    // Fetch stored notifications from MongoDB
    const fetchStoredNotifications = async () => {
      try {
        const stored = await api.getNotifications(userId);
        if (Array.isArray(stored)) {
          setNotifications(stored);
        }
      } catch (error) {
        console.error('Failed to fetch stored notifications:', error);
      }
    };

    fetchStoredNotifications();

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for real-time notification
    const handleNewNotification = (notif) => {
      // console.log("Received new notification:", notif);
      setNotifications(prev => {
        // Check if notification already exists
        const exists = prev.some(n => n._id === notif._id);
        if (exists) return prev;
        
        // Call the callback if provided
        if (onNewNotification) {
          onNewNotification(notif);
        }
        
        return [notif, ...prev];
      });
    };

    socket.on('notification', handleNewNotification);

    // Let backend know this user is online
    socket.emit('userConnected', userId);
    // console.log("Emitted userConnected for userId:", userId);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [onNewNotification]);

  // Add function to remove notification
  const removeNotification = useCallback((notifId) => {
    setNotifications(prev => prev.filter(n => n._id !== notifId));
  }, []);

  return { notifications, removeNotification };
};

export default useSocket;
