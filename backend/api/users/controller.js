const User = require('./model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Signup (Register) a new user
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const result = {
    message: "User successfully registered",
    data: {}
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({ name, email, password });
    const resp_data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    }
    result.data = resp_data;
    res.status(201).json(result);
  } catch (error) {
    result.message = error.message;
    res.status(500).json(result);
  }
};

// Login an existing user
// (await bcrypt.compare(password, user.password))
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (user && password == user.password) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: "Successfully logged in"
      });
    } else {
      res.status(201).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (requires authentication)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getAllUsers };
