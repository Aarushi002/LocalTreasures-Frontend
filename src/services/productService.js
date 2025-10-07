import api from './api';

const productService = {
  // Map frontend sort values to backend sort values
  mapSortValue: (frontendSort) => {
    const sortMapping = {
      'newest': '-createdAt',
      'price_low': 'price',
      'price_high': '-price',
      'distance': 'distance', // This will be handled by geospatial query
      'rating': '-ratings.average',
      'popular': '-views'
    };
    return sortMapping[frontendSort] || '-createdAt';
  },

  // Get products with filters
  getProducts: async (params = {}) => {
    // Map sort value if present
    if (params.sort) {
      params.sort = productService.mapSortValue(params.sort);
    }
    
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response;
  },

  // Get single product
  getProduct: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response;
  },

  // Create product (seller only)
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response;
  },

  // Update product (owner only)
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response;
  },

  // Delete product (owner only)
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 10) => {
    const response = await api.get(`/products/featured?limit=${limit}`);
    return response;
  },

  // Get seller products
  getSellerProducts: async (sellerId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products/seller/${sellerId}?${queryString}`);
    return response;
  },

  // Toggle product like
  toggleLike: async (productId) => {
    const response = await api.post(`/products/${productId}/like`);
    return response;
  },

  // Add review
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response;
  },

  // Check if user can review
  canReview: async (productId) => {
    const response = await api.get(`/products/${productId}/can-review`);
    return response;
  },

  // Toggle featured status
  toggleFeatured: async (productId) => {
    const response = await api.put(`/products/${productId}/featured`);
    return response;
  },

  // Search products by location
  searchNearby: async (location, radius = 10000, filters = {}) => {
    const params = {
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
      ...filters,
    };
    return await productService.getProducts(params);
  },
};

export default productService;
