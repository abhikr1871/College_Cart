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
});

// Auth APIs
export const signup = (userData) => API.post('/users/signup', userData);
export const login = (userData) => API.post('/users/login', userData);

// User APIs
export const getAllUsers = () => API.get('/users');

// Item APIs
export const getItems = () => API.get('/items');
// export const createItem = (itemData) => API.post('/items', itemData);

// Additional APIs for your project can be added here

export default {
  
  signup,
  login,
  getAllUsers,
  getItems,
  // createItem,
};
