const express = require('express');
const {
  getUsers,
  banUser,
  getListings,
  removeListing,
  resolveFlag,
  getReports,
  resolveReport,
  getStats,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.use(protect, isAdmin); // every admin route requires a logged-in admin — same mount pattern as wishlist.routes.js's router.use(protect)

router.get('/stats', getStats);

router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);

router.get('/listings', getListings);
router.patch('/listings/:id/remove', removeListing);
router.patch('/listings/:id/resolve-flag', resolveFlag);

router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

module.exports = router;
