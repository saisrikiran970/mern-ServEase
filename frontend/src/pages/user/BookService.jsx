import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

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

const BookService = () => {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    workerId: '', street: '', city: '', pincode: '', landmark: '',
    date: '', timeSlot: '', paymentType: 'after'
  });

  const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${serviceId}`);
        setService(res.data.data);
        const workersRes = await api.get(`/services/workers/${res.data.data.category}`);
        setWorkers(workersRes.data.data);
      } catch (error) {
        toast.error('Service not found');
        navigate('/services');
      }
      setLoading(false);
    };
    fetchService();
  }, [serviceId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = async () => {
    setProcessing(true);
    try {
      const payload = {
        serviceId,
        workerId: formData.workerId,
        address: {
          street: formData.street,
          city: formData.city,
          pincode: formData.pincode,
          landmark: formData.landmark
        },
        date: formData.date,
        timeSlot: formData.timeSlot,
        paymentType: formData.paymentType
      };

      console.log('Booking Payload:', payload);
      const res = await api.post('/bookings', payload);
      const booking = res.data.data;

      if (formData.paymentType === 'before') {
        // Init Razorpay
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load');
          setProcessing(false);
          return;
        }

        const orderRes = await api.post('/payments/create-order', { bookingId: booking._id });
        const { orderId, amount } = orderRes.data.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy',
          amount: amount * 100,
          currency: 'INR',
          name: 'ServEase',
          description: service.title,
          order_id: orderId,
          handler: async function (response) {
            try {
              await api.post('/payments/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: booking._id
              });
              setProcessing(false);
              toast.success('Booking Confirmed Successfully');
              navigate('/user/bookings');
            } catch (err) {
              setProcessing(false);
              toast.error('Payment verification failed');
              navigate('/user/bookings');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#1E40AF'
          }
        };
        
        if (!options.key) {
          console.error("Razorpay key is missing from frontend environment variables");
          toast.error("Payment configuration error");
          setProcessing(false);
          return;
        }

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response){
          toast.error('Payment failed');
          navigate('/user/bookings');
        });
        rzp1.open();
      } else {
        setProcessing(false);
        toast.success('Booking Confirmed Successfully');
        navigate('/user/bookings');
      }
    } catch (error) {
      setProcessing(false);
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-6 md:p-8">
        <h1 className="text-2xl font-heading font-bold mb-2">Book Service</h1>
        <p className="text-blue-100">{service?.title} • ₹{service?.price}</p>
        
        {/* Stepper */}
        <div className="flex items-center mt-6 text-xs sm:text-sm font-medium overflow-x-auto pb-2 scrollbar-hide">
          <div className={`flex items-center whitespace-nowrap ${step >= 1 ? 'text-white' : 'text-blue-300'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 1 ? 'border-white bg-white text-primary' : 'border-blue-300'}`}>1</span>
            Professional
          </div>
          <div className={`flex-1 border-t-2 mx-2 sm:mx-4 ${step >= 2 ? 'border-white' : 'border-blue-300/50'} min-w-[20px]`}></div>
          <div className={`flex items-center whitespace-nowrap ${step >= 2 ? 'text-white' : 'text-blue-300'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 2 ? 'border-white bg-white text-primary' : 'border-blue-300'}`}>2</span>
            Address
          </div>
          <div className={`flex-1 border-t-2 mx-2 sm:mx-4 ${step >= 3 ? 'border-white' : 'border-blue-300/50'} min-w-[20px]`}></div>
          <div className={`flex items-center whitespace-nowrap ${step >= 3 ? 'text-white' : 'text-blue-300'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 3 ? 'border-white bg-white text-primary' : 'border-blue-300'}`}>3</span>
            Time
          </div>
          <div className={`flex-1 border-t-2 mx-2 sm:mx-4 ${step >= 4 ? 'border-white' : 'border-blue-300/50'} min-w-[20px]`}></div>
          <div className={`flex items-center whitespace-nowrap ${step >= 4 ? 'text-white' : 'text-blue-300'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 4 ? 'border-white bg-white text-primary' : 'border-blue-300'}`}>4</span>
            Payment
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Professional</h2>
            {workers.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500">No professionals currently available for this category.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary font-medium hover:underline">Go Back</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workers.map(worker => (
                  <div 
                    key={worker._id} 
                    onClick={() => setFormData({ ...formData, workerId: worker._id })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${formData.workerId === worker._id ? 'border-primary bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <img src={worker.avatar || `https://ui-avatars.com/api/?name=${worker.name}`} alt={worker.name} className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                    <div>
                      <p className="text-sm font-bold text-accent">{worker.serviceType}</p>
                      <p className="font-bold text-gray-900">{worker.name}</p>
                      <p className="text-xs text-yellow-500 font-bold mt-1">★ {worker.rating.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {workers.length > 0 && (
              <button 
                onClick={() => {
                  if(!formData.workerId) return toast.error("Please select a professional");
                  setStep(2);
                }}
                className="w-full mt-8 bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Where do you need the service?</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-primary focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
              <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-primary focus:border-primary" />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors">Back</button>
              <button 
                onClick={() => {
                  if(!formData.street || !formData.city || !formData.pincode) return toast.error("Please fill required fields");
                  setStep(3);
                }}
                className="w-2/3 bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Continue to Schedule
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900">When do you need it?</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input 
                type="date" 
                name="date" 
                min={new Date().toISOString().split('T')[0]}
                value={formData.date} 
                onChange={handleChange} 
                className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-gray-200 focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setFormData({ ...formData, timeSlot: slot })}
                    className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all ${formData.timeSlot === slot ? 'border-primary bg-blue-50 text-primary ring-2 ring-primary ring-offset-1' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(2)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors">Back</button>
              <button 
                onClick={() => {
                  if(!formData.date || !formData.timeSlot) return toast.error("Please select date and time");
                  setStep(4);
                }}
                className="w-2/3 bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-semibold">₹{service.price}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-primary mt-2 pt-2 border-t border-blue-200">
                <span>Total Amount</span>
                <span>₹{service.price}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentType === 'before' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="paymentType" 
                  value="before" 
                  checked={formData.paymentType === 'before'} 
                  onChange={handleChange}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <span className="ml-3 font-medium text-gray-900">Pay Now (Online)</span>
              </label>
              
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentType === 'after' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="paymentType" 
                  value="after" 
                  checked={formData.paymentType === 'after'} 
                  onChange={handleChange}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <span className="ml-3 font-medium text-gray-900">Pay After Service (Online)</span>
              </label>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(3)} disabled={processing} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50">Back</button>
              <button 
                onClick={handleBooking}
                disabled={processing}
                className="w-2/3 bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {processing ? 'Processing...' : (formData.paymentType === 'before' ? 'Pay & Book' : 'Confirm Booking')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookService;
