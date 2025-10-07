import api from './api';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response;
  },

  // Get user orders
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response;
  },

  // Get single order
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  },

  // Update order status (seller only)
  updateOrderStatus: async (orderId, status, note = '') => {
    const response = await api.put(`/orders/${orderId}/status`, { status, note });
    return response;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response;
  },

  // Add message to order
  addOrderMessage: async (orderId, message) => {
    const response = await api.post(`/orders/${orderId}/messages`, { message });
    return response;
  },

  // Add rating to order
  addOrderRating: async (orderId, rating, review = '') => {
    const response = await api.post(`/orders/${orderId}/rating`, { rating, review });
    return response;
  },

  // Get order statistics (seller only)
  getOrderStats: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/orders/stats', { params });
    return response;
  },

  // Get order history
  getOrderHistory: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response;
  },

  // Track order
  trackOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  },
};

export default orderService;
