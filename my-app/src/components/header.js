import React from "react";
import "./header.css";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/Authcontext";
import { Bell } from "lucide-react"; // notification icon

const Header = ({ onNotificationClick, showNotificationBadge }) => {
  const { isAuthenticated, setIsAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    logout();
  };

  return (
    <header>
      <nav className="navbar">
        <div className="logo">College Cart</div>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/buy">Buy</Link></li>
          <li><Link to="/sell">Sell</Link></li>
        </ul>

        <div className="actions">
          {isAuthenticated && (
            <button className="notification-icon" onClick={onNotificationClick}>
              <Bell size={22} />
              {showNotificationBadge && <span className="notification-badge" />}
            </button>
          )}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="action-btn">Login</Link>
              <Link to="/signup" className="action-btn">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="action-btn">Profile</Link>
              <div onClick={handleLogout} className="action-btn">Logout</div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
