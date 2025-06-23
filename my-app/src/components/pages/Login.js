import React, { useState, useEffect } from "react";
import "./Login.css";
import { login, getNotifications, getUserChatboxes } from "../../services/api";
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/Authcontext";
import socket from "../../services/socket";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const { isAuthenticated, setIsAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      const response = await login({ email: username, password });
      const message = response?.data?.message;
      window.alert(message);

      if (response?.data?.status === 1) {
        const token = response?.data?.data?.token;
        const userId = response?.data?.data?.user_id;
        const userName = response?.data?.data?.name;

        // Save info
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);

        // Auth and socket
        setIsAuthenticated(true);
        setUsername("");
        setPassword("");
        socket.emit("userConnected", userId);

        // Fetch notifications and chatboxes
        try {
          const [notifData, chatboxes] = await Promise.all([
            getNotifications(userId),
            getUserChatboxes(userId)
          ]);

          // Handle notifications
          if (Array.isArray(notifData) && notifData.length > 0) {
            setNotifications(notifData);
            toast.info(`🔔 You have ${notifData.length} new message(s)! Click to view.`, {
              autoClose: false,
              onClick: () => navigate('/home?showNotifications=true'),
            });
          }

          // Handle unread messages
          const totalUnread = chatboxes.reduce((sum, chat) => sum + chat.unreadCount, 0);
          if (totalUnread > 0) {
            toast.info(`💬 You have ${totalUnread} unread message(s) in your chats!`, {
              autoClose: false,
              onClick: () => navigate('/home?showChats=true'),
            });
          }
        } catch (error) {
          console.warn("📭 Failed to fetch notifications or chatboxes:", error.message);
        }

        // Navigate only once
        navigate("/home");
      } else {
        window.alert("Token not received. Please try again.");
      }
    } catch (error) {
      console.error(error?.message);
      window.alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form">
          <h2>Welcome to College Cart</h2>
          <p>Sign into your account</p>
          <input
            className="input-box"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email address"
          />
          <input
            className="input-box"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="button" onClick={handleLogin} className="login-button">
            Log In
          </button>
          <p className="forgot-password">Forgot password?</p>
        </div>
        <div className="illustration">
          <img src="/assets/LoginImage.png" alt="Isometric Illustration" />
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
}

export default Login;
