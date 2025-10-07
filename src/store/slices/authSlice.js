import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  validationErrors: {},
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      const validationErrors = error.response?.data?.errors || [];
      
      // Show validation errors as toasts
      if (validationErrors.length > 0) {
        validationErrors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(message);
      }
      
      return thunkAPI.rejectWithValue({
        message,
        validationErrors: validationErrors.reduce((acc, err) => {
          // Extract field name from error path or message
          const field = err.path || (err.message.toLowerCase().includes('password') ? 'password' : 
                       err.message.toLowerCase().includes('email') ? 'email' : 'general');
          acc[field] = err.message;
          return acc;
        }, {})
      });
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.login(userData);
      toast.success('Login successful!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      const validationErrors = error.response?.data?.errors || [];
      
      // Show validation errors as toasts
      if (validationErrors.length > 0) {
        validationErrors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(message);
      }
      
      return thunkAPI.rejectWithValue({
        message,
        validationErrors: validationErrors.reduce((acc, err) => {
          const field = err.path || (err.message.toLowerCase().includes('password') ? 'password' : 
                       err.message.toLowerCase().includes('email') ? 'email' : 'general');
          acc[field] = err.message;
          return acc;
        }, {})
      });
    }
  }
);

// Load user
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, thunkAPI) => {
    try {
      // Check if we have a valid token
      const token = localStorage.getItem('token');
      if (!token) {
        return thunkAPI.rejectWithValue('No token found');
      }
      
      const response = await authService.getMe();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to load user';
      
      // Clear invalid tokens silently
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.updateProfile(userData);
      toast.success('Profile updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      const validationErrors = error.response?.data?.errors || [];
      
      // Show validation errors as toasts
      if (validationErrors.length > 0) {
        validationErrors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(message);
      }
      
      return thunkAPI.rejectWithValue({
        message,
        validationErrors: validationErrors.reduce((acc, err) => {
          const field = err.path || 'general';
          acc[field] = err.message;
          return acc;
        }, {})
      });
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, thunkAPI) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      const validationErrors = error.response?.data?.errors || [];
      
      // Show validation errors as toasts
      if (validationErrors.length > 0) {
        validationErrors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(message);
      }
      
      return thunkAPI.rejectWithValue({
        message,
        validationErrors: validationErrors.reduce((acc, err) => {
          const field = err.path || (err.message.toLowerCase().includes('password') ? 'password' : 'general');
          acc[field] = err.message;
          return acc;
        }, {})
      });
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await authService.logout();
      toast.success('Logged out successfully!');
      return;
    } catch (error) {
      // Even if API call fails, we should logout locally
      return;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.validationErrors = {};
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
      state.validationErrors = {};
    },
    updateUserLocation: (state, action) => {
      if (state.user) {
        state.user.location = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        
        // Clear invalid token
        state.user = null;
        state.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
        state.validationErrors = {};
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      });
  },
});

export const { reset, clearError, updateUserLocation } = authSlice.actions;
export default authSlice.reducer;
