const express = require('express');
const { signup, login, getAllUsers, getUserById, getUserProfile, updateUserProfile } = require('./controller');
const auth = require('../../middleware/auth');


const router = express.Router();

// Define user routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/', auth, getAllUsers); // Protected route
router.get('/:id', getUserProfile);
router.put('/:id', updateUserProfile);


module.exports = router;
