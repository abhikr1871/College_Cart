import React, { useState } from "react";
import "./Card.css";
import Chat from "./Chat";

function Card({ item, userId, userName }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [sellerName, setSellerName] = useState("");

  const handleContactClick = () => {
    // console.log("Contact button clicked:", { sellerId: item?.sellerId, userId });

    setSellerId(item?.sellerId);
    setSellerName(item?.sellerName || "");
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setSellerId(null);
  };

  return (
    <div className="product_card">
      <div className="card-content">
        <img
          className="product-image"
          src={item?.image}
          alt={item?.title || "Product Image"}
        />
        <div className="card-body">
          <p className="seller">{item?.sellerName}</p>
          <h5 className="title">{item?.title}</h5>
          <p className="deal">🔥 Limited time deal</p>
          <p className="price">₹{item?.price}</p>
          <p className="description">{item?.description}</p>
          <button className="contact-btn" onClick={handleContactClick}>
            Contact
          </button>
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
    </div>
  );
}

export default Card;
