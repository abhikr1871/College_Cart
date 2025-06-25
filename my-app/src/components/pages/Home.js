import React from "react";
import { Link } from "react-router-dom";
import './Home.css';

function Home() {
  return (
    <div className="home_container">
      <div className="main_content">
        <div className="centered-content">
          <div className="content">
            <h1>Welcome to College Cart</h1>
            <p>
              <b>Buy and sell second-hand items within your college community with ease.</b><br />
              <b>Join us in promoting sustainability and affordability on campus.</b>
            </p>
            
            <div className="features">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Buy & Sell Books</h3>
                <p>Find textbooks and study materials at affordable prices</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🚲</div>
                <h3>Campus Essentials</h3>
                <p>From bicycles to electronics, find everything you need</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Direct Chat</h3>
                <p>Connect directly with sellers through our chat system</p>
              </div>
            </div>

            <Link to="/Buy" className="cta-button">
              Start Exploring
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
