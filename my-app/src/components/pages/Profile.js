import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // for navigation
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const storedName = localStorage.getItem("userName") || "Samantha Jones";
  const storedEmail = localStorage.getItem("userEmail") || "samantha@example.com";
  const storedBio = localStorage.getItem("userBio") || "Aspiring entrepreneur in college.";
  const storedPhoto = localStorage.getItem("userPhoto");

  const [name, setName] = useState(storedName);
  const [email, setEmail] = useState(storedEmail);
  const [bio, setBio] = useState(storedBio);
  const [photo, setPhoto] = useState(storedPhoto || "https://i.imgur.com/N2cGx7b.png");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = () => {
    if (name.trim() === "" || email.trim() === "") {
      setMessage("Name and Email cannot be empty.");
      return;
    }
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userBio", bio);
    localStorage.setItem("userPhoto", photo);
    setEditing(false);
    setMessage("Profile updated successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    navigate(-1); // go back to previous page
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <button className="close-btn" onClick={handleClose}>×</button>

        <div className="profile-photo-wrapper">
          <img className="profile-photo" src={photo} alt="Profile" />
          {editing && (
            <label className="photo-upload">
              📷
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          )}
        </div>

        <h2>Your Profile</h2>

        {message && <div className="profile-message">{message}</div>}

        <div className="profile-field">
          <label>Name:</label>
          {editing ? (
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          ) : (
            <span>{name}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Email:</label>
          {editing ? (
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          ) : (
            <span>{email}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Bio:</label>
          {editing ? (
            <textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)} />
          ) : (
            <p>{bio}</p>
          )}
        </div>

        <div className="profile-actions">
          {editing ? (
            <>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
