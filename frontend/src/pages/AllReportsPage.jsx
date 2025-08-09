import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const AllReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      try {
      const response = await axiosInstance.get('/api/lostreports/all', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
        setReports(response.data);
      } catch (error) {
        alert('Failed to fetch reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, [user]);

  const handleCommentChange = (reportId, value) => {
    setCommentText({ ...commentText, [reportId]: value });
  };

  const handleCommentSubmit = async (reportId) => {
    if (!commentText[reportId]) return;
    try {
      const response = await axiosInstance.post(
        `/api/lostreports/${reportId}/comments`,
        { text: commentText[reportId] },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReports(reports.map(r =>
        r._id === reportId
          ? { ...r, comments: [...(r.comments || []), response.data] }
          : r
      ));
      setCommentText({ ...commentText, [reportId]: '' });
    } catch (error) {
      alert('Failed to add comment.');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-purple-100 via-yellow-50 to-pink-100 min-h-screen rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">All Lost Item Reports</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        reports.map((report) => (
          <div key={report._id} className="bg-white p-6 mb-6 rounded-lg shadow border-l-4 border-purple-700">
            <div className="font-bold text-lg">{report.itemName}</div>
            <div><strong>Description:</strong> {report.description}</div>
            <div><strong>Location:</strong> {report.location}</div>
            <div><strong>Date Lost:</strong> {report.dateLost ? report.dateLost.substring(0, 10) : ''}</div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Comments:</h3>
              <ul className="mb-2">
                {(report.comments || []).map((comment, idx) => (
                  <li key={idx} className="mb-1 border-b pb-1 text-sm">
                    <span className="font-semibold text-purple-700">{comment.user?.name || 'User'}:</span> {comment.text}
                  </li>
                ))}
              </ul>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText[report._id] || ''}
                  onChange={e => handleCommentChange(report._id, e.target.value)}
                  className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleCommentSubmit(report._id)}
                  className="bg-purple-700 text-white px-4 rounded-r hover:bg-pink-500 transition"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AllReports;