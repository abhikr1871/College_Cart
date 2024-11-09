import React, { useState } from "react";
import "./Card.css";
import Chat from "./Chat";

function Card({ item, userId }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  // Handle Contact button click
  const handleContactClick = () => {
    console.log("Contact button clicked");
    setSellerId(item?.sellerId); 
 
    setIsChatOpen(true);
  };

  // Close chat window
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

          <button
            className="contact-btn"
            onClick={handleContactClick} // Open the chat on click
          >
            Contact
          </button>
        </div>
      </div>

      {/* Show the chat component if isChatOpen is true */}
      {isChatOpen && (
        <Chat 
          userId={userId} // Pass the userId from props
          sellerId={item?.sellerId} // Assuming the item has a sellerId field
          onClose={closeChat} // Close the chat window
        />
      )}
    </div>
  );
}

export default Card;
