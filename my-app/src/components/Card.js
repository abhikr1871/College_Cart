import React, { useState } from "react";
import "./Card.css";
import Chat from "./Chat";

function Card({ item, userId, userName }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  const handleContactClick = () => {
    console.log("Contact button clicked");
    setSellerId(item?.sellerId); 
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setSellerId(null); 
  };

  return (
    <div className="product_card">
      <div className="max-w-sm">
        <a href="#">
          <img
            className="product-image"
            src={item?.image}
            alt={item?.title || "Product Image"}
          />
        </a>
        <div className="p-5">
          <a href="#">
            <h5 className="mb-2 title">{item?.title}</h5>
          </a>
          <p className="deal">Limited time deal</p>
          <p className="price">₹{item?.price}</p>
          <p className="description">{item?.description}</p>

          <button className="contact-btn" onClick={handleContactClick}>
            Contact
          </button>
        </div>
      </div>

      {isChatOpen && (
        <Chat
          userId={userId}
          userName={userName} // ✅ Pass userName here
          sellerId={item?.sellerId}
          sellerName={item?.sellerName || "Seller"} // Optional but safe
          onClose={closeChat}
        />
      )}
    </div>
  );
}

export default Card;
