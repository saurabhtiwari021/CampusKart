const express = require('express');
const {
  getListings,
  getListing,
  getUserListings,
  createListing,
  updateListing,
  updateStatus,
  deleteListing,
} = require('../controllers/listing.controller');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', getListings);
router.get('/user/:userId', getUserListings);
router.get('/:id', getListing);

router.post('/', protect, upload.array('images', 6), createListing);
router.patch('/:id', protect, updateListing);
router.patch('/:id/status', protect, updateStatus);
router.delete('/:id', protect, deleteListing);

module.exports = router;
