import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'workers'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Salon', 'Cleaning', 'Repair', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'AC Service', 'Other'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/admin/users' : '/admin/workers';
      const res = await api.get(endpoint);
      setData(res.data.data);
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const toggleStatus = async (id) => {
    try {
      await api.put(`/admin/users/${id}/suspend`);
      toast.success('User status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Manage {activeTab === 'users' ? 'Users' : 'Workers'}</h1>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <button onClick={() => { setActiveTab('users'); setSelectedCategory('All'); }} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Users</button>
          <button onClick={() => setActiveTab('workers')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'workers' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Workers</button>
        </div>
      </div>

      {activeTab === 'workers' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-accent text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                {activeTab === 'workers' && <th className="px-6 py-4 font-semibold">Expertise & Rating</th>}
                {activeTab === 'users' && <th className="px-6 py-4 font-semibold">Joined</th>}
                {activeTab === 'workers' && <th className="px-6 py-4 font-semibold">Earnings</th>}
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center">Loading...</td></tr>
              ) : (
                (() => {
                  const filteredData = activeTab === 'workers' && selectedCategory !== 'All' 
                    ? data.filter(u => u.serviceType === selectedCategory) 
                    : data;

                  if (filteredData.length === 0) {
                    return <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No records found.</td></tr>;
                  }

                  return filteredData.map(user => (
                  <tr key={user._id} className={`hover:bg-gray-50 ${user.rating < 2.5 && activeTab === 'workers' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 font-semibold flex items-center gap-3">
                      <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} alt="" className="w-8 h-8 rounded-full" />
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    
                    {activeTab === 'workers' && (
                      <td className="px-6 py-4 text-sm">
                        <p className="font-semibold">{user.serviceType}</p>
                        <p className={`text-xs ${user.rating < 2.5 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          {user.rating.toFixed(1)} ★ ({user.completedJobs} jobs)
                        </p>
                      </td>
                    )}
                    
                    {activeTab === 'users' && (
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    )}
                    
                    {activeTab === 'workers' && (
                      <td className="px-6 py-4 text-sm font-semibold">₹{user.totalEarnings || 0}</td>
                    )}
                    
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleStatus(user._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        {user.isActive ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ));
              })()
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
