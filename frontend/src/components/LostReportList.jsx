import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const LostReportList = ({ reports, setReports, setEditingReport }) => {
  const { user } = useAuth();

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axiosInstance.delete(`/api/lostreports/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setReports(reports.filter((report) => report._id !== id));
    } catch (error) {
      alert('Failed to delete lost item report.');
    }
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-purple-700">Lost Item Reports</h2>
      {reports.length === 0 ? (
        <p className="text-gray-500">No lost item reports found.</p>
      ) : (
        <ul>
          {reports.map((report) => (
            <li key={report._id} className="mb-4 border-b pb-2">
              <div>
                <strong>Item:</strong> {report.itemName}
              </div>
              <div>
                <strong>Description:</strong> {report.description}
              </div>
              <div>
                <strong>Location:</strong> {report.location}
              </div>
              <div>
                <strong>Date Lost:</strong> {report.dateLost ? report.dateLost.substring(0, 10) : ''}
              </div>
              <button
                className="mr-2 bg-pink-500 text-white px-2 py-1 rounded hover:bg-pink-700 transition"
                onClick={() => setEditingReport(report)}
              >
                Edit
              </button>
              <button
                className="bg-yellow-400 text-purple-900 px-2 py-1 rounded hover:bg-yellow-600 transition"
                onClick={() => handleDelete(report._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LostReportList;