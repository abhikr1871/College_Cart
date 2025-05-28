import React, { useState, useEffect } from "react";
import axios from "axios";
import FileBase from "react-file-base64";
import "./Sell.css";
import Sidebar from "../Sidebar";
import { Menu } from "lucide-react";

const Sell = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    setUserName(storedName);
  }, []);

  const handleNotificationClick = (notif) => {
    console.log("Clicked Notification", notif);
    // Optional: Navigate or handle based on notification
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to create an item");
      return;
    }

    let collegeName = "";
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      collegeName = decodedToken.collegeName || "";
    } catch {
      alert("Invalid token");
      return;
    }

    const payload = {
      title,
      description,
      price,
      image,
      sellerName: userName,
      collegeName,
    };

    try {
      await axios.post("http://localhost:4000/api/items/create", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Item created successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setImage(null);
    } catch (error) {
      console.error("Error uploading item:", error.response?.data || error.message);
      alert("Error creating item!");
    }
  };

  return (
    <div className="sell-page">
      <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={26} />
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        userName={userName}
      />

      <div className="sell-container" style={{ marginLeft: "280px" }}>
        <div className="sell-content">
          <form onSubmit={handleSubmit} className="sell-form">
            <h2>Enlist Your Item</h2>
            <div>
              <label>Title:</label>
              <input
                type="text"
                className="input-box"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                className="input-box"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Price:</label>
              <input
                type="number"
                className="input-box"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
              />
            </div>
            <div>
              <label className="upload-label">Upload Image:</label>
              <FileBase
                type="file"
                multiple={false}
                onDone={({ base64 }) => setImage(base64)}
              />
            </div>
            <button type="submit" className="sell-button">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sell;
