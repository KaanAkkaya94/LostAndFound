const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const lostReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  dateLost: { type: Date, required: true },
  comments: [commentSchema]
});

module.exports = mongoose.model('LostReport', lostReportSchema);