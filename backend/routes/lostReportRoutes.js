const express = require('express');
const { getReports, addReport, updateReport, deleteReport } = require('../controllers/lostReportController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getReports).post(protect, addReport);
router.route('/:id').put(protect, updateReport).delete(protect, deleteReport);

module.exports = router;