import React, { useState } from "react";
import axios from "axios";
import FileBase from "react-file-base64";
import './Sell.css';
import { createItem } from "../../services/api";

const Sell = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const userName = localStorage.getItem("userName");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Retrieve token from local storage
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to create an item");
      return;
    }

    // Decode the token to get the user info (including collegeName)
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
    const collegeName = decodedToken.collegeName;  // Extract collegeName

    if (!collegeName) {
      setError("User college information is missing");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('image', image);
    formData.append('sellerName', userName);
    formData.append('collegeName', collegeName);

    try{
      const data=await createItem(formData,token);
      setSuccess('Item created successfully!');
      setTitle("");
      setDescription("");
      setPrice("");
      setImage(null); 
    }catch(error){
      console.error('Error uploading item:', error.response ? error.response.data : error.message);
      setError('Error creating item. Please try again.');
    }
  };

  return (
    <div className="sell-container">
      <form onSubmit={handleSubmit} className="sell-form" encType="multipart/form-data">
        <h2>Enlist Your Item</h2>
        
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="input-box"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter item title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="input-box"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item"
            required
          />
        </div>

        <div className="form-group">
          <label>Price (₹)</label>
          <input
            type="number"
            className="input-box"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            min="0"
            required
          />
        </div>

        <div className="upload-container">
          <label className="upload-label">Upload Image</label>
          <FileBase
            type="file"
            multiple={false}
            onDone={({ base64 }) => setImage(base64)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" className="sell-button">
          List Item
        </button>
      </form>
    </div>
  );
};

export default Sell;
