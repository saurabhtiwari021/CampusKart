const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/notifications — protected. The logged-in user's notifications, newest first. */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { notifications }));
});

/** PATCH /api/notifications/:id/read — protected, owner only. */
const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) throw new ApiError(404, 'Notification not found.');
  if (notif.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only mark your own notifications as read.');
  }

  notif.read = true;
  await notif.save();
  res.json(new ApiResponse(200, { notification: notif }, 'Marked as read.'));
});

/** PATCH /api/notifications/read-all — protected. */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json(new ApiResponse(200, {}, 'All notifications marked as read.'));
});

module.exports = { getNotifications, markRead, markAllRead };
