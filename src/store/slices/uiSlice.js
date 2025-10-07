import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Navigation
  mobileMenuOpen: false,
  
  // Modals and dialogs
  loginModalOpen: false,
  registerModalOpen: false,
  locationModalOpen: false,
  
  // Location
  userLocation: null,
  locationPermission: null, // 'granted', 'denied', 'prompt'
  
  // Search
  searchQuery: '',
  searchFilters: {
    category: '',
    priceRange: [0, 1000],
    distance: 10,
    sortBy: 'relevance',
  },
  
  // Theme
  darkMode: false,
  
  // Notifications
  notifications: [],
  notificationCount: 0,
  
  // Loading states
  pageLoading: false,
  
  // Errors
  globalError: null,
  
  // Map
  mapCenter: null,
  mapZoom: 12,
  
  // Cart
  cartOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navigation
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    
    // Modals
    openLoginModal: (state) => {
      state.loginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.loginModalOpen = false;
    },
    openRegisterModal: (state) => {
      state.registerModalOpen = true;
    },
    closeRegisterModal: (state) => {
      state.registerModalOpen = false;
    },
    openLocationModal: (state) => {
      state.locationModalOpen = true;
    },
    closeLocationModal: (state) => {
      state.locationModalOpen = false;
    },
    
    // Location
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
      if (action.payload) {
        state.mapCenter = {
          lat: action.payload.latitude,
          lng: action.payload.longitude,
        };
      }
    },
    setLocationPermission: (state, action) => {
      state.locationPermission = action.payload;
    },
    
    // Search
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    updateSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    resetSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters;
    },
    
    // Theme
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', JSON.stringify(action.payload));
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.notificationCount += 1;
    },
    markNotificationRead: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state.notificationCount = Math.max(0, state.notificationCount - 1);
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.notificationCount = 0;
    },
    removeNotification: (state, action) => {
      const id = action.payload;
      const index = state.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.notificationCount = Math.max(0, state.notificationCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.notificationCount = 0;
    },
    
    // Loading
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    
    // Errors
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    // Map
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action) => {
      state.mapZoom = action.payload;
    },
    
    // Cart
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    
    // Reset
    reset: (state) => {
      return { ...initialState, darkMode: state.darkMode };
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  openLoginModal,
  closeLoginModal,
  openRegisterModal,
  closeRegisterModal,
  openLocationModal,
  closeLocationModal,
  setUserLocation,
  setLocationPermission,
  setSearchQuery,
  updateSearchFilters,
  resetSearchFilters,
  toggleDarkMode,
  setDarkMode,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  setPageLoading,
  setGlobalError,
  clearGlobalError,
  setMapCenter,
  setMapZoom,
  toggleCart,
  openCart,
  closeCart,
  reset,
} = uiSlice.actions;

export default uiSlice.reducer;
