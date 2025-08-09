const express = require('express');
const { getReports, addReport, updateReport, deleteReport, getAllReports } = require('../controllers/lostReportController');
const { protect } = require('../middleware/authMiddleware');
const LostReport = require('../models/LostReport');
const router = express.Router();

router.get('/all', protect, getAllReports); 

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

//Editing comment on a report
router.put('/:reportId/comments/:commentId', protect, async (req, res) => {
  try {
    const report = await LostReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const comment = report.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Only allow the comment's owner to edit
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.text = req.body.text;
    await report.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//removing comment from a report
router.delete('/:reportId/comments/:commentId', protect, async (req, res) => {
  try {
    const report = await LostReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const comment = report.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Only allow the comment's owner to delete
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.remove();
    await report.save();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;