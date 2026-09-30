const mongoose = require('mongoose');

const NOTIF_TYPES = ['message', 'wishlist', 'listing_sold', 'review', 'report_resolved'];

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
    type: { type: String, enum: NOTIF_TYPES, required: true },
    message: { type: String, required: true }, // short display text

    // Optional id of whatever this notification points to (a listing, chat, or
    // review) so clicking it can navigate somewhere. Left untyped/unref'd since
    // it can point at different collections depending on `type`.
    relatedId: { type: String, default: null },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Notifications are always queried as "this user's, newest first" — matches
// the getNotifications access pattern.
NotificationSchema.index({ user: 1, createdAt: -1 });

// Same toJSON aliasing pattern as the rest of the models — _id → id, drop __v.
NotificationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.created_at = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Notification', NotificationSchema);
module.exports.NOTIF_TYPES = NOTIF_TYPES;
