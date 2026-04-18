import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const RoleSelect = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [serviceType, setServiceType] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const categories = ['Salon', 'Cleaning', 'Repair', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'AC Service', 'Other'];

  const handleSubmit = async () => {
    if (!selectedRole) return toast.error("Please select a role");
    if (selectedRole === 'worker' && !serviceType) return toast.error("Please select your service expertise");

    setLoading(true);
    try {
      const res = await setRole(selectedRole, serviceType, avatar);
      toast.success('Role updated successfully!');
      
      if (res.data.role === 'worker') navigate('/worker/dashboard');
      else navigate('/user/dashboard');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-light p-4">
      <div className="max-w-3xl w-full text-center mb-10">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">How do you want to use ServEase?</h1>
        <p className="text-xl text-gray-500">Choose your journey with us</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center mb-10">
        {/* User Card */}
        <div 
          onClick={() => setSelectedRole('user')}
          className={`flex-1 bg-white rounded-3xl p-10 border-2 cursor-pointer transition-all ${selectedRole === 'user' ? 'border-primary shadow-xl scale-105' : 'border-transparent shadow-sm hover:shadow-md'}`}
        >
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${selectedRole === 'user' ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center">I need services</h2>
          <p className="text-gray-500 text-center">Find and book trusted professionals for your home needs.</p>
        </div>

        {/* Worker Card */}
        <div 
          onClick={() => setSelectedRole('worker')}
          className={`flex-1 bg-white rounded-3xl p-10 border-2 cursor-pointer transition-all flex flex-col ${selectedRole === 'worker' ? 'border-accent shadow-xl scale-105' : 'border-transparent shadow-sm hover:shadow-md'}`}
        >
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${selectedRole === 'worker' ? 'bg-yellow-100 text-accent' : 'bg-gray-100 text-gray-500'}`}>
            <Wrench className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center">I provide services</h2>
          <p className="text-gray-500 text-center mb-6">Offer your professional skills and start earning with us.</p>
          
          {selectedRole === 'worker' && (
            <div className="mt-auto animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">My primary expertise is:</label>
              <select 
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white mb-4"
              >
                <option value="" disabled>Select category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo URL (Optional):</label>
              <input 
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white"
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedRole || loading}
        className="bg-primary hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-colors shadow-lg"
      >
        {loading ? 'Setting up...' : 'Continue'}
      </button>
    </div>
  );
};

export default RoleSelect;
