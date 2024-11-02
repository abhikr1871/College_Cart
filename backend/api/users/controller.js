const User = require('./model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Signup (Register) a new user
const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const result = {
    status: 0,
    message: "User successfully registered",
    data: {}
  }
  try {

    if (password !== confirmPassword) {
      result.message = "Passwords do not match";
      return res.status(201).json(result);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      result.message='User already exists';
      return res.status(201).json(result);
    }
    
    const user = await User.create({ name, email, password,confirmPassword });
    const resp_data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    }
    result.data = resp_data;
    result.status=1;
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

  const result = {
    status: 0,
    message: "User successfully Login",
    data: {}
  }
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (user && password == user.password) {
      const resp_data={
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: "Successfully logged in"
      };

    result.data = resp_data;
    result.status=1;
    res.status(201).json(result);
    } else {
      result.message = "Invalid email or password";
      res.status(201).json(result);
    }
  } catch (error) {
    result.message = error.message;
    res.status(500).json(result);
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
