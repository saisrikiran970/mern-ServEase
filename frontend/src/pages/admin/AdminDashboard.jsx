import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Wrench, CheckCircle, DollarSign, Star } from 'lucide-react';
// Chart.js imports
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Dummy Chart Data
  const revenueData = {
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{ label: 'Revenue (₹)', data: [12000, 19000, 15000, 22000, 18000, 25000], borderColor: '#1E40AF', backgroundColor: '#1E40AF', tension: 0.4 }]
  };

  const statusData = {
    labels: ['Completed', 'Pending', 'Assigned', 'In-Progress', 'Cancelled'],
    datasets: [{ data: [60, 15, 10, 10, 5], backgroundColor: ['#10B981', '#F59E0B', '#6366F1', '#F97316', '#EF4444'] }]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-6">Analytics Overview</h1>
      
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'blue' },
          { label: 'Total Workers', value: stats?.totalWorkers, icon: Wrench, color: 'orange' },
          { label: 'Total Revenue', value: `₹${stats?.totalRevenue}`, icon: DollarSign, color: 'green' },
          { label: 'Completed Jobs', value: stats?.completedBookings, icon: CheckCircle, color: 'indigo' },
          { label: 'Active Services', value: stats?.activeServices, icon: Star, color: 'amber' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-${s.color}-100 text-${s.color}-600`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Revenue Trend (Last 6 Months)</h2>
          <div className="h-64">
            <Line data={revenueData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold mb-4">Bookings by Status</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut data={statusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
