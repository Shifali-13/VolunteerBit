import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const errMsg = (e) => e.response?.data?.message || 'Something went wrong';
export const fmtDate = (d) =>
  new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default api;
