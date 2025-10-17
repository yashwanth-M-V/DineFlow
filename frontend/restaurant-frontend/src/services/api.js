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

// Dishes API
export const dishesAPI = {
  getAll: () => api.get('/dishes'),
  getById: (id) => api.get(`/dishes/${id}`),
};

// Employees API
export const employeesAPI = {
  getAll: () => api.get('/employees'),
};

// Raw Materials API
export const rawMaterialsAPI = {
  getAll: () => api.get('/raw-materials'),
};

// Analytics API
export const analyticsAPI = {
  getSales: (period = 'daily') => api.get(`/analytics/sales?period=${period}`),
  getProfitMargin: () => api.get('/analytics/profit-margin'),
  getTopDishes: (limit = 10) => api.get(`/analytics/top-dishes?limit=${limit}`),
  getInventoryStatus: () => api.get('/analytics/inventory-status'),
  getOrderSummary: () => api.get('/analytics/order-summary'),
  getEmployeePerformance: () => api.get('/analytics/employee-performance'),
  getPaymentAnalytics: () => axios.get(`${API_BASE_URL}/api/analytics/payments`),
};

export default api;