import React, { useEffect, useState } from "react";
import "./container.css";
import Card from "./Card";
import { getItems } from "../services/api";

function Container() {
  const [items, setItems] = useState(null);

  const fetchData = async () => {
    try {
      const response = await getItems();
      console.log(response?.data);
    } catch (error) {
      console.error(error?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      <Card />
    </div>
  );
}
export default Container;
