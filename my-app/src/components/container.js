import React, { useEffect, useState } from "react";
import "./container.css";
import Card from "./Card";
import { getItems } from "../services/api";

function Container() {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(""); // ✅ add this

  // Fetch userId and userName from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("username"); // ✅ same as login.js

    if (storedUserId) setUserId(storedUserId);
    if (storedUserName) setUserName(storedUserName);
  }, []);

  const fetchData = async () => {
    try {
      const response = await getItems();
      setItems(response?.data);
    } catch (error) {
      console.error(error?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      {items.map((item) => (
        <Card key={item?.id} item={item} userId={userId} userName={userName} />
      ))}
    </div>
  );
}

export default Container;
