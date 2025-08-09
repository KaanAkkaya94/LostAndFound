import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const LostReportForm = ({ reports, setReports, editingReport, setEditingReport }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    location: '',
    dateLost: ''
  });

  useEffect(() => {
    if (editingReport) {
      setFormData({
        itemName: editingReport.itemName,
        description: editingReport.description,
        location: editingReport.location,
        dateLost: editingReport.dateLost ? editingReport.dateLost.substring(0, 10) : ''
      });
    } else {
      setFormData({ itemName: '', description: '', location: '', dateLost: '' });
    }
  }, [editingReport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReport) {
        const response = await axiosInstance.put(`/api/lostreports/${editingReport._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReports(reports.map((report) => (report._id === response.data._id ? response.data : report)));
      } else {
        const response = await axiosInstance.post('/api/lostreports', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReports([...reports, response.data]);
      }
      setEditingReport(null);
      setFormData({ itemName: '', description: '', location: '', dateLost: '' });
    } catch (error) {
      alert('Failed to save lost item report.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg mb-6 border-l-4 border-purple-700">
      <h1 className="text-2xl font-bold mb-4 text-purple-700">{editingReport ? 'Edit Lost Item Report' : 'Create Lost Item Report'}</h1>
      <input
        type="text"
        placeholder="Item Name"
        value={formData.itemName}
        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <input
        type="date"
        value={formData.dateLost}
        onChange={(e) => setFormData({ ...formData, dateLost: e.target.value })}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />
      <button type="submit" className="w-full bg-purple-700 text-white p-2 rounded font-bold hover:bg-pink-500 transition">
        {editingReport ? 'Update Report' : 'Create Report'}
      </button>
    </form>
  );
};

export default LostReportForm;