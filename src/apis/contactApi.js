import axiosClient from './axiosClient';

const contactApi = {
  sendContact: (data) => {
    return axiosClient.post('/v1/contacts', data);
  },

  // Admin Methods
  getContacts: (params) => {
    return axiosClient.get('/v1/contacts/admin', { params });
  }
};

export default contactApi;
