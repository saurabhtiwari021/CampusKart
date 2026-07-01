const ApiError = require('../utils/ApiError');

/**
 * Gates admin-only routes. Sits after `protect` in the chain — protect
 * establishes who the user is, this establishes whether they're allowed.
 * Never mounted alone.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required.');
  }
  next();
};

module.exports = isAdmin;
