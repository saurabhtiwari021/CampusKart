const { Server } = require('socket.io');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/auth');
// Required lazily inside the connection handler (see below) to avoid a
// require cycle: notify.js calls getIO() from this same file.
let notifyUser;

let io = null;

/** Resolves to the chat doc if `userId` is actually one of its participants, else null. */
async function findChatForParticipant(chatId, userId) {
  const chat = await Chat.findById(chatId);
  if (!chat) return null;
  const isParticipant = chat.participants.some((p) => p.toString() === userId.toString());
  return isParticipant ? chat : null;
}

/**
 * Wires Socket.IO onto the existing http server. Called once from server.js,
 * after the plain http.createServer(app) restructure.
 */
function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Auth middleware: reads the JWT off the handshake, verifies it with the
  // same logic `protect` uses for REST, and attaches the user to the socket.
  // Reuses verifyToken from middleware/auth.js instead of duplicating it.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const user = await verifyToken(token);
      socket.user = user;
      next();
    } catch (err) {
      next(new Error(err.message || 'Authentication failed.'));
    }
  });

  io.on('connection', (socket) => {
    // ── Own-user room ────────────────────────────────────────────────────
    // Every socket auto-joins a room named after its own user id, once, on
    // connection — no map to maintain, no cleanup needed on disconnect, and
    // it covers multiple tabs/devices for free. notifyUser() (src/utils/notify.js)
    // emits 'notification:new' to this room instead of tracking userId -> socketId
    // by hand, same reasoning as why chat doesn't do custom presence tracking.
    socket.join(socket.user._id.toString());

    // ── Private rooms ────────────────────────────────────────────────────
    // Client emits { chatId } to join the room for a chat it's actually part
    // of. We never trust the client's claim — one DB lookup confirms it.
    socket.on('join_chat', async ({ chatId } = {}) => {
      try {
        const chat = await findChatForParticipant(chatId, socket.user._id);
        if (!chat) {
          socket.emit('error', { message: 'Not authorized to join this chat.' });
          return;
        }
        socket.join(chatId);

        // ── Seen status ──────────────────────────────────────────────────
        // Opening a chat marks every message from the other participant as
        // seen — one bulk update, not a loop.
        await Message.updateMany(
          { chat: chatId, sender: { $ne: socket.user._id }, seenBy: { $ne: socket.user._id } },
          { $addToSet: { seenBy: socket.user._id } }
        );
        io.to(chatId).emit('messages_seen', { chatId, seenBy: socket.user._id.toString() });
      } catch (err) {
        socket.emit('error', { message: 'Could not join chat.' });
      }
    });

    // ── Sending a message ───────────────────────────────────────────────
    socket.on('send_message', async ({ chatId, text } = {}) => {
      try {
        if (!text || !text.trim()) return;

        const chat = await findChatForParticipant(chatId, socket.user._id);
        if (!chat) {
          socket.emit('error', { message: 'Not authorized to message in this chat.' });
          return;
        }

        const message = await Message.create({
          chat: chatId,
          sender: socket.user._id,
          text: text.trim(),
          seenBy: [socket.user._id], // sender has obviously "seen" their own message
        });
        await message.populate('sender');

        chat.lastMessage = message._id;
        await chat.save(); // bumps updatedAt, which is what getChats sorts by

        // Broadcasts to everyone in the room — both participants, including
        // the sender's own other tabs/devices.
        io.to(chatId).emit('new_message', message);

        // Notify the other participant. Required lazily to sidestep a require
        // cycle (notify.js -> getIO() -> this file); by the time a message is
        // actually sent, initSocket() has long since finished and getIO() is safe.
        notifyUser = notifyUser || require('../utils/notify').notifyUser;
        const receiverId = chat.participants.find((p) => p.toString() !== socket.user._id.toString());
        if (receiverId) {
          notifyUser(receiverId, {
            type: 'message',
            message: `${socket.user.name} sent you a message.`,
            relatedId: chatId,
          }).catch((err) => console.warn('[notify] message notification failed:', err.message));
        }
      } catch (err) {
        socket.emit('error', { message: 'Could not send message.' });
      }
    });

    // ── Typing indicator ────────────────────────────────────────────────
    // Pure relay: no DB write, no server-side state. socket.to() (not io.to())
    // excludes the sender so they don't see their own "typing" indicator.
    socket.on('typing', ({ chatId } = {}) => {
      if (!chatId) return;
      socket.to(chatId).emit('typing', { userId: socket.user._id.toString() });
    });
  });

  return io;
}

/** Lets REST controllers (e.g. the chat image endpoint) emit on the same io instance. */
function getIO() {
  if (!io) throw new Error('Socket.io has not been initialized yet.');
  return io;
}

module.exports = { initSocket, getIO };
