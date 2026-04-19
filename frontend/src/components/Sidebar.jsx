import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Home, Briefcase, DollarSign, Star, 
  Users, Calendar, Settings, PieChart, CheckSquare
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'worker') {
      const fetchCount = async () => {
        try {
          const res = await api.get('/worker/jobs/pending');
          setPendingCount(res.data.data.length);
        } catch (error) {
          console.error(error);
        }
      };
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      
      const handleRefresh = () => fetchCount();
      window.addEventListener('refreshWorkerJobs', handleRefresh);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('refreshWorkerJobs', handleRefresh);
      };
    }
  }, [user]);

  if (!user) return null;

  const links = {
    user: [
      { to: '/user/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/user/bookings', icon: Calendar, label: 'My Bookings' },
      { to: '/user/recommendations', icon: Star, label: 'Recommendations' },
    ],
    worker: [
      { to: '/worker/dashboard', icon: PieChart, label: 'Overview' },
      { to: '/worker/jobs', icon: Briefcase, label: 'My Jobs', badge: pendingCount > 0 ? pendingCount : null },
      { to: '/worker/earnings', icon: DollarSign, label: 'Earnings' },
    ],
    admin: [
      { to: '/admin/dashboard', icon: PieChart, label: 'Analytics' },
      { to: '/admin/services', icon: CheckSquare, label: 'Services' },
      { to: '/admin/users', icon: Users, label: 'Users & Workers' },
      { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
      { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
    ]
  };

  const currentLinks = links[user.role] || [];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6 p-2 bg-blue-50 rounded-xl">
          <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} alt="Avatar" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-[10px] font-bold text-accent uppercase">{user.role === 'worker' && user.serviceType ? user.serviceType : user.role}</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {currentLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center">
                <link.icon className="mr-3 h-5 w-5" />
                {link.label}
              </div>
              {link.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
