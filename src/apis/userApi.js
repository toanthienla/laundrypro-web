import axiosClient from './axiosClient';

const userApi = {
  // Customers Management
  getAllCustomers: (params) => {
    return axiosClient.get('/v1/users/customers', { params });
  },
  getCustomerById: (id) => {
    return axiosClient.get(`/v1/users/customers/${id}`);
  },
  getCustomerWithHistory: (id) => {
    return axiosClient.get(`/v1/users/customers/${id}/history`);
  },

  createCustomer: (data) => {
    return axiosClient.post('/v1/users/customers', data);
  },
  updateCustomer: (id, data) => {
    return axiosClient.put(`/v1/users/customers/${id}`, data);
  },

  // Users & Staff Management (Admin)
  getAllUsers: (params) => {
    return axiosClient.get('/v1/users/users', { params });
  },
  getUserById: (id) => {
    return axiosClient.get(`/v1/users/users/${id}`);
  },
  createStaff: (data) => {
    return axiosClient.post('/v1/users/users/staff', data);
  },
  updateStaff: (id, data) => {
    return axiosClient.put(`/v1/users/users/${id}`, data);
  },
  updateUserRole: (id, role) => {
    return axiosClient.patch(`/v1/users/users/${id}/role`, { role });
  },
  updateUserStatus: (id, status) => {
    return axiosClient.patch(`/v1/users/users/${id}/status`, { status });
  },
  deleteUser: (id) => {
    return axiosClient.delete(`/v1/users/users/${id}`);
  },

  // Stats
  getUserStats: () => {
    return axiosClient.get('/v1/users/stats');
  }
};

export default userApi;
