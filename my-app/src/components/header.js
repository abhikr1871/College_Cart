import React from "react";
import "./header.css";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/Authcontext";
const Header = () => {
  const { isAuthenticated, setIsAuthenticated, logout } = useAuthContext();

  const handleLogout = ()=>{
    logout();
  }

  return (
    <header>
      <nav className="navbar">
        <div className="logo">College Cart</div>
        <ul className="nav-links">
          <li>
            <a href="/home">Home</a>
          </li>
          <li>
            <a href="/buy">Buy</a>
          </li>
          <li>
            <a href="#">Sell</a>
          </li>
          <li>
            <a href="#">About Us</a>
          </li>
          <li>
            <a href="#">Link5</a>
          </li>
        </ul>
        <div className="actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="action-btn">
                Login
              </Link>
              <Link to="/signup" className="action-btn">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="action-btn">
                Profile
              </Link>
              <div onClick={handleLogout} className="action-btn">
                Logout
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
