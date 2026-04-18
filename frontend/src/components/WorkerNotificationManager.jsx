import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

const WorkerNotificationManager = ({ children }) => {
  const { user } = useAuth();
  const [pendingJob, setPendingJob] = useState(null);

  useEffect(() => {
    // Only run if the user is a worker
    if (!user || user.role !== 'worker') return;

    const checkJobs = async () => {
      try {
        const res = await api.get('/worker/jobs');
        const assignedJobs = res.data.data.filter(job => job.status === 'assigned');
        if (assignedJobs.length > 0) {
          // Show the first assigned job
          setPendingJob(assignedJobs[0]);
        } else {
          setPendingJob(null);
        }
      } catch (error) {
        console.error('Failed to fetch worker jobs for notification', error);
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
        // According to spec, accepting it should set it to 'in-progress'
        // Wait, the backend currently doesn't change status to in-progress for 'acceptJob', it just says 'Job accepted'.
        // Let's call updateJobStatus directly to set it to 'in-progress'
        await api.put(`/worker/jobs/${jobId}/status`, { status: 'in-progress' });
        toast.success('Job Accepted and is now In-Progress!');
      } else if (action === 'reject') {
        await api.put(`/worker/jobs/${jobId}/reject`, { reason: 'Schedule conflict' });
        toast.error('Job Rejected');
      }
      
      setPendingJob(null);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} job`);
    }
  };

  return (
    <>
      {children}
      
      {/* Notification Modal */}
      {pendingJob && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-bounce-in">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-primary shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">New Job Request!</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>{pendingJob.serviceId?.title}</strong>
              </p>
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <p>📍 {pendingJob.address?.street}, {pendingJob.address?.city}</p>
                <p>📅 {new Date(pendingJob.date).toLocaleDateString()} | {pendingJob.timeSlot}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(pendingJob._id, 'accept')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Accept
                </button>
                <button 
                  onClick={() => handleAction(pendingJob._id, 'reject')}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkerNotificationManager;
