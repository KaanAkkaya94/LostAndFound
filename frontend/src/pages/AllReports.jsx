import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const AllReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [editCommentText, setEditCommentText] = useState({});
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
      const newComment = {
        ...response.data,
        user: { _id: user?.id, name: user?.name || 'User' }
      };
      setReports(reports.map(r =>
        r._id === reportId
          ? { ...r, comments: [...(r.comments || []), newComment] }
          : r
      ));
      setCommentText({ ...commentText, [reportId]: '' });
    } catch (error) {
      alert('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (reportId, commentId) => {
    try {
      await axiosInstance.delete(
        `/api/lostreports/${reportId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReports(reports.map(r =>
        r._id === reportId
          ? { ...r, comments: r.comments.filter(c => c._id !== commentId) }
          : r
      ));
    } catch (error) {
      alert('Failed to delete comment.');
    }
  };

  const handleEditClick = (commentId, currentText) => {
    setEditingComment({ ...editingComment, [commentId]: true });
    setEditCommentText({ ...editCommentText, [commentId]: currentText });
  };

  const handleEditChange = (commentId, value) => {
    setEditCommentText({ ...editCommentText, [commentId]: value });
  };

  const handleEditSave = async (reportId, commentId) => {
    try {
      await axiosInstance.put(
        `/api/lostreports/${reportId}/comments/${commentId}`,
        { text: editCommentText[commentId] },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReports(reports.map(r =>
        r._id === reportId
          ? {
              ...r,
              comments: r.comments.map(c =>
                c._id === commentId
                  ? { ...c, text: editCommentText[commentId] }
                  : c
              )
            }
          : r
      ));
      setEditingComment({ ...editingComment, [commentId]: false });
    } catch (error) {
      alert('Failed to edit comment.');
    }
  };

  const handleEditCancel = (commentId) => {
    setEditingComment({ ...editingComment, [commentId]: false });
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axiosInstance.delete(`/api/lostreports/${reportId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setReports(reports.filter(r => r._id !== reportId));
    } catch (error) {
      alert('Failed to delete report.');
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
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">{report.itemName}</div>
              {report.userId && (report.userId._id === user?.id || report.userId === user?.id) && (
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  className="ml-2 text-red-500 hover:underline text-xs"
                >
                  Delete Report
                </button>
              )}
            </div>
            <div><strong>Description:</strong> {report.description}</div>
            <div><strong>Location:</strong> {report.location}</div>
            <div><strong>Date Lost:</strong> {report.dateLost ? report.dateLost.substring(0, 10) : ''}</div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Comments:</h3>
              <ul className="mb-2">
                {(report.comments || []).map((comment, idx) => {
                  const isOwner =
                    comment.user &&
                    (comment.user._id === user?.id || comment.user === user?.id);
                  return (
                    <li key={comment._id || idx} className="mb-1 border-b pb-1 text-sm flex items-center justify-between">
                      {editingComment[comment._id] ? (
                        <span className="flex-1 flex items-center">
                          <input
                            type="text"
                            value={editCommentText[comment._id]}
                            onChange={e => handleEditChange(comment._id, e.target.value)}
                            className="flex-1 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => handleEditSave(report._id, comment._id)}
                            className="ml-2 text-green-600 hover:underline text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleEditCancel(comment._id)}
                            className="ml-2 text-gray-500 hover:underline text-xs"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span>
                          <span className="font-semibold text-purple-700">{comment.user?.name || 'User'}:</span> {comment.text}
                        </span>
                      )}
                      {isOwner && !editingComment[comment._id] && (
                        <span>
                          <button
                            onClick={() => handleEditClick(comment._id, comment.text)}
                            className="ml-2 text-blue-500 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(report._id, comment._id)}
                            className="ml-2 text-red-500 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
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