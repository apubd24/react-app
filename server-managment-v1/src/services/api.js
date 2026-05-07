// import axios from 'axios';
// import { logger } from '../lib/logger';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.17.18.186:8090';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor for attaching JWT token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     logger.debug(`${config.method?.toUpperCase()} Request to ${config.url}`, { data: config.data });
//     return config;
//   },
//   (error) => {
//     logger.error('Request Error', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for global error handling
// api.interceptors.response.use(
//   (response) => {
//     logger.debug(`Response from ${response.config.url}`, { status: response.status, data: response.data });
//     return response;
//   },
//   (error) => {
//     logger.error(`API Error: ${error.response?.status} ${error.config?.url}`, {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });

//     if (error.response?.status === 401) {
//       // Unauthorized: Clear token and redirect to login
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;



import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.17.18.186:8090', // your Go backend
});

// ✅ Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or sessionStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Optional: auto logout if token invalid
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;