import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';

const initialState = {
  items: [],
  isLoading: false,
  isError: false,
  message: '',
  totalItems: 0,
};

// Get wishlist
export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, thunkAPI) => {
    try {
      const response = await wishlistService.getWishlist();
      return response;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      
      // If it's a 404 or auth error, return empty wishlist instead of failing
      if (error.response?.status === 404 || error.response?.status === 401) {
        return { wishlist: [], count: 0 };
      }
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add item to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, thunkAPI) => {
    try {
      return await wishlistService.addToWishlist(productId);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove item from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, thunkAPI) => {
    try {
      return await wishlistService.removeFromWishlist(productId);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Clear wishlist
export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, thunkAPI) => {
    try {
      return await wishlistService.clearWishlist();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Reset state
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
    
    // Check if product is in wishlist
    isInWishlist: (state, action) => {
      const productId = action.payload;
      return state.items.some(item => item._id === productId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get wishlist
      .addCase(getWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.items = action.payload?.wishlist || [];
        state.totalItems = action.payload?.count || 0;
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.items = action.payload?.wishlist || [];
        state.totalItems = action.payload?.count || 0;
        state.message = 'Item added to wishlist';
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.items = action.payload?.wishlist || [];
        state.totalItems = action.payload?.count || 0;
        state.message = 'Item removed from wishlist';
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.items = [];
        state.totalItems = 0;
        state.message = 'Wishlist cleared';
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearError, isInWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
