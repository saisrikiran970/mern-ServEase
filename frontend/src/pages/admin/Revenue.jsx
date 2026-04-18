import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Download } from 'lucide-react';

const Revenue = () => {
  const [data, setData] = useState({ summary: {}, payments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await api.get('/admin/revenue');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch revenue', error);
      }
      setLoading(false);
    };
    fetchRevenue();
  }, []);

  const handleExport = () => {
    if (data.payments.length === 0) return;
    
    const csvRows = [];
    // Headers
    csvRows.push(['Date', 'Payment ID', 'Booking ID', 'Amount (INR)', 'Commission (INR)', 'Worker Earned (INR)', 'Status'].join(','));
    
    // Rows
    data.payments.forEach(p => {
      const row = [
        new Date(p.createdAt).toLocaleDateString(),
        p._id,
        p.bookingId?._id || 'N/A',
        p.amount,
        p.adminCommission,
        p.workerEarnings,
        p.status
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'servease_revenue.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Revenue & Payouts</h1>
        <button 
          onClick={handleExport}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-3xl shadow-md">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Total Platform Volume</p>
          <p className="text-4xl font-heading font-bold">₹{data.summary.totalRevenue}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-3xl shadow-md">
          <p className="text-green-200 text-sm font-semibold uppercase tracking-wider mb-2">Total Commission Earned (10%)</p>
          <p className="text-4xl font-heading font-bold">₹{data.summary.totalCommission}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Worker Payouts (90%)</p>
          <p className="text-4xl font-heading font-bold text-gray-900">₹{data.summary.totalWorkerPayouts}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Gross Amount</th>
                <th className="px-6 py-4 font-semibold text-green-600">Commission</th>
                <th className="px-6 py-4 font-semibold text-red-500">Worker Payout</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.payments.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No transactions found.</td></tr>
              ) : (
                data.payments.map(payment => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{payment.bookingId?._id?.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">₹{payment.adminCommission}</td>
                    <td className="px-6 py-4 text-sm text-red-500">-₹{payment.workerEarnings}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                        {payment.status}
                      </span>
                    </td>
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

export default Revenue;
