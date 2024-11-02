import React, { useState } from "react";
import "./Signup.css";
import Header from "../header";
import { signup } from "../../services/api";
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/Authcontext";
import { useEffect } from 'react';

const SignUp = () => {
  const {isAuthenticated, setIsAuthenticated} = useAuthContext();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated]);



  const handleSignup = async () => {
    // Handle sign-up logic here
    console.log("Sign Up:", { name, email, password, confirmPassword });

    let message = "hello";
    try {
      const response = await signup({ name, email, password, confirmPassword });
      console.log("response", response);
      message = response?.data?.message;
      console.log(message);
      window.alert(message);

      if (response?.data?.status === 1) {
        localStorage.setItem("token", response?.data?.data?.token);
        setIsAuthenticated(true);
        navigate('/home');
      }      
    } catch (error) {
      console.error(error?.message);
    }
    
    
  };

  return (
    <div>
      <Header />
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-form">
          <h2>Welcome to College Cart</h2>
          <h2>Register</h2>
          <input
            className="input-box"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="input-box"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="College Email"
          />
          <input
            className="input-box"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set Password"
          />
          <input
            className="input-box"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
          <button type="button" onClick={handleSignup} className="signup-button">
            Sign Up
          </button>
        </div>
        <div className="illustration">
          <img src="" alt="Isometric Illustration" />
        </div>
      </div>
    </div>
 </div> );
};

export default SignUp;
