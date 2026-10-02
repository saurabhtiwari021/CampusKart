const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Accounts created through Google sign-in have no password, so the hash
    // is only required when there is no linked Google identity.
    passwordHash: {
      type: String,
      required: function () { return !this.googleId; },
      select: false,
    },
    // Google account id (the `sub` claim). Sparse-unique: many users have none.
    // select:false keeps it out of populated `sender`/`owner` objects that get
    // sent to other users — the Google login controller opts in with +googleId.
    googleId: { type: String, unique: true, sparse: true, select: false },

    college: { type: String, default: 'KIIT' },
    department: { type: String, default: '' },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    picture: { type: String, default: '' },

    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Email verification is stubbed out for now (Phase 1) — every account is
    // created already verified so login is never blocked. Real verification
    // (Nodemailer/Resend + verifyToken/verifyExpires) gets added later.
    isVerified: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Never leak the hash even if a query forgets to .select('-passwordHash').
// Also alias _id → user_id, since the existing frontend (NavBar, Profile,
// Listing, Dashboard) reads `user.user_id` everywhere.
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.user_id = obj._id.toString();
  obj.review_count = obj.reviewCount;
  delete obj._id;
  delete obj.reviewCount;
  delete obj.passwordHash;
  delete obj.googleId;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
