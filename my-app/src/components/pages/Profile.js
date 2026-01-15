import React, { useEffect, useState } from "react";
import "./Profile.css";
import FileBase from "react-file-base64";
import { getUserProfile, updateUserProfile, uploadProfileImage, getItems, getUserChatboxes } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MessageCircle, Package, Edit2, Camera, LogOut, ChevronRight, ShoppingBag, dollarSign } from "lucide-react";
import Chat from "../Chat";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    collegeName: "",
    profilePic: "",
    joinDate: new Date(),
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
          joinDate: data.createdAt ? new Date(data.createdAt) : new Date(),
        });
      } catch (err) {
        toast.error("Failed to load profile");
      }
      setLoading(false);
    }
    if (userId) fetchProfile();
  }, [userId]);

  useEffect(() => {
    async function fetchItemsAndChats() {
      if (!userId || !userName) return;
      try {
        // Fetch items
        const itemsRes = await getItems();
        const allItems = itemsRes.data || itemsRes;
        setMyItems(allItems.filter(item => item.sellerName === userName));

        // Fetch chats
        const contacts = await getUserChatboxes(userId);
        setChatContacts(Array.isArray(contacts) ? contacts : []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchItemsAndChats();
  }, [userId, userName]);

  // Click outside to close suggestion box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setCollegeSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCollegeNameChange = async (e) => {
    const value = e.target.value;
    setProfile((prev) => ({ ...prev, collegeName: value }));
    if (value.length > 2) {
      try {
        const response = await axios.get(`http://universities.hipolabs.com/search?name=${value}&country=India`);
        setCollegeSuggestions(response.data.slice(0, 5));
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
      if (imageBase64) {
        // toast.info("Uploading profile image...");
        const url = await uploadProfileImage(imageBase64, `profile_${userId}.jpg`, "image/jpeg");
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
        joinDate: new Date(updated.createdAt),
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="profile-page-wrapper">

      <div className="profile-dashboard">
        {/* Sidebar / Left Column */}
        <div className="profile-left-col">
          <div className="user-card-glass">
            <div className="profile-pic-wrapper">
              <img
                src={profile.profilePic || "/assets/LoginImage.png"}
                alt="Profile"
                className="profile-avatar-large"
              />
              {edit && (
                <div className="upload-btn-wrapper">
                  <label className="camera-icon-btn">
                    <Camera size={18} />
                    <FileBase
                      type="file"
                      multiple={false}
                      onDone={({ base64 }) => setImageBase64(base64.split(",")[1])}
                    />
                  </label>
                </div>
              )}
            </div>

            {!edit ? (
              <div className="user-info-display">
                <h2 className="user-name">{profile.name}</h2>
                <p className="user-college">{profile.collegeName}</p>
                <div className="user-badge-row">
                  <span className="user-role-badge">Student</span>
                  <span className="user-join-date">Joined {profile.joinDate.toLocaleDateString()}</span>
                </div>
                <button className="edit-profile-btn" onClick={() => setEdit(true)}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              </div>
            ) : (
              <form className="edit-form" onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <div className="autocomplete-wrapper">
                    <input type="text" value={profile.collegeName} onChange={handleCollegeNameChange} />
                    {collegeSuggestions.length > 0 && (
                      <ul ref={suggestionsRef} className="suggestions-dropdown">
                        {collegeSuggestions.map((c, i) => (
                          <li key={i} onClick={() => handleSuggestionClick(c.name)}>{c.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password (Optional)</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                </div>
                {password && (
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••" />
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => { setEdit(false); setPassword(""); }}>Cancel</button>
                  <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            )}

            <div className="account-actions">
              <button className="logout-btn-full" onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content / Right Column */}
        <div className="profile-right-col">

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon bg-purple"><Package size={24} color="#5e4ae3" /></div>
              <div className="stat-info">
                <h3>{myItems.length}</h3>
                <p>Items Listed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-green"><MessageCircle size={24} color="#10b981" /></div>
              <div className="stat-info">
                <h3>{chatContacts.length}</h3>
                <p>Active Chats</p>
              </div>
            </div>
            {/* Placeholder for future stat */}
            <div className="stat-card">
              <div className="stat-icon bg-orange"><ShoppingBag size={24} color="#f59e0b" /></div>
              <div className="stat-info">
                <h3>0</h3>
                <p>Items Sold</p>
              </div>
            </div>
          </div>

          {/* Quick Actions / Recent Items */}
          <div className="content-section">
            <div className="section-header">
              <h3>My Listings</h3>
              <button className="view-all-btn" onClick={() => navigate('/your-items')}>
                Manage All <ChevronRight size={16} />
              </button>
            </div>

            <div className="recent-items-list">
              {myItems.length === 0 ? (
                <div className="empty-placeholder">
                  <p>You haven't listed anything yet.</p>
                  <button className="sell-now-btn" onClick={() => navigate('/sell')}>Sell Now</button>
                </div>
              ) : (
                myItems.slice(0, 3).map(item => (
                  <div key={item._id} className="mini-item-card">
                    <img src={item.image || item.images?.[0] || 'placeholder.jpg'} alt={item.title} />
                    <div className="mini-item-info">
                      <h4>{item.title}</h4>
                      <span className="mini-item-price">₹{item.price}</span>
                    </div>
                    <span className="status-badge active">Active</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Chats Section */}
          <div className="content-section">
            <div className="section-header">
              <h3>Recent Conversations</h3>
            </div>
            <div className="recent-chats-list">
              {chatContacts.length === 0 ? (
                <div className="empty-placeholder">
                  <p>No active conversations.</p>
                </div>
              ) : (
                chatContacts.slice(0, 4).map((contact, idx) => (
                  <div key={idx} className="chat-row" onClick={() => handleChatClick(contact)}>
                    <div className="chat-avatar">{contact.otherUserName.charAt(0)}</div>
                    <div className="chat-row-info">
                      <h4>{contact.otherUserName}</h4>
                      <p>Click to resume chat</p>
                    </div>
                    <button className="chat-action-icon"><MessageCircle size={18} /></button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {chatDetails && (
        <Chat
          userId={userId}
          userName={userName}
          sellerId={chatDetails.sellerId}
          sellerName={chatDetails.sellerName}
          onClose={() => setChatDetails(null)}
        />
      )}
      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
}

export default Profile;