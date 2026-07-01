const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getIO } = require('../socket');

/** GET /api/chats — protected. All chats the logged-in user is part of, most-recently-active first. */
const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('participants')
    .populate('listing')
    .populate('lastMessage');

  // The frontend renders "who am I talking to", not "who's in this chat" —
  // collapse participants down to just the other person.
  const shaped = chats.map((c) => {
    const json = c.toJSON();
    json.otherUser = json.participants.find((p) => p.user_id !== req.user._id.toString()) || null;
    delete json.participants;
    return json;
  });

  res.json(new ApiResponse(200, { chats: shaped }));
});

/**
 * POST /api/chats — protected. Body: { listingId, otherUserId? }.
 * otherUserId is optional — if omitted, the other participant is derived from
 * the listing's owner (the "message the seller from a listing page" path).
 * Idempotent: returns the existing chat for this pair+listing instead of
 * creating a duplicate, same philosophy as the wishlist upsert.
 */
const createChat = asyncHandler(async (req, res) => {
  const { listingId, otherUserId } = req.body;
  if (!listingId) throw new ApiError(400, 'listingId is required.');

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  const otherId = otherUserId || listing.owner.toString();
  if (otherId === req.user._id.toString()) {
    throw new ApiError(400, "You can't start a chat with yourself.");
  }

  let chat = await Chat.findOne({
    listing: listingId,
    participants: { $all: [req.user._id, otherId] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, otherId],
      listing: listingId,
    });
  }

  await chat.populate(['participants', 'listing', 'lastMessage']);
  res.status(201).json(new ApiResponse(201, { chat }, 'Chat ready.'));
});

/** GET /api/chats/:chatId/messages — protected. 403s if the requester isn't a participant. */
const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) throw new ApiError(404, 'Chat not found.');
  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not part of this chat.');
  }

  const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 }).populate('sender');
  res.json(new ApiResponse(200, { messages }));
});

/**
 * POST /api/chats/:chatId/image — protected. multipart/form-data, one 'image' file.
 * No socket event for the upload itself — it's a normal REST call, same as
 * listing image uploads. The controller saves the Message then emits
 * 'new_message' on the chat's room itself, so it arrives the same way a text
 * message would on every connected client (including the sender's).
 */
const sendChatImage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) throw new ApiError(404, 'Chat not found.');
  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not part of this chat.');
  }
  if (!req.file) throw new ApiError(400, 'An image file is required.');

  const message = await Message.create({
    chat: chatId,
    sender: req.user._id,
    image: req.file.path, // Cloudinary URL, populated by multer-storage-cloudinary
    seenBy: [req.user._id],
  });
  await message.populate('sender');

  chat.lastMessage = message._id;
  await chat.save();

  getIO().to(chatId).emit('new_message', message);

  res.status(201).json(new ApiResponse(201, { message }, 'Image sent.'));
});

module.exports = { getChats, createChat, getMessages, sendChatImage };
