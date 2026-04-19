import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const WorkerNotificationManager = () => {
  const { user } = useAuth();
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Only run if the user is a worker
    if (!user || user.role !== 'worker') return;

    const checkJobs = async () => {
      try {
        const res = await api.get('/worker/jobs/pending');
        setPendingNotifications(res.data.data);
        console.log('Worker polling executed. Assigned bookings found:', res.data.data.length);
      } catch (error) {
        console.error('Failed to fetch pending worker jobs', error);
      }
    };

    // Initial check
    checkJobs();

    // Check every 30 seconds
    const interval = setInterval(checkJobs, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleAction = async (jobId, action) => {
    try {
      if (action === 'accept') {
        await api.put(`/worker/jobs/${jobId}/accept`);
        toast.success('Job Accepted Successfully');
      } else if (action === 'reject') {
        await api.put(`/worker/jobs/${jobId}/reject`, { reason: 'Schedule conflict' });
        toast.success('Job Rejected');
      }
      
      setPendingNotifications(prev => prev.filter(job => job._id !== jobId));
      
      // If the worker is on the MyJobs page, we want to trigger a refresh.
      // Easiest way in this setup is to dispatch a custom event.
      if (location.pathname === '/worker/jobs') {
        window.dispatchEvent(new Event('refreshWorkerJobs'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} job`);
    }
  };

  if (!user || user.role !== 'worker' || pendingNotifications.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-3 mb-6">
      {pendingNotifications.map(job => (
        <div key={job._id} className="w-full max-w-4xl bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 shrink-0 mt-1">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">New Job Assigned: {job.serviceId?.title}</h3>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Customer:</span> {job.userId?.name} | <span className="font-semibold">Address:</span> {job.address?.street}, {job.address?.city}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Date:</span> {new Date(job.date).toLocaleDateString()} | <span className="font-semibold">Time:</span> {job.timeSlot} | <span className="font-semibold text-primary">₹{job.totalAmount}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
            <button 
              onClick={() => handleAction(job._id, 'accept')}
              className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Accept
            </button>
            <button 
              onClick={() => handleAction(job._id, 'reject')}
              className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkerNotificationManager;
