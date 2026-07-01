const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // A message must have either text or image — enforced in the controller/socket
    // handler (not here), matching how validation is handled elsewhere in this app.
    text: { type: String, default: '' },
    image: { type: String, default: '' }, // Cloudinary URL

    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Messages are always queried/sorted as "all messages in this chat, oldest first" —
// this index makes getMessages and the seen-status bulk update fast.
MessageSchema.index({ chat: 1, createdAt: 1 });

// Same toJSON aliasing pattern as User.js/Listing.js — _id → id, drop __v.
MessageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.created_at = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Message', MessageSchema);
