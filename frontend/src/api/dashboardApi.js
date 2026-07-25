import axios from './axios';

export const getDashboardStats = () => {
  return axios.get('/dashboard/stats');
};

export const getSalesOverview = (period) => {
  return axios.get('/dashboard/sales', { params: { period } });
};

export const getMonthlyExpenses = (year) => {
  return axios.get('/dashboard/monthly-expenses', { params: { year } });
};