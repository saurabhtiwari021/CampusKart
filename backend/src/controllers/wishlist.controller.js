const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { notifyUser } = require('../utils/notify');

/** GET /api/wishlist — protected. Returns the logged-in user's saved listings, populated and ready to render. */
const getWishlist = asyncHandler(async (req, res) => {
  const entries = await Wishlist.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'listing', populate: { path: 'owner' } });

  // A saved listing may have since been deleted by its owner — drop those
  // dangling entries from the response rather than erroring or returning null.
  const listings = entries.map((e) => e.listing).filter(Boolean);
  res.json(new ApiResponse(200, { listings }));
});

/** POST /api/wishlist/:listingId — protected. Idempotent: saving an already-saved listing is a no-op, not an error. */
const addToWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  const result = await Wishlist.updateOne(
    { user: req.user._id, listing: listingId },
    { $setOnInsert: { user: req.user._id, listing: listingId } },
    { upsert: true }
  );

  // Only notify on an actual new save, not a re-add of something already
  // saved, and never notify someone for saving their own listing.
  const isNewSave = Boolean(result.upsertedCount);
  const isOwnListing = listing.owner.toString() === req.user._id.toString();
  if (isNewSave && !isOwnListing) {
    await notifyUser(listing.owner, {
      type: 'wishlist',
      message: `${req.user.name} saved your listing "${listing.title}" to their wishlist.`,
      relatedId: listingId,
    });
  }

  res.status(201).json(new ApiResponse(201, { listingId }, 'Saved to wishlist.'));
});

/** DELETE /api/wishlist/:listingId — protected. Idempotent: removing something not saved is a no-op. */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  await Wishlist.deleteOne({ user: req.user._id, listing: listingId });
  res.json(new ApiResponse(200, { listingId }, 'Removed from wishlist.'));
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
