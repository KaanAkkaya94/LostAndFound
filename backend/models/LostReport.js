const mongoose = require('mongoose');

const lostReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    dateLost: { type: Date, required: true }
});

module.exports = mongoose.model('LostReport', lostReportSchema);