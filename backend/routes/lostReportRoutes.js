const express = require('express');
const { getReports, addReport, updateReport, deleteReport, getAllReports } = require('../controllers/lostReportController');
const { protect } = require('../middleware/authMiddleware');
const LostReport = require('../models/LostReport');
const Comment = require('../models/Comment');
const router = express.Router();

router.get('/all', getAllReports); 

router.route('/').get(protect, getReports).post(protect, addReport);
router.route('/:id').put(protect, updateReport).delete(protect, deleteReport);

// Add comment to a report
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const report = await LostReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Create the comment in the Comment collection
    const comment = await Comment.create({
      text: req.body.text,
      user: req.user.id,
      report: report._id
    });

    // Push a reference or the comment itself to the report's comments array
    report.comments.push({
      _id: comment._id, // store the comment's ObjectId
      user: req.user.id,
      text: req.body.text,
      createdAt: comment.createdAt
    });
    await report.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Editing comment on a report
router.put('/:reportId/comments/:commentId', protect, async (req, res) => {
  try {
    // Update in Comment collection
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    comment.text = req.body.text;
    await comment.save();

    // Update in report's comments array
    const report = await LostReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    const reportComment = report.comments.id(req.params.commentId);
    if (reportComment) {
      reportComment.text = req.body.text;
      await report.save();
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//removing comment from a report
router.delete('/:reportId/comments/:commentId', protect, async (req, res) => {
  try {
    // Remove from Comment collection
    await Comment.findByIdAndDelete(req.params.commentId);

    // Remove from report's comments array
    const report = await LostReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.comments = report.comments.filter(
      c => c._id.toString() !== req.params.commentId
    );
    await report.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all comments for a report from the Comment collection
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ report: req.params.id }).populate('user', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;