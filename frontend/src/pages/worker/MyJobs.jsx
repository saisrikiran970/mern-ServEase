import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, in-progress, completed
  
  const { user } = useAuth();

  const fetchJobs = async () => {
    try {
      const res = await api.get('/worker/jobs');
      setJobs(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') {
        await api.put(`/worker/jobs/${id}/accept`);
        toast.success('Job Accepted');
      } else if (action === 'reject') {
        await api.put(`/worker/jobs/${id}/reject`, { reason: 'Schedule conflict' });
        toast.success('Job Rejected');
      } else if (action === 'start') {
        await api.put(`/worker/jobs/${id}/status`, { status: 'in-progress' });
        toast.success('Job started');
      } else if (action === 'complete') {
        await api.put(`/worker/jobs/${id}/status`, { status: 'completed' });
        toast.success('Job Marked as Complete');
      }
      
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  if (user?.isActive === false) return null; // handled in Dashboard
  if (loading) return <div>Loading...</div>;

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'pending') return job.status === 'assigned';
    if (activeTab === 'in-progress') return job.status === 'in-progress';
    if (activeTab === 'completed') return job.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-heading font-bold text-gray-900">My Jobs</h1>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {['pending', 'in-progress', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              {tab === 'pending' ? 'Pending' : tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No jobs found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{job.serviceId?.title}</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">{job.paymentType} payment</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">₹{job.totalAmount}</p>
                  {job.status === 'completed' && job.netEarnings && (
                    <p className="text-sm font-semibold text-green-600">Net: ₹{job.netEarnings}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 text-sm text-gray-700">
                <p><strong>Customer:</strong> {job.userId?.name.split(' ')[0]}</p>
                <p><strong>Date & Time:</strong> {new Date(job.date).toLocaleDateString()} | {job.timeSlot}</p>
                <p><strong>Address:</strong> {job.address?.street}, {job.address?.city} - {job.address?.pincode}</p>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                {job.status === 'assigned' && (
                  <>
                    <button onClick={() => handleAction(job._id, 'reject')} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition-colors">Reject</button>
                    <button onClick={() => handleAction(job._id, 'accept')} className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl transition-colors">Accept</button>
                  </>
                )}
                {job.status === 'in-progress' && (
                  <button onClick={() => handleAction(job._id, 'complete')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">Mark as Completed</button>
                )}
                {job.status === 'completed' && (
                  <div className="w-full flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="font-semibold text-gray-700">Payment Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {job.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
