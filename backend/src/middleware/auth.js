const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Verifies a raw JWT string and resolves the corresponding user doc.
 * Shared by the REST `protect` middleware below and the Socket.IO auth
 * middleware (src/socket/index.js) so token verification only lives in one
 * place instead of being duplicated across HTTP and socket auth paths.
 */
async function verifyToken(token) {
  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'User no longer exists.');
  }
  if (user.isBlocked) {
    throw new ApiError(403, 'This account has been blocked.');
  }

  return user;
}

/** Verifies the Bearer JWT and attaches the user doc to req.user. */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  req.user = await verifyToken(token);
  next();
});

module.exports = { protect, verifyToken };
