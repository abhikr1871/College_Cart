import React, { useState, useEffect } from "react";
import Header from "../header";
import "./Login.css";
import { login } from "../../services/api";
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/Authcontext";

function Login() {
  const { isAuthenticated, setIsAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      const response = await login({ email: username, password: password });
      console.log("response", response);
      const message = response?.data?.message;
      console.log(message);
      window.alert(message);

      if (response?.data?.status === 1) {
        localStorage.setItem("token", response?.data?.data?.token);
        localStorage.setItem("userId", response?.data?.data?.user_id);
        localStorage.setItem("userName", response?.data?.data?.name); // ✅ save username

        setIsAuthenticated(true);
        setUsername("");
        setPassword("");
        navigate('/home');
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
      <Header />
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
    </div>
  );
}

export default Login;
