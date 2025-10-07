import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';
import toast from 'react-hot-toast';

const initialState = {
  products: [],
  product: null,
  categories: [],
  featuredProducts: [],
  featuredProductsFallback: false,
  sellerProducts: [],
  canReview: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    search: '',
    category: '',
    subcategory: '',
    priceRange: [0, 1000],
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    location: null,
    radius: 10, // km
    sort: 'newest',
    inStockOnly: false,
    freeDelivery: false,
    tags: '',
  },
};

// Get products
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params, thunkAPI) => {
    try {
      const response = await productService.getProducts(params);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single product
export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (productId, thunkAPI) => {
    try {
      const response = await productService.getProduct(productId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch product';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, thunkAPI) => {
    try {
      const response = await productService.createProduct(productData);
      toast.success('Product created successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create product';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, thunkAPI) => {
    try {
      const response = await productService.updateProduct(id, productData);
      toast.success('Product updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update product';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, thunkAPI) => {
    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully!');
      return productId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete product';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get categories
export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, thunkAPI) => {
    try {
      const response = await productService.getCategories();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch categories';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get featured products
export const getFeaturedProducts = createAsyncThunk(
  'products/getFeaturedProducts',
  async (limit, thunkAPI) => {
    try {
      const response = await productService.getFeaturedProducts(limit);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch featured products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get seller products
export const getSellerProducts = createAsyncThunk(
  'products/getSellerProducts',
  async ({ sellerId, params }, thunkAPI) => {
    try {
      const response = await productService.getSellerProducts(sellerId, params);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch seller products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Toggle like
export const toggleLike = createAsyncThunk(
  'products/toggleLike',
  async (productId, thunkAPI) => {
    try {
      const response = await productService.toggleLike(productId);
      return { productId, ...response };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle like';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add review
export const addReview = createAsyncThunk(
  'products/addReview',
  async ({ productId, reviewData }, thunkAPI) => {
    try {
      const response = await productService.addReview(productId, reviewData);
      toast.success('Review added successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add review';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Check if user can review
export const checkCanReview = createAsyncThunk(
  'products/checkCanReview',
  async (productId, thunkAPI) => {
    try {
      const response = await productService.canReview(productId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to check review eligibility';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearProduct: (state) => {
      state.product = null;
      state.canReview = null;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get Product
      .addCase(getProduct.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.product = action.payload.product;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.product = null;
      })
      
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products.unshift(action.payload.product);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Update product in products array
        const index = state.products.findIndex(p => p._id === action.payload.product._id);
        if (index !== -1) {
          state.products[index] = action.payload.product;
        }
        
        // Update current product if it's the same
        if (state.product && state.product._id === action.payload.product._id) {
          state.product = action.payload.product;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Remove product from products array
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get Categories
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      })
      
      // Get Featured Products
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.products;
        state.featuredProductsFallback = action.payload.isFallback || false;
      })
      
      // Get Seller Products
      .addCase(getSellerProducts.fulfilled, (state, action) => {
        state.sellerProducts = action.payload.products;
      })
      
      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { productId, likesCount } = action.payload;
        
        // Update product in products array
        const productIndex = state.products.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
          state.products[productIndex].likes = Array(likesCount).fill(null);
        }
        
        // Update current product
        if (state.product && state.product._id === productId) {
          state.product.likes = Array(likesCount).fill(null);
        }
      })
      
      // Add Review
      .addCase(addReview.fulfilled, (state, action) => {
        if (state.product) {
          state.product.reviews = action.payload.reviews;
          state.canReview = { canReview: false, reason: 'already_reviewed' };
        }
      })
      
      // Check Can Review
      .addCase(checkCanReview.fulfilled, (state, action) => {
        state.canReview = action.payload;
      });
  },
});

export const { 
  reset, 
  clearProduct, 
  updateFilters, 
  resetFilters, 
  updatePagination 
} = productSlice.actions;

export default productSlice.reducer;
