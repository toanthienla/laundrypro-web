import axiosClient from './axiosClient';

const serviceApi = {
  getServices: (params) => {
    return axiosClient.get('/v1/services', { params });
  },
  getCategories: () => {
    return axiosClient.get('/v1/services/categories');
  },
  getServiceById: (id) => {
    return axiosClient.get(`/v1/services/${id}`);
  },

  // Admin Methods
  createService: (data) => {
    // data is FormData because of 'image'
    return axiosClient.post('/v1/services', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateService: (id, data) => {
    // data is FormData
    return axiosClient.put(`/v1/services/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteService: (id) => {
    return axiosClient.delete(`/v1/services/${id}`);
  }
};

export default serviceApi;
