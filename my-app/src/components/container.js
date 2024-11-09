import React, { useEffect, useState } from "react";
import "./container.css";
import Card from "./Card";
import { getItems } from "../services/api";

function Container() {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);

  // Fetch userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const fetchData = async () => {
    try {
      const response = await getItems();
      console.log(response?.data);
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
        <Card key={item?.id} item={item} userId={userId} /> 
      ))}
    </div>
  );
}

export default Container;
