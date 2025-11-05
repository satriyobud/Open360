import axios from 'axios';

// Dynamic API URL detection for ngrok and Render compatibility
const getApiBaseUrl = () => {
  // Use explicit API URL if set (for separate frontend/backend deployments)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production, use relative path (works when frontend is served from backend)
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // Check if we're accessing through ngrok or render (same domain)
  if (window.location.hostname.includes('ngrok') || window.location.hostname.includes('onrender.com')) {
    // For ngrok/render, use relative path if served from same domain
    return '/api';
  }
  
  // Development fallback
  return 'http://localhost:5100/api';
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
