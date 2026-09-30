const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    images: { type: [String], default: [] }, // Cloudinary URLs

    category: {
      type: String,
      required: true,
      enum: ['Books', 'Electronics', 'Furniture', 'Cycles', 'Clothing', 'Sports', 'Stationery', 'Other'],
    },
    condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair'], default: 'New' },
    type: { type: String, enum: ['sell', 'rent', 'donate', 'exchange'], required: true },
    status: { type: String, enum: ['active', 'sold', 'rented', 'removed'], default: 'active' },

    location: { type: String, default: '' },
    tags: { type: [String], default: [] },

    // Only used when type === 'rent'
    rentalDuration: { type: String, default: '' },
    deposit: { type: Number, default: 0 },

    views: { type: Number, default: 0 },

    // Fraud-detection signal (Phase 9) — set once at creation time by comparing
    // against the category's average active price. Never re-evaluated after
    // the fact, never blocks the save; it's purely a flag for admins to review.
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Frontend reads l.id, l.created_at, l.rental_duration, and l.owner as a
// populated user object (already aliased by User.toJSON) — match that shape
// instead of making the frontend deal with Mongo's _id/createdAt naming.
ListingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.created_at = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
  obj.rental_duration = obj.rentalDuration;
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.rentalDuration;
  delete obj.__v;
  delete obj.score; // present only when a $text search projected textScore for sorting
  return obj;
};

// Used by Marketplace's search box later (Phase 3); harmless to add now.
ListingSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Listing', ListingSchema);
