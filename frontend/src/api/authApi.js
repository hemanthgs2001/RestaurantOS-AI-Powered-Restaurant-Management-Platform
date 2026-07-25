import axios from './axios';

export const login = (email, password) => {
  return axios.post('/auth/login', { email, password });
};

export const register = (userData) => {
  return axios.post('/auth/register', userData);
};

export const getCurrentUser = () => {
  return axios.get('/auth/me');
};

export const logout = () => {
  return axios.post('/auth/logout');
};