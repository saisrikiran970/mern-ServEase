import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user's role doesn't match
  if (role && user.role !== role) {
    // If they have 'user' role but no specific set role, and need one
    if (user.role === 'user' && !role) {
       // just pass through
    } else {
      return <Navigate to="/select-role" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
