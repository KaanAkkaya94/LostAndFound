import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import lostImage from '../lost.jpg'; 

const AllReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [editCommentText, setEditCommentText] = useState({});
  const [editingReport, setEditingReport] = useState({});
  const [editReportData, setEditReportData] = useState({});
  const [loading, setLoading] = useState(false);

  // Get search query from URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const search = params.get('search')?.toLowerCase() || '';

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      try {
        const config = user
          ? { headers: { Authorization: `Bearer ${user.token}` } }
          : {};
        const response = await axiosInstance.get('/api/lostreports/all', config);
        setReports(response.data);
      } catch (error) {
        alert('Failed to fetch reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, [user]);

  // Filter reports by search query
  const filteredReports = reports.filter(report =>
    report.itemName?.toLowerCase().includes(search) ||
    report.description?.toLowerCase().includes(search) ||
    report.location?.toLowerCase().includes(search)
  );

  // --- Comment Handlers ---
  const handleCommentChange = (reportId, value) => {
    setCommentText({ ...commentText, [reportId]: value });
  };

  const handleCommentSubmit = async (reportId) => {
    if (!user) return;
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
    if (!user) return;
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
    if (!user) return;
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

  // --- Report Edit Handlers ---
  const handleEditReportClick = (report) => {
    setEditingReport({ ...editingReport, [report._id]: true });
    setEditReportData({
      ...editReportData,
      [report._id]: {
        itemName: report.itemName,
        description: report.description,
        location: report.location,
        dateLost: report.dateLost ? report.dateLost.substring(0, 10) : ''
      }
    });
  };

  const handleEditReportChange = (reportId, field, value) => {
    setEditReportData({
      ...editReportData,
      [reportId]: {
        ...editReportData[reportId],
        [field]: value
      }
    });
  };

  const handleEditReportSave = async (reportId) => {
    try {
      await axiosInstance.put(
        `/api/lostreports/${reportId}`,
        editReportData[reportId],
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReports(reports.map(r =>
        r._id === reportId
          ? { ...r, ...editReportData[reportId] }
          : r
      ));
      setEditingReport({ ...editingReport, [reportId]: false });
    } catch (error) {
      alert('Failed to update report.');
    }
  };

  const handleEditReportCancel = (reportId) => {
    setEditingReport({ ...editingReport, [reportId]: false });
  };

  // --- Report Delete Handler ---
  const handleDeleteReport = async (reportId) => {
    if (!user) return;
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
      {/* This is the lost and found logo and message */}
      <div className="flex flex-col items-center mb-6 relative w-full" style={{ minHeight: '340px' }}>
        <img
          src={lostImage}
          alt="Lost and Found"
          style={{
            width: '100%',
            maxWidth: '1500px',
            height: '480px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 2px 8px #ccc',
            filter: 'brightness(0.7)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '1500px',
            height: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textShadow: '0 2px 8px #333',
            pointerEvents: 'none'
          }}
        >
          <h1 className="text-4xl font-bold" style={{ color: 'white', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 24px' }}>
            Welcome to the Lost and Found App
          </h1>
          <p className="text-lg mt-4" style={{ color: 'white', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '6px 18px' }}>
            Browse lost item reports below. {user ? 'You can comment and manage your reports.' : 'Login to comment or manage your reports.'}
          </p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-purple-700">All Lost Item Reports</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        filteredReports.map((report) => {
          const isReportOwner = user && report.userId && (report.userId._id === user?.id || report.userId === user?.id);
          return (
            <div key={report._id} className="bg-white p-6 mb-6 rounded-lg shadow border-l-4 border-purple-700">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg">{report.itemName}</div>
                {isReportOwner && (
                  <span>
                    <button
                      onClick={() => handleEditReportClick(report)}
                      className="ml-2 text-blue-500 hover:underline text-xs"
                    >
                      Edit Report
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report._id)}
                      className="ml-2 text-red-500 hover:underline text-xs"
                    >
                      Delete Report
                    </button>
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Reported by: {report.userId?.name || "Unknown"}
              </div>
              {editingReport[report._id] ? (
                <div className="mb-2">
                  <input
                    type="text"
                    value={editReportData[report._id]?.itemName || ''}
                    onChange={e => handleEditReportChange(report._id, 'itemName', e.target.value)}
                    className="block mb-1 p-1 border rounded w-full"
                    placeholder="Item Name"
                  />
                  <input
                    type="text"
                    value={editReportData[report._id]?.description || ''}
                    onChange={e => handleEditReportChange(report._id, 'description', e.target.value)}
                    className="block mb-1 p-1 border rounded w-full"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    value={editReportData[report._id]?.location || ''}
                    onChange={e => handleEditReportChange(report._id, 'location', e.target.value)}
                    className="block mb-1 p-1 border rounded w-full"
                    placeholder="Location"
                  />
                  <input
                    type="date"
                    value={editReportData[report._id]?.dateLost || ''}
                    onChange={e => handleEditReportChange(report._id, 'dateLost', e.target.value)}
                    className="block mb-1 p-1 border rounded w-full"
                    placeholder="Date Lost"
                  />
                  <button
                    onClick={() => handleEditReportSave(report._id)}
                    className="mr-2 text-green-600 hover:underline text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleEditReportCancel(report._id)}
                    className="text-gray-500 hover:underline text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div><strong>Description:</strong> {report.description}</div>
                  <div><strong>Location:</strong> {report.location}</div>
                  <div><strong>Date Lost:</strong> {report.dateLost ? report.dateLost.substring(0, 10) : ''}</div>
                </>
              )}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Comments:</h3>
                <ul className="mb-2">
                  {(report.comments || []).map((comment, idx) => {
                    const isOwner =
                      user &&
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
                        {user && isOwner && !editingComment[comment._id] && (
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
                {user ? (
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
                ) : (
                  <div className="text-gray-500 text-sm italic">Login to add a comment.</div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AllReports;