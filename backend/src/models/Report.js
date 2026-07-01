const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // A report is against exactly one of these — kept as two optional refs
    // rather than a single polymorphic "target" field, since that keeps
    // .populate() and admin queries simple (no refPath juggling) at the cost
    // of one always being null. Validated below so exactly one is ever set.
    reportedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

ReportSchema.pre('validate', function (next) {
  const hasListing = Boolean(this.reportedListing);
  const hasUser = Boolean(this.reportedUser);
  if (hasListing === hasUser) {
    // both set or neither set — invalid either way
    return next(new Error('A report must target exactly one of reportedListing or reportedUser.'));
  }
  next();
});

// Admin's reports queue is always "open ones first, newest first".
ReportSchema.index({ status: 1, createdAt: -1 });

// Same toJSON aliasing pattern as the rest of the models — _id → id, drop __v.
ReportSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.created_at = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Report', ReportSchema);
