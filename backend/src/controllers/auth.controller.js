const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
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

  // Accounts created via Google sign-in have no password to compare against.
  if (!user.passwordHash) {
    throw new ApiError(400, 'This account uses Google sign-in. Choose "Continue with Google" instead.');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(user);
  res.json(new ApiResponse(200, { token, user }, 'Logged in.'));
});

let googleClient = null;
function getGoogleClient() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, 'Google sign-in is not configured on the server.');
  }
  if (!googleClient) googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return googleClient;
}

/**
 * POST /api/auth/google
 * Body: { credential } — the ID token Google Identity Services hands the
 * browser. We verify its signature + audience server-side (never trust a
 * client-supplied email), apply the same college-email rule as password
 * signup, then find-or-create the user and issue our own JWT.
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ApiError(400, 'Google credential is required.');

  const client = getGoogleClient();
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(401, 'Google sign-in failed. Please try again.');
  }

  if (!payload || !payload.email || !payload.email_verified) {
    throw new ApiError(401, 'Your Google email address is not verified.');
  }

  const email = payload.email.trim().toLowerCase();
  assertCollegeEmail(email);

  let user = await User.findOne({ email }).select('+googleId');
  let created = false;

  if (user) {
    if (user.isBlocked) throw new ApiError(403, 'This account has been blocked.');
    if (user.googleId && user.googleId !== payload.sub) {
      throw new ApiError(409, 'This email is linked to a different Google account.');
    }
    // First Google login on an existing password account: link it (the email
    // is Google-verified, so this is safe) and adopt their Google photo.
    let dirty = false;
    if (!user.googleId) { user.googleId = payload.sub; dirty = true; }
    if (!user.picture && payload.picture) { user.picture = payload.picture; dirty = true; }
    if (dirty) await user.save();
  } else {
    user = await User.create({
      name: (payload.name || email.split('@')[0]).trim(),
      email,
      googleId: payload.sub,
      picture: payload.picture || '',
    });
    created = true;
  }

  const token = signToken(user);
  res
    .status(created ? 201 : 200)
    .json(new ApiResponse(created ? 201 : 200, { token, user }, created ? 'Account created.' : 'Logged in.'));
});

/** GET /api/auth/me (protected) */
const me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }));
});

module.exports = { signup, login, googleLogin, me };
