const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

/** Pulls the Cloudinary public_id (including folder) back out of a stored URL. */
function publicIdFromUrl(url) {
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/campuskart/listings/abc123.jpg
  const parts = url.split('/upload/')[1]; // "v123/campuskart/listings/abc123.jpg"
  if (!parts) return null;
  const withoutVersion = parts.replace(/^v\d+\//, ''); // "campuskart/listings/abc123.jpg"
  return withoutVersion.replace(/\.[a-zA-Z0-9]+$/, ''); // strip extension
}

/**
 * GET /api/listings — public marketplace feed.
 * Query params (all optional): q, category, type, condition, maxPrice, sort.
 * `q` uses the text index on title/description/tags via $text instead of regex.
 */
const getListings = asyncHandler(async (req, res) => {
  const { q, category, type, condition, maxPrice, sort } = req.query;

  const query = { status: { $ne: 'removed' } };

  const hasSearch = typeof q === 'string' && q.trim().length > 0;
  if (hasSearch) query.$text = { $search: q.trim() };

  if (category && category !== 'All') query.category = category;
  if (type && type !== 'all') query.type = type;
  if (condition) query.condition = condition;

  if (maxPrice !== undefined && maxPrice !== '') {
    const max = Number(maxPrice);
    if (!Number.isNaN(max)) query.price = { $lte: max };
  }

  let cursor = Listing.find(query);

  // With an active text search and no explicit sort request, rank by
  // relevance (Mongo's textScore) instead of recency — that's what makes
  // $text search actually useful instead of just acting as a filter.
  if (hasSearch && (!sort || sort === 'latest')) {
    cursor = cursor.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else if (sort === 'price_low') {
    cursor = cursor.sort({ price: 1 });
  } else if (sort === 'price_high') {
    cursor = cursor.sort({ price: -1 });
  } else if (sort === 'popular') {
    cursor = cursor.sort({ views: -1 });
  } else {
    cursor = cursor.sort({ createdAt: -1 });
  }

  const listings = await cursor.populate('owner');
  res.json(new ApiResponse(200, { listings }));
});

/** GET /api/listings/:id — single listing, increments view count. */
const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('owner');

  if (!listing) throw new ApiError(404, 'Listing not found.');
  res.json(new ApiResponse(200, { listing }));
});

/** GET /api/listings/user/:userId — a user's own listings (Dashboard, public profile). */
const getUserListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ owner: req.params.userId, status: { $ne: 'removed' } })
    .populate('owner')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { listings }));
});

/** POST /api/listings — protected. multipart/form-data with up to 6 'images' files. */
const createListing = asyncHandler(async (req, res) => {
  const { title, description, price, category, condition, type, location, deposit } = req.body;

  if (!title || !title.trim()) throw new ApiError(400, 'Title is required.');
  if (!category) throw new ApiError(400, 'Category is required.');
  if (!type) throw new ApiError(400, 'Listing type is required.');
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'At least one photo is required.');

  // tags arrives as a comma-separated string from the form; rental_duration uses the snake_case the frontend sends.
  const tags = (req.body.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const numericPrice = Number(price) || 0;

  // Fraud detection (Phase 9): one aggregation, one signal, no rejection.
  // If this listing's price undercuts the category's current average active
  // price by a wide margin (under ~5% of it), flag it for an admin to look
  // at later — never block the save on it.
  const [priceStats] = await Listing.aggregate([
    { $match: { category, status: 'active' } },
    { $group: { _id: null, avgPrice: { $avg: '$price' } } },
  ]);
  const flagged = Boolean(priceStats?.avgPrice) && numericPrice < priceStats.avgPrice * 0.05;

  const listing = await Listing.create({
    title: title.trim(),
    description: description || '',
    price: numericPrice,
    category,
    condition: condition || 'New',
    type,
    location: location || '',
    tags,
    rentalDuration: req.body.rental_duration || '',
    deposit: Number(deposit) || 0,
    images: req.files.map((f) => f.path), // Cloudinary URL, populated by multer-storage-cloudinary
    owner: req.user._id,
    flagged,
  });

  await listing.populate('owner');
  res.status(201).json(new ApiResponse(201, { listing }, 'Listing created.'));
});

/** PATCH /api/listings/:id — owner only. Text-field updates (no new images in this pass). */
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own listings.');
  }

  const editable = ['title', 'description', 'price', 'category', 'condition', 'location', 'deposit'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });
  if (req.body.rental_duration !== undefined) listing.rentalDuration = req.body.rental_duration;
  if (req.body.tags !== undefined) {
    listing.tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }

  await listing.save();
  await listing.populate('owner');
  res.json(new ApiResponse(200, { listing }, 'Listing updated.'));
});

/** PATCH /api/listings/:id/status — owner only. Mark sold / rented / active again. */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'sold', 'rented'].includes(status)) {
    throw new ApiError(400, 'Invalid status.');
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only update your own listings.');
  }

  listing.status = status;
  await listing.save();
  await listing.populate('owner');
  res.json(new ApiResponse(200, { listing }, 'Status updated.'));
});

/** DELETE /api/listings/:id — owner (or admin) only. Cleans up Cloudinary images too. */
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  const isOwner = listing.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own listings.');
  }

  // Best-effort Cloudinary cleanup — a failed delete here shouldn't block the DB delete.
  await Promise.all(
    listing.images.map(async (url) => {
      const publicId = publicIdFromUrl(url);
      if (!publicId) return;
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn('[cloudinary] failed to delete', publicId, err.message);
      }
    })
  );

  await listing.deleteOne();
  res.json(new ApiResponse(200, { id: req.params.id }, 'Listing deleted.'));
});

module.exports = {
  getListings,
  getListing,
  getUserListings,
  createListing,
  updateListing,
  updateStatus,
  deleteListing,
};
