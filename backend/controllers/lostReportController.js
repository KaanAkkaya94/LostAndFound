// Lost Item Report Controller
const LostReport = require('../models/LostReport');

// Get Lost Reports (Read)
const getReports = async (req, res) => {
  try {
    const reports = await LostReport.find({ userId: req.user.id });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Lost Report
const addReport = async (req, res) => {
  const { itemName, description, location, dateLost } = req.body;
  try {
    const report = await LostReport.create({
      userId: req.user.id,
      itemName,
      description,
      location,
      dateLost,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Lost Report
const updateReport = async (req, res) => {
  const { itemName, description, location, dateLost } = req.body;
  try {
    const report = await LostReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.itemName = itemName || report.itemName;
    report.description = description || report.description;
    report.location = location || report.location;
    report.dateLost = dateLost || report.dateLost;
    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Lost Report
const deleteReport = async (req, res) => {
  try {
    const report = await LostReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    await report.remove();
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReports, addReport, updateReport, deleteReport };