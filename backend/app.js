const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./api/users/routes');
const itemRoutes = require('./api/items/routes');
const chatRoutes = require('./api/chat/routes');
const notificationRoutes = require('./api/notification/routes'); // Added
const uploadRoutes = require('./api/upload');

require('dotenv').config();
const cors = require('cors');

connectDB();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS setup - allow both local dev and production frontend
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', require('./api/community/routes')); // Community Routes
app.use('/api/upload', uploadRoutes);

module.exports = app;
