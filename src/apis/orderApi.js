import axiosClient from './axiosClient';

const orderApi = {
  // Public / Customer
  getMyOrders: (params) => {
    return axiosClient.get('/v1/orders/my-orders', { params });
  },
  getMyOrderById: (id) => {
    return axiosClient.get(`/v1/orders/my-orders/${id}`);
  },

  // Admin / Staff
  getAllOrders: (params) => {
    return axiosClient.get('/v1/orders', { params });
  },
  getOrderById: (id) => {
    return axiosClient.get(`/v1/orders/${id}`);
  },
  getOrderStats: (params) => {
    return axiosClient.get('/v1/orders/stats', { params });
  },
  searchOrders: (params) => {
    // Requires phone
    return axiosClient.get('/v1/orders/search', { params });
  },
  createOrder: (data) => {
    // { customerPhone, customerName, items: [{ serviceId, quantity, unitPrice, note }], note, customerAddress }
    return axiosClient.post('/v1/orders', data);
  },
  updateOrder: (id, data) => {
    return axiosClient.put(`/v1/orders/${id}`, data);
  },
  updateOrderStatus: (id, status) => {
    return axiosClient.patch(`/v1/orders/${id}/status`, { status });
  },
  deleteOrder: (id) => {
    return axiosClient.delete(`/v1/orders/${id}`);
  },

  // Order Items
  addOrderItem: (orderId, data) => {
    return axiosClient.post(`/v1/orders/${orderId}/items`, data);
  },
  updateOrderItem: (orderId, itemId, data) => {
    return axiosClient.put(`/v1/orders/${orderId}/items/${itemId}`, data);
  },
  deleteOrderItem: (orderId, itemId) => {
    return axiosClient.delete(`/v1/orders/${orderId}/items/${itemId}`);
  }
};

export default orderApi;
