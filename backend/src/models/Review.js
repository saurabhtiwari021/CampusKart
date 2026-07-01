const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // person being reviewed
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // person who wrote it
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

// One review per listing per buyer — enforced as a DB constraint (upsert-style
// safety) instead of a manual "already reviewed?" check that could race.
// Same trick as Wishlist's (user, listing) index.
ReviewSchema.index({ listing: 1, buyer: 1 }, { unique: true });

// Same toJSON aliasing pattern as the rest of the models — _id → id, drop __v,
// expose an epoch-ms timestamp the frontend can sort/format directly.
ReviewSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.created_at = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Review', ReviewSchema);
