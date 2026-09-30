const express = require('express');
const { getNotifications, markRead, markAllRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every notification route requires a logged-in user, same as wishlist.routes.js

router.get('/', getNotifications);
router.patch('/read-all', markAllRead); // before /:id/read so 'read-all' never gets treated as an :id
router.patch('/:id/read', markRead);

module.exports = router;
