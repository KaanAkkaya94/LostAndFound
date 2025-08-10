const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const LostReport = require('../models/LostReport');
const { updateReport, getReports, addReport, deleteReport } = require('../controllers/lostReportController');
const { expect } = chai;

chai.use(chaiHttp);

afterEach(() => {
  sinon.restore();
});

describe('AddLostReport Function Test', () => {

  it('should create a new lost report successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { itemName: "New Lost Report", description: "Lost Report description", location: "Library", dateLost: "2025-12-31" }
    };

    // Mock report that would be created
    const createdReport = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

    // Stub LostReport.create to return the createdReport
    const createStub = sinon.stub(LostReport, 'create').resolves(createdReport);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addReport(req, res);

    // Assertions
    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdReport)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    // Stub LostReport.create to throw an error
    const createStub = sinon.stub(LostReport, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { itemName: "New Lost Report", description: "Lost Report description", location: "Library", dateLost: "2025-12-31" }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addReport(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});


describe('Update Function Test', () => {

  it('should update report successfully', async () => {
    // Mock report data
    const reportId = new mongoose.Types.ObjectId();
    const existingReport = {
      _id: reportId,
      itemName: "Old Report",
      description: "Old Description",
      location: "Old Location",
      dateLost: "2025-01-01",
      save: sinon.stub().resolvesThis(), // Mock save method
    };
    // Stub LostReport.findById to return mock report
    const findByIdStub = sinon.stub(LostReport, 'findById').resolves(existingReport);

    // Mock request & response
    const req = {
      params: { id: reportId },
      body: { itemName: "New Report", location: "New Location" }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateReport(req, res);

    // Assertions
    expect(existingReport.itemName).to.equal("New Report");
    expect(existingReport.location).to.equal("New Location");
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 404 if report is not found', async () => {
    const findByIdStub = sinon.stub(LostReport, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateReport(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Report not found' })).to.be.true;
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(LostReport, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateReport(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });

});

describe('GetReports Function Test', () => {

  it('should return reports for the given user', async () => {
    // Mock user ID
    const userId = new mongoose.Types.ObjectId();

    // Mock report data
    const reports = [
      { _id: new mongoose.Types.ObjectId(), itemName: "Report 1", userId },
      { _id: new mongoose.Types.ObjectId(), itemName: "Report 2", userId }
    ];

    // Stub LostReport.find to return mock reports
    const findStub = sinon.stub(LostReport, 'find').resolves(reports);

    // Mock request & response
    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getReports(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(reports)).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set
  });

  it('should return 500 on error', async () => {
    // Stub LostReport.find to throw an error
    const findStub = sinon.stub(LostReport, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getReports(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});

describe('DeleteReport Function Test', () => {

  it('should delete a report successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock report found in the database
    const report = { remove: sinon.stub().resolves() };

    // Stub LostReport.findById to return the mock report
    const findByIdStub = sinon.stub(LostReport, 'findById').resolves(report);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteReport(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(report.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Report deleted' })).to.be.true;
  });

  it('should return 404 if report is not found', async () => {
    // Stub LostReport.findById to return null
    const findByIdStub = sinon.stub(LostReport, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteReport(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Report not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    // Stub LostReport.findById to throw an error
    const findByIdStub = sinon.stub(LostReport, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteReport(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});

