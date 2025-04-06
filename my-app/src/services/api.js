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

// Auth APIs
export const signup = (userData) => API.post('/users/signup', userData);
export const login = (userData) => API.post('/users/login', userData);

// User APIs
export const getAllUsers = () => API.get('/users');

// Item APIs
export const getItems = () => API.get('/items');

// Chat APIs
// export const sendMessage = async (messageData) => {
//   try {
//     const response = await API.post('/chat/message', messageData);  // Fixed endpoint
//     return response.data;
//   } catch (error) {
//     console.error('Error sending message:', error);
//     return null;
//   }
// };

// Fetch messages from chatbox
export const getMessages = async (chatboxId) => {
  try {
    const response = await API.get(`/chat/messages/${chatboxId}`);
    return response.data.messages; // ✅ FIXED: only return the array
  } catch (error) {
    console.error('Error fetching messages:', error);
    return []; // safe fallback
  }
};


// Fetch or create chatbox ID between two users
export const getChatboxId = async (senderId, receiverId) => {
  try {
    const response = await API.get(`/chat/chatbox/${senderId}/${receiverId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chatbox ID:', error);
    return null;
  }
};
export const getNotifications = async (userId) => {
  try {
    const response = await API.get(`/notifications/user/${userId}`); // <-- fixed path
    return response.data; // ← you were already returning `.notifications`, but the controller returns full array
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// 2. Mark a notification as read or delete it
export const deleteNotification = async (notifId) => {
  try {
    await API.delete(`/notifications/${notifId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

export default {
  signup,
  login,
  getAllUsers,
  getItems,
  getMessages,
  getNotifications,
  deleteNotification,
  // sendMessage,
};
