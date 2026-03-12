import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ROOT } from '../utils/constants';
import authApi from './authApi';

const axiosClient = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Configure Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Modify config before request is sent
    // Example: Add Authorization Token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configure Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    // You can optionally show a default success toast here if the response includes a specific success message flag,
    // but usually success toasts are handled directly by the caller.
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authApi.refreshToken(); // backend issues new accessToken cookie

        return axiosClient(originalRequest); // retry original request
      } catch (err) {
        authApi.logout().finally(() => {
          window.location.href = '/login';
        });
        return Promise.reject(err);
      }
    }

    if (error.response?.status === 401) {
      // Skip auto-logout redirect if this was an explicit auth attempt that failed (like wrong password)
      const url = originalRequest.url || '';
      const isAuthRoute = 
        url.includes('/users/login') || 
        url.includes('/auth/change-password') || 
        url.includes('/auth/set-password');

      if (!isAuthRoute) {
        authApi.logout().finally(() => {
          window.location.href = '/login';
        });
        return Promise.reject(error);
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || 'An error occurred';

    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default axiosClient;
