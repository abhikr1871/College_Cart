import React from "react";
import "./header.css";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/Authcontext";
import { Bell, Sun, Moon } from "lucide-react"; // notification icon
import { useTheme } from "../context/ThemeContext";

const Header = ({ onNotificationClick, showNotificationBadge }) => {
  const { isAuthenticated, setIsAuthenticated, logout } = useAuthContext();
  const { theme, toggleTheme } = useTheme();

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
          {/* <li><Link to="/sell">Sell</Link></li> */}
          <li><Link to="/sell">Sell</Link></li>
          {isAuthenticated && (
            <>
              <li><Link to="/your-items">Your Items</Link></li>
              <li><Link to="/community">Community</Link></li>
            </>
          )}
        </ul>

        <div className="actions">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>

          {isAuthenticated && (
            <button className="notification-icon" onClick={onNotificationClick}>
              <Bell size={22} />
              {showNotificationBadge && <span className="notification-badge" />}
            </button>
          )}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="action-btn login">Login</Link>
              <Link to="/signup" className="action-btn signup">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="action-btn profile">Profile</Link>
              <div onClick={handleLogout} className="action-btn logout">Logout</div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
