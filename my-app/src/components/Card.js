import React, { useState } from "react";
import "./Card.css";
import Chat from "./Chat";

function Card({ item, userId, userName }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [sellerName, setSellerName] = useState("");

  // Handle "Contact" button click
  const handleContactClick = () => {
    console.log("Contact button clicked:", { sellerId: item?.sellerId, userId });

    setSellerId(item?.sellerId); // Set the sellerId from the item
    setSellerName(item?.sellerName || ""); // Set the sellerName from the item
    setIsChatOpen(true); // Open the chat
  };

  // Close the chat
  const closeChat = () => {
    setIsChatOpen(false);
    setSellerId(null); // Reset sellerId when chat is closed
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

          {/* Contact Button */}
          <button className="contact-btn" onClick={handleContactClick}>
            Contact
          </button>
        </div>
      </div>

      {/* Chat Component */}
      {isChatOpen && sellerId && (
        <Chat
          userId={userId} // Pass the current user's ID
          userName={userName} // Pass the current user's name
          sellerId={item?.sellerId} // Pass the seller's ID
          sellerName={item?.sellerName} // Pass the seller's name
          onClose={closeChat} // Close chat handler
        />
      )}
    </div>
  );
}

export default Card;