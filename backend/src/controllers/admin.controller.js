const User = require('../models/User');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { notifyUser } = require('../utils/notify');

/**
 * GET /api/admin/users — supports ?banned=true and ?search=name, same
 * query-building instinct as the public listings search, just simpler
 * since there's less to filter on.
 */
const getUsers = asyncHandler(async (req, res) => {
  const { banned, search } = req.query;

  const query = {};
  if (banned === 'true') query.isBlocked = true;
  if (banned === 'false') query.isBlocked = false;
  if (search && search.trim()) {
    const re = new RegExp(search.trim(), 'i');
    query.$or = [{ name: re }, { email: re }];
  }

  const users = await User.find(query).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { users }));
});

/** PATCH /api/admin/users/:id/ban — toggles isBlocked. Body: { blocked: true|false }. */
const banUser = asyncHandler(async (req, res) => {
  const { blocked } = req.body;
  if (typeof blocked !== 'boolean') throw new ApiError(400, '"blocked" must be true or false.');

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(400, "Admins can't be banned.");

  user.isBlocked = blocked;
  await user.save();
  res.json(new ApiResponse(200, { user }, blocked ? 'User banned.' : 'User unbanned.'));
});

/** GET /api/admin/listings — same as the public feed but without the status !== 'removed' filter, so admins see everything. Supports ?flagged=true. */
const getListings = asyncHandler(async (req, res) => {
  const { flagged } = req.query;
  const query = {};
  if (flagged === 'true') query.flagged = true;

  const listings = await Listing.find(query).populate('owner').sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { listings }));
});

/** PATCH /api/admin/listings/:id/remove — sets status: 'removed' rather than deleting, so there's an audit trail. */
const removeListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  listing.status = 'removed';
  await listing.save();
  await listing.populate('owner');
  res.json(new ApiResponse(200, { listing }, 'Listing removed.'));
});

/**
 * PATCH /api/admin/listings/:id/resolve-flag — clears the fraud-detection
 * flag once an admin has looked at it and decided it's fine. Same shape as
 * resolving a report: flip a status-ish field, nothing else changes.
 */
const resolveFlag = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  listing.flagged = false;
  await listing.save();
  await listing.populate('owner');
  res.json(new ApiResponse(200, { listing }, 'Flag cleared.'));
});

/** GET /api/admin/reports — open reports first (queue order), newest first within each. */
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({})
    .sort({ status: 1, createdAt: -1 }) // 'open' < 'resolved' alphabetically, so open surfaces first
    .populate('reporter')
    .populate('reportedListing')
    .populate('reportedUser');
  res.json(new ApiResponse(200, { reports }));
});

/** PATCH /api/admin/reports/:id/resolve — flips status to resolved and lets the reporter know. */
const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.');

  report.status = 'resolved';
  await report.save();

  await notifyUser(report.reporter, {
    type: 'report_resolved',
    message: 'Your report has been reviewed and resolved by an admin.',
    relatedId: (report.reportedListing || report.reportedUser)?.toString() || null,
  });

  res.json(new ApiResponse(200, { report }, 'Report resolved.'));
});

/** GET /api/admin/stats — aggregate counts, run in parallel since there's no reason to await one at a time. */
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, bannedUsers, totalListings, activeListings, removedListings, flaggedListings, openReports] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isBlocked: true }),
      Listing.countDocuments({}),
      Listing.countDocuments({ status: 'active' }),
      Listing.countDocuments({ status: 'removed' }),
      Listing.countDocuments({ flagged: true }),
      Report.countDocuments({ status: 'open' }),
    ]);

  res.json(
    new ApiResponse(200, {
      stats: { totalUsers, bannedUsers, totalListings, activeListings, removedListings, flaggedListings, openReports },
    })
  );
});

module.exports = { getUsers, banUser, getListings, removeListing, resolveFlag, getReports, resolveReport, getStats };
