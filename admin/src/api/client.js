// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('admin_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;
import axios from 'axios';

// Always use Render unless explicitly overridden by an environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://qinash-gebeya-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;