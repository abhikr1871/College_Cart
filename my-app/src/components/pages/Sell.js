import React, { useState } from "react";
import './Sell.css';
import { createItem } from "../../services/api";
import { Upload, X, Tag, DollarSign, CheckCircle } from 'lucide-react';

const Sell = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brand: "",
    category: "Others",
    condition: "Good",
    negotiable: false
  });

  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = ["Books", "Electronics", "Vehicles", "Stationery", "Clothing", "Others"];
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    const base64Promises = files.map(file => convertToBase64(file));
    try {
      const base64Images = await Promise.all(base64Promises);
      // Only append unique/new images if needed, or just append all
      setImages(prev => [...prev, ...base64Images]);
    } catch (err) {
      setError("Error processing images");
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to create an item");
      return;
    }

    // Basic Validation
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const payload = {
        ...formData,
        images,
        sellerName: localStorage.getItem("userName"),
        collegeName: decodedToken.collegeName
      };

      await createItem(payload, token);

      setSuccess('Item listed successfully!');
      // Reset form
      setFormData({
        title: "", description: "", price: "", brand: "", category: "Others", condition: "Good", negotiable: false
      });
      setImages([]);

    } catch (error) {
      console.error('Error uploading item:', error);
      setError(error.response?.data?.message || 'Error creating item. Please try again.');
    }
  };

  return (
    <div className="sell-container">
      <div className="sell-card">
        <div className="sell-header">
          <h2>List Your Item</h2>
          <p>Fill in the details to reach buyers on your campus.</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-form">
          {/* Section 1: Basic Details */}
          <div className="form-section">
            <h3><Tag size={18} /> Basic Details</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Title</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Engineering Physics Textbook" required />
              </div>
              <div className="input-group">
                <label>Brand (Optional)</label>
                <input name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Pearson, Apple" />
              </div>
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe conditions, features, and reason for selling..." required />
            </div>

            <div className="input-grid">
              <div className="input-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Condition</label>
                <select name="condition" value={formData.condition} onChange={handleChange}>
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div className="form-section">
            <h3><DollarSign size={18} /> Price & details</h3>
            <div className="price-input-wrapper">
              <div className="input-group">
                <label>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" min="0" required className="price-field" />
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="negotiable" name="negotiable" checked={formData.negotiable} onChange={handleChange} />
                <label htmlFor="negotiable">Price is Negotiable</label>
              </div>
            </div>
          </div>

          {/* Section 3: Images */}
          <div className="form-section">
            <h3><Upload size={18} /> Photos ({images.length}/5)</h3>

            <div className="image-uploader-area">
              <div className="upload-button-wrapper">
                {images.length < 5 && (
                  <div className="custom-file-upload">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <div className="upload-placeholder">
                      <Upload size={24} />
                      <span>Add Photos</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="image-previews">
                {images.map((img, idx) => (
                  <div key={idx} className="preview-card">
                    <img src={img} alt="preview" />
                    <button type="button" className="remove-btn" onClick={() => removeImage(idx)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="feedback error">{error}</div>}
          {success && <div className="feedback success"><CheckCircle size={18} /> {success}</div>}

          <button type="submit" className="submit-btn">
            Post Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sell;
