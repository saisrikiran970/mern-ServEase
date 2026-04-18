import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success('Logged in successfully!');
      
      if (res.data.role === 'admin') navigate('/admin/dashboard');
      else if (res.data.role === 'worker') navigate('/worker/dashboard');
      else navigate(from === '/login' ? '/user/dashboard' : from);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await googleLogin();
      toast.success('Logged in with Google!');
      
      if (res.data.isNewUser) {
         // Ask for role if new
         navigate('/select-role');
      } else {
        if (res.data.role === 'admin') navigate('/admin/dashboard');
        else if (res.data.role === 'worker') navigate('/worker/dashboard');
        else navigate(from === '/login' ? '/user/dashboard' : from);
      }
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-primary mix-blend-multiply opacity-50"></div>
        <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" alt="Login visual" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-10 p-12 text-white max-w-lg">
          <h2 className="text-4xl font-heading font-bold mb-6">Welcome back to ServEase</h2>
          <p className="text-lg text-blue-100">Log in to track your bookings, discover new services, or manage your jobs.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-neutral-light">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-500">Please enter your details to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
