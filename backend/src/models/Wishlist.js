const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true }
);

// A user can only save a given listing once — also lets add-to-wishlist
// be implemented as an upsert instead of a manual "already exists" check.
WishlistSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
