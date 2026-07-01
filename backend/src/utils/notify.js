const Notification = require('../models/Notification');
const { getIO } = require('../socket');

/**
 * Creates a Notification doc for `userId` and pushes it live over socket if
 * they're connected. Uses the same room mechanism as chat (src/socket/index.js)
 * instead of an onlineUsers map: every socket auto-joins a room named after its
 * own user id on connection, so `io.to(userId)` "just works" — including for
 * users with multiple tabs/devices, and with nothing to clean up on disconnect.
 *
 * Deliberately synchronous/awaited by callers (not fire-and-forget) so a
 * failure here surfaces the same way any other write failure would.
 */
async function notifyUser(userId, { type, message, relatedId = null } = {}) {
  const notif = await Notification.create({ user: userId, type, message, relatedId });

  // getIO() throws if socket.io hasn't initialized yet — that should never
  // happen in practice (it's wired up before the server starts accepting
  // requests), but don't let a notification-delivery hiccup break the
  // request that triggered it (e.g. sending a chat message).
  try {
    getIO().to(userId.toString()).emit('notification:new', notif);
  } catch (err) {
    console.warn('[notify] could not emit notification:new:', err.message);
  }

  return notif;
}

module.exports = { notifyUser };
