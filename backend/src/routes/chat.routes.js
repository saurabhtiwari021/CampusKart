const express = require('express');
const { getChats, createChat, getMessages, sendChatImage } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');
const { uploadChatImage } = require('../config/cloudinary');

const router = express.Router();

router.use(protect); // every chat route requires a logged-in user, same as wishlist.routes.js

router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/image', uploadChatImage.single('image'), sendChatImage);

module.exports = router;
