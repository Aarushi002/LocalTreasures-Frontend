import { createSlice } from '@reduxjs/toolkit';
import { validateCartItem } from '../../utils/cartUtils';

const initialState = {
  items: [],
  isLoading: false,
  isError: false,
  message: '',
  totalQuantity: 0,
  totalAmount: 0,
};

// Helper function to calculate cart totals
const calculateTotals = (items) => {
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  return { totalQuantity, totalAmount };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { product, quantity, userRole } = action.payload;
      
      // Prevent sellers from adding items to cart
      if (userRole === 'seller') {
        state.isError = true;
        state.message = 'Sellers cannot add items to cart. Cart is only available for buyers to purchase products.';
        return;
      }
      
      // Validate item before adding
      const validation = validateCartItem(product, quantity);
      if (!validation.isValid) {
        state.isError = true;
        state.message = validation.errors.join(', ');
        return;
      }
      
      const existingItem = state.items.find(item => item.productId === product._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + quantity;
        const newValidation = validateCartItem(product, newQuantity);
        
        if (newValidation.isValid) {
          existingItem.quantity = newQuantity;
        } else {
          existingItem.quantity = newValidation.maxQuantity;
          state.message = `Maximum quantity available: ${newValidation.maxQuantity}`;
        }
      } else {
        // Add new item
        state.items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: Math.min(quantity, product.availability?.quantity || 1),
          image: product.images?.[0]?.url || '',
          seller: {
            id: product.seller._id,
            name: product.seller?.businessInfo?.businessName || product.seller?.name,
          },
          availability: product.availability,
          category: product.category,
        });
      }
      
      // Clear any previous errors
      state.isError = false;
      state.message = '';
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    // Update item quantity
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.availability?.quantity || 1));
        
        // Recalculate totals
        const totals = calculateTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalAmount = totals.totalAmount;
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    
    // Remove item from cart
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.productId !== productId);
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cart');
    },
    
    // Load cart from localStorage
    loadCart: (state) => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          state.items = JSON.parse(savedCart);
          const totals = calculateTotals(state.items);
          state.totalQuantity = totals.totalQuantity;
          state.totalAmount = totals.totalAmount;
        }
      } catch (error) {
        // Error loading cart, reset to defaults
        localStorage.removeItem('cart');
      }
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.isError = true;
      state.message = action.payload;
      state.isLoading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
    
    // Reset cart state
    reset: (state) => {
      return initialState;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  loadCart,
  setLoading,
  setError,
  clearError,
  reset,
} = cartSlice.actions;

export default cartSlice.reducer;
