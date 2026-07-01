const express = require('express');
const { createReview, getUserReviews, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/user/:userId', getUserReviews); // public
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
