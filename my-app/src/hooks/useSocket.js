import { useState, useEffect } from 'react';
import socket from '../services/socket'; // Assuming your socket is exported from services

const useSocket = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for 'notification' event from the socket server
    socket.on('notification', (notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    // Emit user connection event
    socket.emit('userConnected', 'userId'); // Replace 'userId' with actual user ID

    // Cleanup the socket listener on component unmount
    return () => {
      socket.off('notification');
    };
  }, []);

  return notifications;
};

export default useSocket;
