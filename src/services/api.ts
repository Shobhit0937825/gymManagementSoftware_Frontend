import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach active branchId & auth token
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('gym_auth_token');
    if (token) {
      try {
        token = JSON.parse(token);
      } catch {}
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    let activeBranchId = localStorage.getItem('gym_active_branch_id');
    if (activeBranchId) {
      try {
        activeBranchId = JSON.parse(activeBranchId);
      } catch {}
      if (activeBranchId) {
        config.headers['x-branch-id'] = activeBranchId;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.warn('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
