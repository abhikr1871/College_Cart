import React from "react";
import "./Card.css";

function Card({ item }) {
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
          <a
            href="#"
            className="contact-btn"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}

export default Card;
