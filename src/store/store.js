import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productSlice from './slices/productSlice';
import chatSlice from './slices/chatSlice';
import orderSlice from './slices/orderSlice';
import uiSlice from './slices/uiSlice';
import cartSlice from './slices/cartSlice';
import notificationSlice from './slices/notificationSlice';
import wishlistSlice from './slices/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    chat: chatSlice,
    orders: orderSlice,
    ui: uiSlice,
    cart: cartSlice,
    notifications: notificationSlice,
    wishlist: wishlistSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
