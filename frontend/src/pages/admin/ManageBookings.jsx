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
  
  const [modal, setModal] = useState({ show: false, type: '', booking: null, payment: null });

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

  const openPaymentModal = async (booking) => {
    setModal({ show: true, type: 'payment', booking, payment: null });
    try {
      const res = await api.get(`/admin/bookings/${booking._id}/payment`);
      setModal(prev => ({ ...prev, payment: res.data.data }));
    } catch (error) {
      toast.error('Failed to load payment details');
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
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => setModal({ show: true, type: 'progress', booking })}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        View Progress
                      </button>
                      <button 
                        onClick={() => openPaymentModal(booking)}
                        className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        Payment Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Progress / Payment Details Modal */}
      {modal.show && modal.booking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {modal.type === 'progress' ? 'Booking Progress' : 'Payment Details'}
                </h2>
                <p className="font-mono text-sm text-gray-500">ID: {modal.booking._id}</p>
              </div>
              <StatusBadge status={modal.booking.status} />
            </div>

            {modal.type === 'progress' ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${modal.booking.status !== 'cancelled' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="font-medium">Pending (Created)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${['assigned', 'in-progress', 'completed'].includes(modal.booking.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="font-medium">Assigned</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${['in-progress', 'completed'].includes(modal.booking.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${modal.booking.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="font-medium">Completed</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2">Assigned Professional</p>
                  {modal.booking.workerId ? (
                    <div>
                      <p className="font-bold text-indigo-900">{modal.booking.workerId?.name}</p>
                      <p className="text-sm text-indigo-700">{modal.booking.workerId?.phone || 'No contact info'}</p>
                    </div>
                  ) : (
                    <p className="text-indigo-900">Not assigned yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">₹{modal.booking.totalAmount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Payment Type</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{modal.booking.paymentType}</p>
                  </div>
                </div>

                {modal.payment ? (
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                      <span className="font-semibold text-blue-900">Payment Status</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{modal.payment.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Razorpay ID</span>
                      <span className="font-mono text-sm font-semibold">{modal.payment.razorpayPaymentId || modal.payment.razorpayOrderId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-800">Admin Commission</span>
                      <span className="font-semibold text-green-700">+ ₹{modal.payment.adminCommission}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-800">Worker Earnings</span>
                      <span className="font-semibold text-green-700">+ ₹{modal.payment.workerEarnings}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 text-center">
                    <p className="text-yellow-800 font-semibold">Payment has not been made yet.</p>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setModal({ show: false, type: '', booking: null, payment: null })}
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
