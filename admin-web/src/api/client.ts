import axios from 'axios';
import { useAuthStore } from '../hooks/useAuth';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000') + '/api',
});

api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().clear();
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
