import axios from 'axios';

// Set up the base URL for the backend API
const API = axios.create({ baseURL: 'http://localhost:4000/api' });

// Add a request interceptor to include the token in headers if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth APIs
export const signup = (userData) => API.post('/users/signup', userData);
export const login = (userData) => API.post('/users/login', userData);

// User APIs
export const getAllUsers = () => API.get('/users');

// Item APIs
export const getItems = () => API.get('/items');

// Chat APIs
export const fetchChatHistory = async (userId1, userId2) => {
  const response = await API.get(`/chat/${userId1}/${userId2}`);
  return response.data;
};

export const sendMessageToAPI = (messageData) => {
  return API.post('/send', messageData); // Now using Axios with the configured API instance
};

export default {
  signup,
  login,
  getAllUsers,
  getItems,
  fetchChatHistory,
  sendMessageToAPI,
};
