const express = require('express');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every wishlist route requires a logged-in user

router.get('/', getWishlist);
router.post('/:listingId', addToWishlist);
router.delete('/:listingId', removeFromWishlist);

module.exports = router;
