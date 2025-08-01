const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./api/users/routes');
const itemRoutes = require('./api/items/routes');
const chatRoutes = require('./api/chat/routes');
const notificationRoutes = require('./api/notification/routes'); // ✅ Added
const uploadRoutes = require('./api/upload');

require('dotenv').config();
const cors = require('cors');

connectDB();

const app = express();
app.use(express.json());

// CORS setup
// app.use(cors());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes); // ✅ New route
app.use('/api/upload', uploadRoutes);

module.exports = app;
