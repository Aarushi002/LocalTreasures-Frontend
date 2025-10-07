import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        autoHideDuration: 4000,
        severity: 'info',
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Helper function to create different types of notifications
export const createNotification = {
  success: (message, options = {}) => ({
    message,
    severity: 'success',
    ...options,
  }),
  
  error: (message, options = {}) => ({
    message,
    severity: 'error',
    autoHideDuration: 6000,
    ...options,
  }),
  
  warning: (message, options = {}) => ({
    message,
    severity: 'warning',
    autoHideDuration: 5000,
    ...options,
  }),
  
  info: (message, options = {}) => ({
    message,
    severity: 'info',
    ...options,
  }),
};
