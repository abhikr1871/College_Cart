import React from "react";
import "./Card.css";

function Card({ item }) {
  return (
    <div className="product_card">
      <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <a href="#">
          <img
            className="rounded-t-lg product-image"
            src={item?.image}
            alt={item?.title || "Product Image"}
          />
        </a>
        <div className="p-5">
          <a href="#">
            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {item?.title}
            </h5>
          </a>
          <p className="mb-2 text-xs font-medium text-red-500">
            Limited time deal
          </p>
          <div className="flex items-center mb-2">
            <span className="mr-1 text-sm text-yellow-500">★ ★ ★ ★ ☆</span>
            <span className="text-xs text-gray-500">({item?.reviews})</span>
          </div>
          <p className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            ₹{item?.price}
            <span className="ml-2 text-sm text-gray-500 line-through">
              ₹{item?.originalPrice}
            </span>
          </p>
          <p className="mb-3 text-xs text-gray-500">
            Save {item?.discount}% off
          </p>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            {item?.description}
          </p>
          <a
            href="#"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Add to Cart
          </a>
        </div>
      </div>
    </div>
  );
}

export default Card;
