import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, mode: 'add', data: null });

  const categories = ['Salon', 'Cleaning', 'Repair', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'AC Service', 'Other'];

  const fetchData = async () => {
    try {
      const [servicesRes, workersRes] = await Promise.all([
        api.get('/services'),
        api.get('/admin/workers')
      ]);
      setServices(servicesRes.data.data);
      setWorkers(workersRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this service?')) {
      try {
        await api.delete(`/services/${id}`);
        toast.success('Service deactivated');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      if (modal.mode === 'add') {
        await api.post('/services', data);
        toast.success('Service added');
      } else {
        await api.put(`/services/${modal.data._id}`, data);
        toast.success('Service updated');
      }
      setModal({ show: false, mode: 'add', data: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Manage Services</h1>
        <button 
          onClick={() => setModal({ show: true, mode: 'add', data: null })}
          className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => {
            const categoryServices = services.filter(s => s.category === category);
            const categoryWorkers = workers.filter(w => w.serviceType === category);

            if (categoryServices.length === 0 && categoryWorkers.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b">{category}</h2>
                
                {/* Services Table */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Service Packages</h3>
                  {categoryServices.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Service</th>
                            <th className="px-4 py-3 font-semibold">Price</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {categoryServices.map(service => (
                            <tr key={service._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <img src={service.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                  <div>
                                    <p className="font-semibold text-gray-900">{service.title}</p>
                                    <p className="text-xs text-gray-500">{service.rating.toFixed(1)} ★ ({service.bookingCount} bookings)</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold">₹{service.price}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setModal({ show: true, mode: 'edit', data: service })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(service._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No packages in this category.</p>
                  )}
                </div>

                {/* Workers Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Registered Professionals</h3>
                  {categoryWorkers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categoryWorkers.map(worker => (
                        <div key={worker._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                          <img src={worker.avatar || `https://ui-avatars.com/api/?name=${worker.name}`} alt={worker.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                          <div>
                            <p className="text-xs font-bold text-accent">{worker.serviceType}</p>
                            <p className="font-semibold text-sm text-gray-900">{worker.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">★ {worker.rating.toFixed(1)} ({worker.completedJobs} jobs)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No professionals registered in this category.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">{modal.mode === 'add' ? 'Add New Service' : 'Edit Service'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" defaultValue={modal.data?.title} required className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" defaultValue={modal.data?.category} required className="w-full px-4 py-2 border rounded-xl bg-white">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input name="price" type="number" defaultValue={modal.data?.price} required className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input name="image" defaultValue={modal.data?.image} required className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" defaultValue={modal.data?.description} required rows="3" className="w-full px-4 py-2 border rounded-xl"></textarea>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setModal({ show: false, mode: 'add', data: null })} className="w-1/2 py-2 bg-gray-100 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="w-1/2 py-2 bg-primary text-white rounded-xl font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
