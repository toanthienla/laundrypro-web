import axiosClient from './axiosClient';

const authApi = {
  checkLoginMethod: (phone) => {
    return axiosClient.post('/v1/users/check-login', { phone });
  },
  loginWithPassword: (phone, password) => {
    return axiosClient.post('/v1/users/login/password', { phone, password });
  },
  loginWithOtp: (idToken) => {
    return axiosClient.post('/v1/users/login/otp', { idToken });
  },
  resetPassword: (idToken, newPassword) => {
    return axiosClient.post('/v1/users/reset-password-otp', { idToken, newPassword });
  },
  setPassword: (password, confirmPassword) => {
    return axiosClient.post('/v1/users/password', { password, confirmPassword });
  },
  refreshToken: () => {
    return axiosClient.post('/v1/users/refresh-token');
  },
  getProfile: () => {
    return axiosClient.get('/v1/users/profile');
  },
  logout: () => {
    return axiosClient.post('/v1/users/logout');
  }
};

export default authApi;