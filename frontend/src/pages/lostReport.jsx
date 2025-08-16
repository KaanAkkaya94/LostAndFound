import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import LostReportForm from '../components/LostReportForm';
import LostReportList from '../components/LostReportList';
import { useAuth } from '../context/AuthContext';

// This is a dummy jira commit

const LostReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axiosInstance.get('/api/lostreports', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReports(response.data);
      } catch (error) {
        alert('Failed to fetch lost item reports.');
      }
    };

    fetchReports();
  }, [user]);

  return (
      <div className="container mx-auto p-6 bg-gradient-to-br from-purple-100 via-yellow-50 to-pink-100 min-h-screen rounded-lg shadow">
      <LostReportForm
        reports={reports}
        setReports={setReports}
        editingReport={editingReport}
        setEditingReport={setEditingReport}
      />
      <LostReportList
        reports={reports}
        setReports={setReports}
        setEditingReport={setEditingReport}
      />
    </div>
  );
};

export default LostReports;