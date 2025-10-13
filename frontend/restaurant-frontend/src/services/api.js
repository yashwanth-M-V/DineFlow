import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});


// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (status = 'open') => api.get(`/orders?status=${status}`),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  addItem: (orderId, itemData) => api.post(`/orders/${orderId}/items`, itemData),
  updateStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
};

// Enhanced Dishes API  
export const dishesAPI = {
  getAll: () => api.get('/dishes'),
  getById: (id) => api.get(`/dishes/${id}`),
};

// Enhanced Employees API
export const employeesAPI = {
  getAll: () => api.get('/employees'),
};

// Add error interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;