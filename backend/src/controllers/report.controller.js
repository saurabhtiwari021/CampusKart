const Report = require('../models/Report');
const Listing = require('../models/Listing');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/reports — protected, any logged-in user (not admin-gated —
 * filing a report is the thing that puts something in front of an admin
 * in the first place). Body: { listingId, reason } or { userId, reason }.
 */
const createReport = asyncHandler(async (req, res) => {
  const { listingId, userId, reason } = req.body;

  if (!reason || !reason.trim()) throw new ApiError(400, 'A reason is required.');
  if (!listingId && !userId) throw new ApiError(400, 'Either listingId or userId is required.');
  if (listingId && userId) throw new ApiError(400, 'Report either a listing or a user, not both.');

  if (listingId) {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new ApiError(404, 'Listing not found.');
  } else {
    if (userId === req.user._id.toString()) throw new ApiError(400, "You can't report yourself.");
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found.');
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportedListing: listingId || null,
    reportedUser: userId || null,
    reason: reason.trim(),
  });

  res.status(201).json(new ApiResponse(201, { report }, 'Report submitted. Thanks for keeping CampusKart safe!'));
});

module.exports = { createReport };
