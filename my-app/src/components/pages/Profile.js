import React, { useEffect, useState } from "react";
import "./Profile.css";
import FileBase from "react-file-base64";
import { getUserProfile, updateUserProfile, uploadProfileImage, getItems, getUserChatboxes } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MessageCircle } from "lucide-react";
import Chat from "../Chat";
import axios from "axios";

function Profile() {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    collegeName: "",
    profilePic: "",
  });
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [chatContacts, setChatContacts] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const suggestionsRef = React.useRef(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const data = await getUserProfile(userId);
        setProfile({
          name: data.name,
          email: data.email,
          collegeName: data.collegeName,
          profilePic: data.profilePic || "",
        });
      } catch (err) {
        toast.error("Failed to load profile");
      }
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    async function fetchItemsAndChats() {
      // Fetch all items and filter by sellerName
      const itemsRes = await getItems();
      setMyItems((itemsRes.data || itemsRes).filter(item => item.sellerName === userName));
      // Fetch chat contacts (Sidebar logic)
      const contacts = await getUserChatboxes(userId);
      setChatContacts(Array.isArray(contacts) ? contacts : []);
    }
    fetchItemsAndChats();
  }, [userId, userName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setCollegeSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCollegeNameChange = async (e) => {
    const value = e.target.value;
    setProfile((prev) => ({ ...prev, collegeName: value }));
    if (value) {
      try {
        const response = await axios.get(`http://universities.hipolabs.com/search?name=${value}&country=India`);
        setCollegeSuggestions(response.data);
      } catch (error) {
        setCollegeSuggestions([]);
      }
    } else {
      setCollegeSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setProfile((prev) => ({ ...prev, collegeName: name }));
    setCollegeSuggestions([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    let updatedData = { ...profile };
    try {
      // If new image selected, upload to S3 first
      if (imageBase64) {
        toast.info("Uploading profile image...");
        const url = await uploadProfileImage(
          imageBase64,
          `profile_${userId}.jpg`,
          "image/jpeg"
        );
        updatedData.profilePic = url;
      }
      if (password) {
        updatedData.password = password;
        updatedData.confirmPassword = confirmPassword;
      }
      const updated = await updateUserProfile(userId, updatedData);
      setProfile({
        name: updated.name,
        email: updated.email,
        collegeName: updated.collegeName,
        profilePic: updated.profilePic || "",
      });
      setEdit(false);
      setPassword("");
      setConfirmPassword("");
      setImageBase64(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
    setLoading(false);
  };

  const handleChatClick = (contact) => {
    setChatDetails({
      sellerId: contact.otherUserId,
      sellerName: contact.otherUserName,
    });
  };

  const closeChat = () => setChatDetails(null);

  return (
    <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '2rem', padding: '2rem', width: '100vw' }}>
      {/* Left Card: Profile Info */}
      <div className="profile-content" style={{ minWidth: 340, maxWidth: 380, flex: '0 0 360px', marginTop: 0 }}>
        <img
          src={profile.profilePic || "/assets/LoginImage.png"}
          alt="Profile"
          className="profile-image"
        />
        <form className="profile-form" onSubmit={handleUpdate}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <b style={{ fontSize: 22 }}>{profile.name}</b>
            <div style={{ color: '#888', fontSize: 14 }}>{profile.collegeName}</div>
            <div style={{ color: '#888', fontSize: 14 }}>{profile.email}</div>
          </div>
          {edit && (
            <>
              <label>Change Profile Picture</label>
              <FileBase
                type="file"
                multiple={false}
                onDone={({ base64 }) => setImageBase64(base64.split(",")[1])}
              />
              <label>Change Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <label>Change College</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  value={profile.collegeName}
                  onChange={handleCollegeNameChange}
                  placeholder="College Name"
                  autoComplete="off"
                  style={{ width: '100%' }}
                />
                {collegeSuggestions.length > 0 && (
                  <ul className="suggestions-list" ref={suggestionsRef} style={{ position: 'absolute', left: 0, top: '100%', width: '100%', background: '#d3d3d3', zIndex: 1000, margin: 0, padding: 0, listStyle: 'none' }}>
                    {collegeSuggestions.map((college, index) => (
                      <li key={index} onClick={() => handleSuggestionClick(college.name)} style={{ padding: '10px', cursor: 'pointer' }}>
                        {college.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <label>Change Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
              />
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
              />
            </>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: 'center' }}>
            {edit ? (
              <>
                <button
                  className="update-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  className="update-btn"
                  type="button"
                  style={{ background: "#ccc", color: "#333" }}
                  onClick={() => {
                    setEdit(false);
                    setPassword("");
                    setConfirmPassword("");
                    setImageBase64(null);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="update-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setEdit(true);
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Side: Two Cards stacked vertically */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1, marginTop: 40 }}>
        {/* Top Card: My Chats */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '1.5rem 2rem', minWidth: 320, maxWidth: 400, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <b style={{ fontSize: 18, color: '#5e4ae3' }}>My Chats</b>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatContacts.length === 0 && <div style={{ color: '#888' }}>No chats yet.</div>}
            {chatContacts.map((contact, idx) => (
              <div key={contact.chatboxId || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f3f8ff', borderRadius: 10, padding: '8px 12px', minHeight: 48, maxHeight: 48, marginBottom: 4 }}>
                <span style={{ color: '#333', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {contact.otherUserName}
                  <MessageCircle size={20} style={{ cursor: 'pointer', color: '#5e4ae3' }} onClick={() => handleChatClick(contact)} />
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom Card: My Items */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '1.5rem 2rem', minWidth: 320, maxWidth: 400, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <b style={{ fontSize: 18, color: '#5e4ae3' }}>My Items</b>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myItems.length === 0 && <div style={{ color: '#888' }}>No items listed yet.</div>}
            {myItems.map((item, idx) => (
              <div key={item._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f3f8ff', borderRadius: 10, padding: '8px 12px', minHeight: 48, maxHeight: 48, marginBottom: 4 }}>
                <span style={{ color: '#333', fontWeight: 500 }}>{item.title}</span>
                <span style={{ background: '#38d39f', color: '#fff', borderRadius: 8, padding: '2px 10px', fontWeight: 600, fontSize: 13 }}>Active</span>
              </div>
            ))}
          </div>
        </div>
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
      <ToastContainer position="top-right" />
    </div>
  );
}

export default Profile;