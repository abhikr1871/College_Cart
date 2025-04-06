import { useEffect, useState } from 'react';
import socket from '../services/socket';
import api from '../services/api';
import { getUserId } from '../context/Authcontext';

const useSocket = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    // Fetch stored notifications from MongoDB
    const fetchStoredNotifications = async () => {
      try {
        const stored = await api.getNotifications(userId);
        setNotifications(stored || []);
      } catch (error) {
        console.error('Failed to fetch stored notifications:', error);
      }
    };

    fetchStoredNotifications();

    // Listen for real-time notification
    socket.on('notification', (notif) => {
      setNotifications((prev) => [...prev, notif]);
    });

    // Let backend know this user is online
    socket.emit('userConnected', userId);

    return () => {
      socket.off('notification');
    };
  }, []);

  return notifications;
};

export default useSocket;
