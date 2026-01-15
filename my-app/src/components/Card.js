import React, { useState } from "react";
import "./Card.css";
import Chat from "./Chat";
import { MessageCircle, User, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

function Card({ item, userId, userName }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [sellerName, setSellerName] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Normalize images: use item.images array or fallback to single item.image
  const images = item?.images?.length > 0 ? item.images : [item?.image];

  const handleContactClick = () => {
    setSellerId(item?.sellerId);
    setSellerName(item?.sellerName || "");
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setSellerId(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="product_card">
        <div className="card-header">
          <div className="seller-badge">
            <User size={12} />
            <span>{item?.sellerName}</span>
          </div>
          <button
            className={`like-btn ${isLiked ? 'active' : ''}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <span className="heart-icon">♥</span>
          </button>
        </div>

        <div className="card-image-container">
          <img
            className="product-image"
            src={images[currentImgIndex]}
            alt={item?.title || "Product Image"}
          />

          {images.length > 1 && (
            <>
              <button className="nav-btn prev" onClick={prevImage}>
                <ChevronLeft size={16} />
              </button>
              <button className="nav-btn next" onClick={nextImage}>
                <ChevronRight size={16} />
              </button>
              <div className="img-indicators">
                {images.map((_, idx) => (
                  <span key={idx} className={`dot ${idx === currentImgIndex ? 'active' : ''}`} />
                ))}
              </div>
            </>
          )}

          <div className="card-badges">
            <span className="badge category">{item?.category || 'General'}</span>
            <span className={`badge condition ${item?.condition?.toLowerCase().replace(' ', '-') || 'good'}`}>
              {item?.condition || 'Good'}
            </span>
          </div>
        </div>

        <div className="card-info">
          <h3 className="product-title">{item?.title}</h3>

          <div className="price-row">
            <span className="currency">₹</span>
            <span className="amount">{item?.price}</span>
          </div>

          <div className="card-actions">
            <button className="action-btn contact-btn" onClick={handleContactClick}>
              <span className="btn-text">Contact</span>
              <MessageCircle size={18} />
            </button>
            <button
              className="action-btn buy-btn"
              onClick={(e) => {
                e.stopPropagation();
                // Add buy logic here
                console.log("Buy clicked");
              }}
            >
              <span className="btn-text">Buy</span>
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </div>

      {isChatOpen && sellerId && (
        <Chat
          userId={userId}
          userName={userName}
          sellerId={item?.sellerId}
          sellerName={item?.sellerName}
          onClose={closeChat}
        />
      )}
    </>
  );
}

export default Card;
