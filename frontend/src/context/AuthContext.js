import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../api/authApi';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Pulls a role out of a user object no matter how the backend shaped it.
// Handles: role: "owner", role: { name: "owner" }, userRole: "owner",
// role_name: "owner", roles: ["owner"]
const extractRole = (userData) => {
  if (!userData) return undefined;

  if (typeof userData.role === 'string' && userData.role.trim()) {
    return userData.role;
  }
  if (userData.role && typeof userData.role === 'object' && userData.role.name) {
    return userData.role.name;
  }
  if (typeof userData.userRole === 'string' && userData.userRole.trim()) {
    return userData.userRole;
  }
  if (typeof userData.role_name === 'string' && userData.role_name.trim()) {
    return userData.role_name;
  }
  if (Array.isArray(userData.roles) && userData.roles.length > 0) {
    return typeof userData.roles[0] === 'string' ? userData.roles[0] : userData.roles[0]?.name;
  }

  return undefined;
};

const buildUser = (userData) => ({
  id: userData.id || userData._id,
  name: userData.name,
  email: userData.email,
  role: extractRole(userData),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await getCurrentUser();

      // TEMP DEBUG - remove once role issue is confirmed fixed
      console.log('[AuthContext] /me raw response:', JSON.stringify(response.data, null, 2));

      // Normalize various backend response shapes:
      // - { data: { user: { ... } } }
      // - { data: { ...user... } }
      // - { user: { ... } }
      // - the user object directly
      const userData = response.data?.data?.user || response.data?.data || response.data?.user || response.data;
      const builtUser = buildUser(userData);

      console.log('[AuthContext] resolved user:', builtUser);

      setUser(builtUser);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);

      // TEMP DEBUG - remove once role issue is confirmed fixed
      console.log('[AuthContext] login raw response:', JSON.stringify(response.data, null, 2));

      const { token, data } = response.data;

      // Store token
      localStorage.setItem('token', token);
      setToken(token);

      // Handle either data.user or data being the user object directly
      const userData = data?.user || data;
      const builtUser = buildUser(userData);

      console.log('[AuthContext] resolved user:', builtUser);

      if (!builtUser.role) {
        console.warn('[AuthContext] No role found on user object. Check the raw response above to find where role actually lives.');
      }

      setUser(builtUser);

      toast.success(`Welcome ${builtUser.name}!`);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles?.includes(user?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};