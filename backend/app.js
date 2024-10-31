const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./api/users/routes');
const itemRoutes = require('./api/items/routes');
require('dotenv').config();
const cors = require('cors');
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Register routes for each module
app.use('/api/users', userRoutes);
app.use('/api/items',itemRoutes);

module.exports = app;
