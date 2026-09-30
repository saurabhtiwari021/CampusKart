const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: true }
);

// Lets us quickly answer "all chats this user is in" (getChats) without a collection scan.
ChatSchema.index({ participants: 1 });

// Same toJSON aliasing pattern as Listing.js — _id → id, drop __v, expose
// epoch-ms timestamps the frontend can sort/format directly.
ChatSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.created_at = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
  obj.updated_at = obj.updatedAt ? new Date(obj.updatedAt).getTime() : obj.created_at;
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Chat', ChatSchema);
