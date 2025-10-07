import api from './api';

const API_URL = '/wishlist'; // Remove the duplicate '/api' since it's already in the base URL

// Get user's wishlist
const getWishlist = async () => {
  const response = await api.get(API_URL);
  return response; // Don't access .data since api interceptor already returns response.data
};

// Add product to wishlist
const addToWishlist = async (productId) => {
  const response = await api.post(`${API_URL}/add`, { productId });
  return response; // Don't access .data since api interceptor already returns response.data
};

// Remove product from wishlist
const removeFromWishlist = async (productId) => {
  const response = await api.delete(`${API_URL}/remove/${productId}`);
  return response; // Don't access .data since api interceptor already returns response.data
};

// Clear entire wishlist
const clearWishlist = async () => {
  const response = await api.delete(API_URL);
  return response; // Don't access .data since api interceptor already returns response.data
};

// Check if product is in wishlist
const isInWishlist = async (productId) => {
  const response = await api.get(`${API_URL}/check/${productId}`);
  return response; // Don't access .data since api interceptor already returns response.data
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist,
};

export default wishlistService;
