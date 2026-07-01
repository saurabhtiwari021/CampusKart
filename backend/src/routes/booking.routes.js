const express = require('express');
const { getBookingsForListing, createBooking } = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/listing/:listingId', getBookingsForListing); // public — needed to render the calendar for anyone viewing the listing
router.post('/', protect, createBooking);

module.exports = router;
