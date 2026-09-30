const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Every availability check is "bookings for this listing, in date order" —
// this index makes both the overlap query in createBooking and the
// calendar-disabling fetch in getBookingsForListing fast.
BookingSchema.index({ listing: 1, startDate: 1 });

// Same toJSON aliasing pattern as the rest of the models — _id → id, drop __v.
BookingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.created_at = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
  delete obj._id;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Booking', BookingSchema);
