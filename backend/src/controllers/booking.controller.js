const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/bookings/listing/:listingId — public. Just the date ranges (no
 * renter identity) so the frontend calendar can grey out booked dates
 * without needing anyone to be logged in to view a rent listing.
 */
const getBookingsForListing = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ listing: req.params.listingId })
    .select('startDate endDate')
    .sort({ startDate: 1 });
  res.json(new ApiResponse(200, { bookings }));
});

/**
 * POST /api/bookings — protected. Body: { listingId, startDate, endDate }.
 * The whole "calendar" logic server-side is this one overlap query — a new
 * booking is rejected if it overlaps any existing booking for the listing.
 */
const createBooking = asyncHandler(async (req, res) => {
  const { listingId, startDate, endDate } = req.body;
  if (!listingId || !startDate || !endDate) {
    throw new ApiError(400, 'listingId, startDate and endDate are required.');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new ApiError(400, 'Invalid date range.');
  }

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.type !== 'rent') throw new ApiError(400, 'This listing is not available for rent.');
  if (listing.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You can't book your own listing.");
  }

  // Two ranges overlap iff each starts before the other ends.
  const overlap = await Booking.findOne({
    listing: listingId,
    startDate: { $lt: end },
    endDate: { $gt: start },
  });
  if (overlap) throw new ApiError(409, 'Those dates overlap with an existing booking.');

  const booking = await Booking.create({ listing: listingId, renter: req.user._id, startDate: start, endDate: end });
  res.status(201).json(new ApiResponse(201, { booking }, 'Booking confirmed.'));
});

module.exports = { getBookingsForListing, createBooking };
