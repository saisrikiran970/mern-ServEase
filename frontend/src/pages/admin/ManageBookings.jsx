import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import { Search, Eye } from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [modal, setModal] = useState({ show: false, booking: null });
  const [availableWorkers, setAvailableWorkers] = useState([]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAssignWorker = async (workerId, bookingId) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/assign`, { workerId });
      toast.success('Worker assigned successfully');
      setModal({ show: false, booking: null });
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    }
  };

  const openAssignModal = async (booking) => {
    setModal({ show: true, booking });
    // Fetch workers for this category
    try {
      const res = await api.get('/admin/workers');
      // Dynamic suggestion logic: matching category, active, rating >= 2.5
      // (The actual backend also checks if they are booked on that exact date/time, 
      // but for simplicity in this frontend, we might show them and let backend reject if double booked,
      // or filter it here if we had their schedules. The spec says "Auto-suggest", so we filter by category).
      const workers = res.data.data.filter(w => 
        w.serviceType === booking.serviceId.category && 
        w.isActive && 
        w.rating >= 2.5
      );
      setAvailableWorkers(workers);
    } catch (error) {
      toast.error('Failed to load workers');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch = b._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (b.userId?.name && b.userId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter ? b.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Manage Bookings</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-xl bg-white focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID / Date</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Worker</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center">Loading...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No bookings found.</td></tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs text-gray-500 mb-1">{booking._id.substring(0, 8)}...</p>
                      <p className="text-sm font-semibold">{new Date(booking.date).toLocaleDateString()} | {booking.timeSlot}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{booking.userId?.name}</td>
                    <td className="px-6 py-4 text-sm">{booking.serviceId?.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{booking.workerId?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {['pending', 'paid'].includes(booking.status) ? (
                        <button 
                          onClick={() => openAssignModal(booking)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Assign Worker
                        </button>
                      ) : (
                        <button 
                          onClick={() => setModal({ show: true, booking })}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors inline-block"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail / Assign Worker Modal */}
      {modal.show && modal.booking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Booking Details</h2>
                <p className="font-mono text-sm text-gray-500">ID: {modal.booking._id}</p>
              </div>
              <StatusBadge status={modal.booking.status} />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Customer Details</p>
                <p className="font-semibold text-gray-900">{modal.booking.userId?.name}</p>
                <p className="text-sm text-gray-600">{modal.booking.userId?.email}</p>
                <p className="text-sm text-gray-600 mt-2">{modal.booking.address?.street}, {modal.booking.address?.city} - {modal.booking.address?.pincode}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Service Details</p>
                <p className="font-semibold text-gray-900">{modal.booking.serviceId?.title}</p>
                <p className="text-sm text-gray-600 mb-2">{new Date(modal.booking.date).toLocaleDateString()} | {modal.booking.timeSlot}</p>
                <p className="text-sm font-bold text-primary border-t border-gray-200 pt-2">₹{modal.booking.totalAmount} ({modal.booking.paymentType})</p>
              </div>
            </div>

            {['pending', 'paid'].includes(modal.booking.status) ? (
              <div>
                <h3 className="text-lg font-bold mb-4">Assign a Professional</h3>
                {availableWorkers.length === 0 ? (
                  <p className="text-red-500 bg-red-50 p-4 rounded-xl text-sm border border-red-100">No active workers found for this category ({modal.booking.serviceId?.category}) with a rating &gt;= 2.5.</p>
                ) : (
                  <div className="space-y-3">
                    {availableWorkers.map(worker => (
                      <div key={worker._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={worker.avatar || 'https://ui-avatars.com/api/?name=' + worker.name} alt="" className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="font-bold text-gray-900">{worker.name}</p>
                            <p className="text-xs text-gray-500">{worker.rating.toFixed(1)} ★ | {worker.completedJobs} jobs completed</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAssignWorker(worker._id, modal.booking._id)}
                          className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2">Assigned Professional</p>
                {modal.booking.workerId ? (
                  <p className="font-bold text-indigo-900">{modal.booking.workerId?.name}</p>
                ) : (
                  <p className="text-indigo-900">Not assigned or worker data missing.</p>
                )}
              </div>
            )}

            <button 
              onClick={() => setModal({ show: false, booking: null })}
              className="mt-8 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
