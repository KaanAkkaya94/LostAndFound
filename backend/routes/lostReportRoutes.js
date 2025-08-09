const express = require('express');
const { getReports, addReport, updateReport, deleteReport, getAllReports } = require('../controllers/lostReportController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', protect, getAllReports); // <-- Add this line

router.route('/').get(protect, getReports).post(protect, addReport);
router.route('/:id').put(protect, updateReport).delete(protect, deleteReport);

// Add comment to a report
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const report = await LostReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    const comment = {
      user: req.user.id,
      text: req.body.text
    };
    report.comments.push(comment);
    await report.save();
    res.status(201).json(report.comments[report.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;