import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// Load Razorpay Script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ show: false, bookingId: null, rating: 5, review: '' });
  
  const { user } = useAuth();
  const location = useLocation();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [location.key]);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${id}/cancel`);
        toast.success('Booking cancelled');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const submitReview = async () => {
    try {
      await api.put(`/bookings/${reviewModal.bookingId}/rate`, {
        rating: reviewModal.rating,
        review: reviewModal.review
      });
      toast.success('Review submitted successfully');
      setReviewModal({ show: false, bookingId: null, rating: 5, review: '' });
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handlePayNow = async (booking) => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const orderRes = await api.post('/payments/create-order', { bookingId: booking._id });
      const { orderId, amount } = orderRes.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy',
        amount: amount * 100,
        currency: 'INR',
        name: 'ServEase',
        description: booking.serviceId.title,
        order_id: orderId,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id
            });
            toast.success('Payment successful!');
            fetchBookings();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#1E40AF' }
      };

      if (!options.key) {
        console.error("Razorpay key is missing from frontend environment variables");
        toast.error("Payment configuration error");
        return;
      }

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-500 mb-4">You have no bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-32 flex-shrink-0">
                <img src={booking.serviceId?.image} alt={booking.serviceId?.title} className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{booking.serviceId?.title}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="text-sm text-gray-500 space-y-1 mb-4">
                    <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()} | <strong>Time:</strong> {booking.timeSlot}</p>
                    <p><strong>Amount:</strong> ₹{booking.totalAmount} ({booking.paymentType} payment)</p>
                    {booking.workerId && (
                      <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                        <img 
                          src={booking.workerId.avatar || `https://ui-avatars.com/api/?name=${booking.workerId.name}`} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                        />
                        <div>
                          <p className="text-[10px] font-bold text-accent uppercase">{booking.workerId.serviceType || booking.serviceId?.category}</p>
                          <p className="text-sm font-semibold text-gray-900">{booking.workerId.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-auto">
                  {booking.status === 'pending' && (
                    <button onClick={() => handleCancel(booking._id)} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      Cancel Booking
                    </button>
                  )}
                  
                  {booking.status === 'completed' && booking.paymentType === 'after' && !booking.isPaid && (
                    <button onClick={() => handlePayNow(booking)} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-800 rounded-lg transition-colors">
                      Pay Now
                    </button>
                  )}

                  {booking.status === 'completed' && !booking.rating && (
                    <button 
                      onClick={() => setReviewModal({ show: true, bookingId: booking._id, rating: 5, review: '' })} 
                      className="px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      Rate & Review
                    </button>
                  )}
                  {booking.rating && (
                     <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                       <span className="text-sm text-gray-500">Your Rating:</span>
                       <RatingStars rating={booking.rating} readOnly={true} />
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Rate Service</h3>
            <div className="mb-6 flex justify-center">
              <RatingStars 
                rating={reviewModal.rating} 
                onRate={(r) => setReviewModal({ ...reviewModal, rating: r })} 
                readOnly={false} 
              />
            </div>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary mb-6"
              rows="3"
              placeholder="Share your experience..."
              value={reviewModal.review}
              onChange={(e) => setReviewModal({ ...reviewModal, review: e.target.value })}
            ></textarea>
            <div className="flex gap-4">
              <button onClick={() => setReviewModal({ show: false, bookingId: null, rating: 5, review: '' })} className="w-1/2 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={submitReview} className="w-1/2 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-800">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
