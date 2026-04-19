import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Base server URL (without /api) — used to build image src URLs for uploaded files
export const SERVER_BASE = API_URL.replace(/\/api\/?$/, '');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookie automatically with every request
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Signal AuthContext to clear user state and let React Router handle the
      // redirect — avoids a full page reload from window.location.href
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  firebaseLogin: (payload) => api.post('/auth/firebase-login', payload),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// User API calls
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
};

// Food / Menu API calls
export const foodAPI = {
  // Public
  getAllMenuItems: (params) => api.get('/food/menu', { params }),

  // Vendor – menu management
  getVendorMenu: () => api.get('/food/vendor/menu'),
  createMenuItem: (data) => api.post('/food/menu', data,
    data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {}
  ),
  updateMenuItem: (id, data) => api.put(`/food/menu/${id}`, data,
    data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {}
  ),
  deleteMenuItem: (id) => api.delete(`/food/menu/${id}`),

  // Vendor – sales
  getVendorOrders: (params) => api.get('/food/vendor/orders', { params }),
  getVendorSalesStats: () => api.get('/food/vendor/sales-stats'),

  // Kitchen – order management
  getKitchenOrders: (params) => api.get('/food/kitchen/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/food/kitchen/orders/${id}/status`, { status }),

  // User – place & view orders
  createOrder: (data) => api.post('/food/orders', data),
  getUserOrders: () => api.get('/food/orders'),
  cancelOrder: (id) => api.put(`/food/orders/${id}/cancel`),
  postDeliveryChat: (id, payload) => api.post(`/food/orders/${id}/chat`, payload),
  rateOrder: (id, data) => api.post(`/food/orders/${id}/rate`, data),

  // Delivery partner – manage assigned orders
  getDeliveryOrders: (params) => api.get('/food/delivery/orders', { params }),
  acceptDeliveryOrder: (id, payload) => api.put(`/food/delivery/orders/${id}/accept`, payload),
  updateDeliveryLocation: (id, payload) => api.put(`/food/delivery/orders/${id}/location`, payload),
  completeDelivery: (id) => api.put(`/food/delivery/orders/${id}/complete`),
};

// Payments API calls
export const paymentAPI = {
  createOrder: (amount) => api.post('/create-order', { amount }),
};

export default api;
