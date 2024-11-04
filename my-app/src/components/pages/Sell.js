import React, { useState } from "react";
import axios from "axios";
import FileBase from "react-file-base64";
import Header from "../header"
import './Sell.css'

const Sell = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('image', image);

    try {
        const response = await axios.post('http://localhost:4000/api/items/create', formData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Item created:', response.data);
        // Optionally reset the form or show a success message
    } catch (error) {
        console.error('Error uploading item:', error.response ? error.response.data : error.message);
        // Optionally show an error message to the user
    }
};

  return (
    <div>
    <Header />
    <div className="sell-container">
    <div className="sell-content">
      <form onSubmit={handleSubmit} className="sell-form" encType="multipart/form-data">
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
        <button type="submit" className="sell-button">Submit</button>
      </form>
    </div>
  </div>
  </div>
  );
};

export default Sell;
