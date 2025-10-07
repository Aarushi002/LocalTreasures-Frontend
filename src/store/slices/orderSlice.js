import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response; // The interceptor already returns response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOrders = createAsyncThunk(
  'orders/getAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response; // The interceptor already returns response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOrder = createAsyncThunk(
  'orders/getOne',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrder(orderId);
      return response; // The interceptor already returns response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  orders: [],
  order: null,
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
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setOrders: (state, action) => {
      state.orders = action.payload.orders;
      state.pagination = action.payload.pagination;
    },
    setOrder: (state, action) => {
      state.order = action.payload;
    },
    addOrder: (state, action) => {
      if (state.orders && Array.isArray(state.orders)) {
        state.orders.unshift(action.payload);
      }
    },
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;
      if (state.orders && Array.isArray(state.orders)) {
        const index = state.orders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      }
      if (state.order && state.order._id === updatedOrder._id) {
        state.order = updatedOrder;
      }
    },
    setError: (state, action) => {
      state.isError = true;
      state.message = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.order = action.payload;
        if (state.orders && Array.isArray(state.orders)) {
          state.orders.unshift(action.payload);
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Orders
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload?.orders || [];
        state.pagination = action.payload?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.orders = [];
      })
      // Get Order
      .addCase(getOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  reset,
  setLoading,
  setOrders,
  setOrder,
  addOrder,
  updateOrder,
  setError,
  clearError,
} = orderSlice.actions;

export default orderSlice.reducer;
