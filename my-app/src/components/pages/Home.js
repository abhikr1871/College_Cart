import React from "react";
import { Link } from "react-router-dom";
import { Book, Bike, MessageCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home_container">


      <div className="main_content">
        <div className="hero-section">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>#1 Marketplace for Students</span>
          </div>

          <h1 className="hero-title">
            College<span className="text-gradient">Cart</span>
          </h1>

          <p className="hero-subtitle">
            The smartest way to buy and sell campus essentials.
            <br />Sustainable, affordable, and built for your community.
          </p>

          <Link to="/buy" className="cta-button">
            Start Exploring <ArrowRight size={20} />
          </Link>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper glass-blue">
              <Book size={24} />
            </div>
            <h3>Textbooks & Notes</h3>
            <p>Find course materials from seniors at a fraction of the cost.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper glass-purple">
              <Bike size={24} />
            </div>
            <h3>Campus Essentials</h3>
            <p>From cycles to kettles, everything you need for dorm life.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper glass-pink">
              <MessageCircle size={24} />
            </div>
            <h3>Instant Chat</h3>
            <p>Connect directly with verified students. No middlemen.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper glass-green">
              <ShieldCheck size={24} />
            </div>
            <h3>Safe & Secure</h3>
            <p>Verified profiles ensure a trusted community environment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
