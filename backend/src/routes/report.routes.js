const express = require('express');
const { createReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // any logged-in user can file a report — no admin gate here

router.post('/', createReport);

module.exports = router;
