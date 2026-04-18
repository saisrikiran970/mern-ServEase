import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          console.error('Failed to load user', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await api.post('/auth/google', { idToken });
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return res.data;
    } catch (error) {
      console.error('Google login error', error);
      throw error;
    }
  };

  const setRole = async (role, serviceType, avatar) => {
    const res = await api.put('/auth/set-role', { role, serviceType, avatar });
    setUser(res.data.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, setRole, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
