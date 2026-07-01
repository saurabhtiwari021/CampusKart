const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// College email allowlist — only @kiit.ac.in for now.
// Extend via ALLOWED_EMAIL_DOMAINS in .env (comma-separated) without touching code.
const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || 'kiit.ac.in')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

function assertCollegeEmail(email) {
  const domain = (email.split('@')[1] || '').toLowerCase();
  if (!ALLOWED_DOMAINS.includes(domain)) {
    throw new ApiError(
      400,
      `Only college emails are allowed (${ALLOWED_DOMAINS.map((d) => '@' + d).join(', ')}).`
    );
  }
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** POST /api/auth/signup */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) throw new ApiError(400, 'Name is required.');
  if (!email || !email.trim()) throw new ApiError(400, 'Email is required.');
  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  assertCollegeEmail(normalizedEmail);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists. Try logging in.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    // isVerified defaults to true on the schema for now — no email step yet.
  });

  const token = signToken(user);
  res.status(201).json(new ApiResponse(201, { token, user }, 'Account created.'));
});

/** POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  assertCollegeEmail(normalizedEmail);

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (user.isBlocked) {
    throw new ApiError(403, 'This account has been blocked.');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(user);
  res.json(new ApiResponse(200, { token, user }, 'Logged in.'));
});

/** GET /api/auth/me (protected) */
const me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }));
});

module.exports = { signup, login, me };
