import axios from 'axios';

// Set up the base URL for the backend API
const API = axios.create({ baseURL: 'http://localhost:4000/api' });

// Add a request interceptor to include the token in headers if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const signup = (userData) => API.post('/users/signup', userData);
export const login = (userData) => API.post('/users/login', userData);


export const getAllUsers = () => API.get('/users');

export const getItems = () => API.get('/items');


// export const sendMessage = async (messageData) => {
//   try {
//     const response = await API.post('/chat/message', messageData);
//     return response.data;
//   } catch (error) {
//     console.error('Error sending message:', error);
//     return null;
//   }
// };

export const getMessages = async (chatboxId) => {
  try {
    const response = await API.get(`/chat/messages/${chatboxId}`);
    return response.data.messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const getUserChatboxes = async (userId) => {
  try {
    const response = await API.get(`/chat/chatboxes/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user chatboxes:', error);
    return [];
  }
};

export const getChatboxId = async (senderId, receiverId) => {
  try {
    const response = await API.get(`/chat/chatbox/${senderId}/${receiverId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chatbox ID:', error);
    return null;
  }
};


// 1. Fetch unread notifications for a specific user
export const getNotifications = async (userId) => {
  try {
    const response = await API.get(`/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// 2. Mark a notification as read
export const markNotificationAsRead = async (notifId) => {
  if (!notifId) {
    console.error("❌ Notification ID is undefined");
    return;
  }

  try {
    const response = await API.patch(`/notifications/read/${notifId}`);
    return response.data.notification; // Return the updated notification
  } catch (error) {
    console.error(`❌ Error marking notification as read with ID ${notifId}:`, error);
    return null;
  }
};

// 3. (Optional) Hard delete a notification
export const deleteNotification = async (notifId) => {
  if (!notifId) {
    console.error("❌ Notification ID is undefined");
    return;
  }

  try {
    await API.delete(`/notifications/${notifId}`);
    console.log(`✅ Notification with ID ${notifId} deleted successfully`);
  } catch (error) {
    console.error(`❌ Error deleting notification with ID ${notifId}:`, error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const response = await API.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (base64, fileName, mimeType) => {
  try {
    const response = await API.post('/upload/profile', { base64String: base64, fileName, mimeType });
    return response.data.url;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export default {
  signup,
  login,
  getAllUsers,
  getItems,
  getMessages,
  getUserChatboxes,
  getChatboxId,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  // sendMessage,
};
