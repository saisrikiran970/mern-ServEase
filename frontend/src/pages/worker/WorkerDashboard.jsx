import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Briefcase, CheckCircle, DollarSign, Star } from 'lucide-react';
import RatingStars from '../../components/RatingStars';
import toast from 'react-hot-toast';
// import { Bar } from 'react-chartjs-2'; // optional implementation

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ completedJobs: 0, pendingJobs: 0, totalEarnings: 0, rating: 5 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store the last time we showed a reminder for a specific job ID
  const [lastReminders, setLastReminders] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          api.get('/worker/stats'),
          api.get('/worker/jobs')
        ]);
        setStats(statsRes.data.data);
        setJobs(jobsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch worker data', error);
      }
      setLoading(false);
    };

    fetchDashboardData();

    // Poll every 10 seconds
    const intervalId = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Filter jobs
  const pendingJobsList = jobs.filter(job => job.status === 'assigned');
  const activeJobsList = jobs.filter(job => job.status === 'in-progress');

  // 10-minute reminder alert logic
  useEffect(() => {
    if (pendingJobsList.length === 0) return;

    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;
    
    let updatedReminders = { ...lastReminders };
    let shouldShowAlert = false;

    pendingJobsList.forEach(job => {
      const lastShown = updatedReminders[job._id];
      if (!lastShown || (now - lastShown) >= TEN_MINUTES) {
        shouldShowAlert = true;
        updatedReminders[job._id] = now;
      }
    });

    if (shouldShowAlert) {
      setLastReminders(updatedReminders);
      // Show reminder alert
      // Using a custom toast that stays visible
      pendingJobsList.forEach(job => {
         const lastShown = lastReminders[job._id];
         if (!lastShown || (now - lastShown) >= TEN_MINUTES) {
           toast((t) => (
            <div className="flex flex-col gap-2">
              <p className="font-bold">New Job Request!</p>
              <p className="text-sm">{job.serviceId?.title} at {job.address?.street}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { handleAccept(job._id); toast.dismiss(t.id); }} className="bg-primary text-white px-3 py-1 rounded text-xs font-bold">Accept</button>
                <button onClick={() => { handleReject(job._id); toast.dismiss(t.id); }} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
              </div>
            </div>
          ), { duration: 20000, id: `job-${job._id}-${now}` }); // Stays visible for 20s or until action
         }
      });
    }
  }, [pendingJobsList, lastReminders]);

  const handleAccept = async (id) => {
    try {
      await api.put(`/worker/jobs/${id}/status`, { status: 'in-progress' });
      toast.success('Job accepted and moved to Active Jobs');
      // Optimistically update
      setJobs(jobs.map(j => j._id === id ? { ...j, status: 'in-progress' } : j));
    } catch (error) {
      toast.error('Failed to accept job');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/worker/jobs/${id}/reject`, { reason: 'Rejected by worker' });
      toast.success('Job rejected');
      // Optimistically update
      setJobs(jobs.map(j => j._id === id ? { ...j, status: 'rejected' } : j));
    } catch (error) {
      toast.error('Failed to reject job');
    }
  };

  if (user?.isActive === false) {
    return (
      <div className="bg-red-50 text-red-800 p-8 rounded-3xl border border-red-200 text-center shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Account Suspended</h2>
        <p>Your account is on hold due to low ratings or policy violations. Contact support.</p>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-1">Hello, {user.name}</h1>
          <p className="text-gray-500">Here's your performance overview</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-200">
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Your Rating</p>
            <p className="text-xl font-bold text-gray-900">{stats.rating.toFixed(1)} / 5.0</p>
          </div>
          <div className="h-10 w-px bg-gray-300"></div>
          <RatingStars rating={stats.rating} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Completed Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completedJobs}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Pending Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingJobs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">₹{stats.totalEarnings}</p>
          </div>
        </div>
      </div>

      {/* Pending Jobs Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Jobs / New Requests</h2>
        {pendingJobsList.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm">
            <p className="text-gray-500">No new job requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingJobsList.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-3xl border-2 border-yellow-200 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-bl-xl">ACTION REQUIRED</div>
                <div className="flex justify-between items-start mb-4 mt-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{job.serviceId?.title}</h3>
                    <p className="text-sm font-semibold text-primary">₹{job.totalAmount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">{new Date(job.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{job.timeSlot}</p>
                  </div>
                </div>
                <div className="mb-6 p-3 bg-gray-50 rounded-xl text-sm">
                  <p><span className="font-semibold">Customer:</span> {job.userId?.name}</p>
                  <p><span className="font-semibold">Address:</span> {job.address?.street}, {job.address?.city} {job.address?.pincode}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleAccept(job._id)} className="w-1/2 bg-primary hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors">Accept</button>
                  <button onClick={() => handleReject(job._id)} className="w-1/2 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Jobs</h2>
        {activeJobsList.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm">
            <p className="text-gray-500">You don't have any jobs in progress right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeJobsList.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{job.serviceId?.title}</h3>
                    <p className="text-sm font-semibold text-primary">₹{job.totalAmount}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-lg">In Progress</span>
                </div>
                <div className="mb-4 text-sm text-gray-600">
                  <p>{new Date(job.date).toLocaleDateString()} at {job.timeSlot}</p>
                  <p className="mt-1">{job.address?.street}, {job.address?.city}</p>
                </div>
                <div className="flex justify-end">
                   {/* We might add a complete button here later, but for now we just show it */}
                   <span className="text-xs text-gray-400 italic">Manage in My Jobs</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
