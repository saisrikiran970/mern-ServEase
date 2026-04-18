import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Settings, Calendar } from 'lucide-react';
import Recommendations from './Recommendations';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-500">Find the best professionals for your home needs today.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/services" className="bg-primary hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Book a Service
          </Link>
          <Link to="/user/bookings" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2">
            <Calendar className="w-5 h-5" /> My Bookings
          </Link>
        </div>
      </div>

      <Recommendations />
    </div>
  );
};

export default UserDashboard;
