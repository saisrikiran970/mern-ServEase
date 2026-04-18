import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, CheckCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [topServices, setTopServices] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        const sorted = res.data.data.sort((a, b) => b.rating - a.rating).slice(0, 4);
        setTopServices(sorted);
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  const categories = [
    { name: 'Cleaning', icon: '🧹' },
    { name: 'AC Service', icon: '❄️' },
    { name: 'Plumbing', icon: '🚰' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Salon', icon: '✂️' },
    { name: 'Painting', icon: '🎨' },
    { name: 'Carpentry', icon: '🪚' },
    { name: 'Repair', icon: '🔧' },
  ];

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-primary to-amber-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight mb-6 leading-tight">
              Professional Home Services at Your Doorstep
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              Book expert, verified professionals for all your home needs. Quick, reliable, and hassle-free.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/services" className="bg-accent hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg">
                Browse Services
              </Link>
              <Link to="/register" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                Join as Worker
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 py-6 shadow-sm relative z-10 -mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div>
              <p className="text-3xl font-bold text-primary mb-1">500+</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Verified Workers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-1">10k+</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Bookings Done</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-1 flex items-center justify-center gap-1">4.8<Star className="h-6 w-6 text-accent fill-current"/></p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-1">50+</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cities Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">What do you need help with?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Choose from our wide range of services and get professional help in just a few clicks.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <Link key={idx} to={`/services?cat=${cat.name}`} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center group transition-all">
              <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
              <span className="font-semibold text-gray-800">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">How ServEase Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Getting your home tasks done has never been this easy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 border-t-2 border-dashed border-blue-200"></div>
            
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-md border-4 border-blue-100 mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Book Service</h3>
              <p className="text-gray-500 px-4">Choose your required service, pick a date and time slot that suits you.</p>
            </div>
            
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-md border-4 border-blue-100 mb-6">
                <UserCheck className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Pro Assigned</h3>
              <p className="text-gray-500 px-4">We'll match you with a top-rated, background-verified professional.</p>
            </div>
            
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-md border-4 border-blue-100 mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Job Done!</h3>
              <p className="text-gray-500 px-4">The pro arrives on time and completes the job to your satisfaction.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Rated Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Top Rated Services</h2>
            <p className="text-gray-500">Highly recommended by our users</p>
          </div>
          <Link to="/services" className="text-primary font-semibold hover:underline hidden sm:block">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topServices.map(service => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
