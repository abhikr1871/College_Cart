const express = require('express');
const { listItems, createItem, getUserItems, deleteItem, updateItem } = require('./controller');
// const uploadImage = require('../../middleware/uploadImage');
const { uploadItemImage } = require('./controller.js');

const auth = require('../../middleware/auth');

const router = express.Router();

router.get('/user', auth, getUserItems);
router.get('/', auth, listItems);
router.post('/create', auth, createItem);
router.delete('/:id', auth, deleteItem);
router.put('/:id', auth, updateItem);
module.exports = router;