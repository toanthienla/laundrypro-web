import axiosClient from './axiosClient';

const paymentApi = {
  // Public / Customer
  getMyPayments: (params) => {
    return axiosClient.get('/v1/payments/my-payments', { params });
  },

  // Admin / Staff
  getAllPayments: (params) => {
    return axiosClient.get('/v1/payments', { params });
  },
  getPaymentById: (id) => {
    return axiosClient.get(`/v1/payments/${id}`);
  },
  getPaymentByOrderId: (orderId) => {
    return axiosClient.get(`/v1/payments/by-order/${orderId}`);
  },
  createPayment: (data) => {
    // { orderId, method, amount, transactionRef, markAsPaid }
    return axiosClient.post('/v1/payments', data);
  },
  updatePaymentStatus: (id, data) => {
    // { status, transactionRef }
    return axiosClient.patch(`/v1/payments/${id}/status`, data);
  },
  updatePaymentMethod: (id, method) => {
    return axiosClient.patch(`/v1/payments/${id}/method`, { method });
  },
  deletePayment: (id) => {
    return axiosClient.delete(`/v1/payments/${id}`);
  }
};

export default paymentApi;
