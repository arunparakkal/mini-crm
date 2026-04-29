import axios from 'axios';

// const BASE_URL = process.env.NODE_ENV === 'production'
//   ? 'https://mini-crm-backend-ij6l.onrender.com/api'
//   : '/api';

const api = axios.create({ 
  baseURL: 'https://mini-crm-backend-ij6l.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;