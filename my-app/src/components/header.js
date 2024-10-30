import React from 'react';
import './header.css';
import { Link } from 'react-router-dom';
const Header = () => {
    return (
        <header>
            <nav className="navbar">
                <div className="logo">College Cart</div>
                <ul className="nav-links">
                    <li><a href="/home">Home</a></li>
                    <li><a href="#">Buy</a></li>
                    <li><a href="#">Sell</a></li>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Link5</a></li>
                </ul>
                <div className="actions">
                <Link to="/login" className="action-btn">Login</Link>
                <Link to="/signup" className="action-btn">Sign Up</Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;
