import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Registration successful!');
      navigate('/select-role');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-accent mix-blend-multiply opacity-50"></div>
        <img src="https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=800&q=80" alt="Register visual" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-10 p-12 text-white max-w-lg">
          <h2 className="text-4xl font-heading font-bold mb-6">Join the ServEase Community</h2>
          <p className="text-lg text-amber-50">Get top-quality home services or start earning by offering your skills.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-neutral-light">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500">Sign up to get started</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 mt-4"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>


          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
