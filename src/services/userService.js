import api from './api';

const userService = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response;
  },

  // Get nearby users/sellers
  getNearbyUsers: async (params = {}) => {
    const response = await api.get('/users/nearby', { params });
    return response;
  },

  // Update avatar
  updateAvatar: async (avatar) => {
    const response = await api.put('/users/avatar', { avatar });
    return response;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/users/dashboard');
    return response;
  },

  // Search users
  searchUsers: async (query, params = {}) => {
    const response = await api.get('/users/search', {
      params: { query, ...params }
    });
    return response;
  },

  // Follow/unfollow user
  toggleFollow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response;
  },

  // Report user
  reportUser: async (userId, reason, description = '') => {
    const response = await api.post(`/users/${userId}/report`, {
      reason,
      description
    });
    return response;
  },

  // Get favorite products
  getFavorites: async (params = {}) => {
    const response = await api.get('/users/favorites', { params });
    return response;
  },

  // Verify business (admin only)
  verifyBusiness: async (userId) => {
    const response = await api.post('/users/verify-business', { userId });
    return response;
  },
};

export default userService;
