const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { notifyUser } = require('../utils/notify');

/**
 * Recalculates a seller's rating/reviewCount from scratch and writes it back
 * to their User doc. Called right after any review is created or deleted —
 * synchronous, not a background job. At this scale (a few dozen reviews per
 * seller at most) that's instant, so there's no need for a queue.
 */
async function recalculateSellerRating(sellerId) {
  const reviews = await Review.find({ seller: sellerId });
  const reviewCount = reviews.length;
  const rating = reviewCount === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  await User.findByIdAndUpdate(sellerId, {
    rating: Math.round(rating * 10) / 10, // one decimal place, e.g. 4.7
    reviewCount,
  });
}

/**
 * POST /api/reviews — protected. Body: { listingId, rating, comment }.
 *
 * Buyer-seller validation: the project has no checkout/order model — a
 * listing just flips to status 'sold'/'rented' with no record of who bought
 * it — so "did this buyer complete a transaction with the seller" can't be
 * checked against real data. This uses the agreed proxy instead: the listing
 * must be sold or rented, and the reviewer can't be the listing's own owner.
 */
const createReview = asyncHandler(async (req, res) => {
  const { listingId, rating, comment } = req.body;

  if (!listingId) throw new ApiError(400, 'listingId is required.');
  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, 'Rating must be a number between 1 and 5.');
  }

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  const sellerId = listing.owner.toString();
  if (sellerId === req.user._id.toString()) {
    throw new ApiError(400, "You can't review your own listing.");
  }
  if (!['sold', 'rented'].includes(listing.status)) {
    throw new ApiError(400, 'You can only review a listing once it has been marked sold or rented.');
  }

  let review;
  try {
    review = await Review.create({
      listing: listingId,
      seller: sellerId,
      buyer: req.user._id,
      rating: numericRating,
      comment: comment || '',
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "You've already reviewed this listing.");
    }
    throw err;
  }

  await recalculateSellerRating(sellerId);
  await review.populate('buyer');

  await notifyUser(sellerId, {
    type: 'review',
    message: `${req.user.name} left you a ${numericRating}★ review.`,
    relatedId: listingId,
  });

  res.status(201).json(new ApiResponse(201, { review }, 'Review posted.'));
});

/** GET /api/reviews/user/:userId — public. All reviews received by a seller, newest first. */
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ seller: req.params.userId })
    .sort({ createdAt: -1 })
    .populate('buyer')
    .populate('listing');
  res.json(new ApiResponse(200, { reviews }));
});

/** DELETE /api/reviews/:id — protected, review-owner only. */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  if (review.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own reviews.');
  }

  const sellerId = review.seller.toString();
  await review.deleteOne();
  await recalculateSellerRating(sellerId); // don't let ratings go stale after a delete

  res.json(new ApiResponse(200, { id: req.params.id }, 'Review deleted.'));
});

module.exports = { createReview, getUserReviews, deleteReview };
