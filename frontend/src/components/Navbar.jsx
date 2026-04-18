import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'worker') return '/worker/dashboard';
    return '/user/dashboard';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-default">
              <span className="font-heading font-bold text-2xl text-primary">ServEase</span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to={user ? getDashboardLink() : '/'} className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/services" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Services</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={getDashboardLink()} className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
                  <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} alt={user.name} className="h-8 w-8 rounded-full" />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-primary font-medium hover:text-blue-800 px-3 py-2">Login</Link>
                <Link to="/register" className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-medium transition-colors">Sign Up</Link>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-900 p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to={user ? getDashboardLink() : '/'} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Home</Link>
            <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Services</Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</Link>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-blue-800 hover:bg-blue-50">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
