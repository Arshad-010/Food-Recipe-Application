import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If token expired or unauthorized, clean local storage
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    let message = 'An unexpected error occurred';
    if (!error.response) {
      // Backend is unavailable or network error
      message = 'Unable to connect to the server. Please try again.';
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message && error.message !== 'Network Error') {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
