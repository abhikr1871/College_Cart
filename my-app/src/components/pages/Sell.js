import React, { useState } from "react";
import axios from "axios";
import FileBase from "react-file-base64";

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
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Upload Image:</label>
        <FileBase
          type="file"
          multiple={false}
          onDone={({ base64 }) =>
            setImage(base64)
          }
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default Sell;
