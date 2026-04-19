import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DollarSign } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const Earnings = () => {
  const [earnings, setEarnings] = useState({ totalEarnings: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('/worker/earnings');
        setEarnings(res.data.data);
      } catch (error) {
        console.error('Failed to fetch earnings', error);
      }
      setLoading(false);
    };
    fetchEarnings();
  }, []);

  if (user?.isActive === false) return null;
  if (loading) return <div>Loading...</div>;

  const monthlyData = new Array(12).fill(0);
  earnings.history.forEach(item => {
    const month = new Date(item.date).getMonth();
    monthlyData[month] += item.netEarned;
  });

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Net Earnings (₹)',
        data: monthlyData,
        backgroundColor: 'rgba(30, 64, 175, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-primary text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <DollarSign className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <p className="text-blue-200 text-lg font-medium mb-2 uppercase tracking-wider">Total Earnings</p>
          <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-white">₹{earnings.totalEarnings}</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Earnings</h2>
        <div className="h-64 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Earnings History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold text-red-500">Commission (-10%)</th>
                <th className="px-6 py-4 font-semibold text-green-600">Net Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {earnings.history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No earnings history found.</td>
                </tr>
              ) : (
                earnings.history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{item.bookingId.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-semibold">₹{item.amount}</td>
                    <td className="px-6 py-4 text-sm text-red-500">-₹{item.commission}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">₹{item.netEarned}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
