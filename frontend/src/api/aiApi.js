import axios from './axios';

// Use the same backend URL - No separate AI server needed!
// All AI features are now served from the main backend
const AI_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for AI API (using same backend)
const aiAxios = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add request interceptor
aiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Invoice Processing
export const processInvoice = (formData) => {
  return aiAxios.post('/ai/invoices/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getInvoices = () => {
  return aiAxios.get('/ai/invoices');
};

export const generateExpenseRegister = (invoices) => {
  return aiAxios.post('/ai/invoices/export', { invoices }, {
    responseType: 'blob',
  });
};

// Predictions
export const getPredictions = () => {
  return aiAxios.get('/ai/predictions');
};

export const getStockPredictions = () => {
  return aiAxios.get('/ai/predictions/stock');
};

// Recommendations
export const getRecommendations = () => {
  return aiAxios.get('/ai/recommendations');
};

export const getMenuPricingRecommendations = () => {
  return aiAxios.get('/ai/recommendations/menu-pricing');
};

export const getWasteAnalysis = () => {
  return aiAxios.get('/ai/analysis/waste');
};

export default aiAxios;