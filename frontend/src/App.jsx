import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts & Shared
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelect from './pages/RoleSelect';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import BookService from './pages/user/BookService';
import MyBookings from './pages/user/MyBookings';
import Recommendations from './pages/user/Recommendations';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import MyJobs from './pages/worker/MyJobs';
import Earnings from './pages/worker/Earnings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBookings from './pages/admin/ManageBookings';
import Revenue from './pages/admin/Revenue';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Toaster position="top-center" />
          <Navbar />
          <div className="flex-1 flex flex-col md:flex-row bg-neutral-light">
            <Routes>
              {/* Sidebar layout logic: Render Sidebar only on Dashboard routes */}
              <Route path="/user/*" element={<Sidebar />} />
              <Route path="/worker/*" element={<Sidebar />} />
              <Route path="/admin/*" element={<Sidebar />} />
              <Route path="*" element={null} />
            </Routes>
            
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected - Role Setup */}
                <Route path="/select-role" element={
                  <ProtectedRoute>
                    <RoleSelect />
                  </ProtectedRoute>
                } />

                {/* User Routes */}
                <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
                <Route path="/user/book/:serviceId" element={<ProtectedRoute role="user"><BookService /></ProtectedRoute>} />
                <Route path="/user/bookings" element={<ProtectedRoute role="user"><MyBookings /></ProtectedRoute>} />
                <Route path="/user/recommendations" element={<ProtectedRoute role="user"><Recommendations /></ProtectedRoute>} />

                {/* Worker Routes */}
                <Route path="/worker/dashboard" element={<ProtectedRoute role="worker"><WorkerDashboard /></ProtectedRoute>} />
                <Route path="/worker/jobs" element={<ProtectedRoute role="worker"><MyJobs /></ProtectedRoute>} />
                <Route path="/worker/earnings" element={<ProtectedRoute role="worker"><Earnings /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute role="admin"><ManageServices /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><ManageBookings /></ProtectedRoute>} />
                <Route path="/admin/revenue" element={<ProtectedRoute role="admin"><Revenue /></ProtectedRoute>} />

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
