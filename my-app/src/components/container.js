import React, { useEffect, useState } from "react";
import "./container.css";
import Card from "./Card";
import Chat from "./Chat"; // Keep only for opening chat from contact button
import { getItems } from "../services/api";
import { Search, Filter, ArrowUpDown } from 'lucide-react';

function Container() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [chatDetails, setChatDetails] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    if (storedUserId) setUserId(storedUserId);
    if (storedUserName) setUserName(storedUserName);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getItems();
      const data = response?.data || [];
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching items:", error?.message);
    }
  };

  // Filter Logic
  useEffect(() => {
    let result = [...items];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.title?.toLowerCase().includes(lowerTerm) ||
        item.description?.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Category (Assuming item has a category field, otherwise we can stub it or filter by title keywords)
    if (category !== "All") {
      // Logic: If backend has category, use it. Else, keyword matching.
      // For now, let's assume simple keyword matching if category field is missing
      result = result.filter(item =>
        item.category === category ||
        item.title?.toLowerCase().includes(category.toLowerCase()) ||
        item.description?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // 3. Sort
    if (sortBy === "price_low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price_high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      // Newest (assuming default order or if date field exists)
      // result.reverse(); // If default is old -> new
    }

    setFilteredItems(result);
  }, [items, searchTerm, category, sortBy]);

  const closeChat = () => setChatDetails(null);

  return (
    <div className="marketplace_wrapper">
      {/* Marketplace Header */}
      <div className="marketplace-header">
        <h1 className="page-title">Campus <span className="text-secondary">Marketplace</span></h1>

        <div className="controls-bar">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search available items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="sort-box">
              <ArrowUpDown size={18} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="category-pills">
          {['All', 'Books', 'Electronics', 'Vehicles', 'Stationery', 'Others'].map(cat => (
            <button
              key={cat}
              className={`pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="container">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card
              key={item?.id}
              item={item}
              userId={userId}
              userName={userName}
            />
          ))
        ) : (
          <div className="no-results">
            <h3>No items found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {chatDetails && (
        <Chat
          userId={userId}
          userName={userName}
          sellerId={chatDetails.sellerId}
          sellerName={chatDetails.sellerName}
          onClose={closeChat}
        />
      )}
    </div>
  );
}

export default Container;
