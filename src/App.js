import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Components
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Cart from './components/Cart/Cart';
import NotificationContainer from './components/Common/NotificationContainer';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/Chat';
import Checkout from './pages/Checkout/Checkout';
import WishlistPage from './pages/Wishlist/WishlistPage';
import NotFound from './pages/NotFound';

// Store
import { loadUser } from './store/slices/authSlice';
import { loadCart } from './store/slices/cartSlice';
import { getWishlist } from './store/slices/wishlistSlice';

// Services
import { initializeSocket } from './services/socketService';
import keepAliveService from './services/keepaliveService';

function App() {
  const dispatch = useDispatch();
  const { user, isLoading, token } = useSelector((state) => state.auth);
  
  // Use refs to prevent unnecessary re-runs
  const userLoadedRef = useRef(false);
  const wishlistLoadedRef = useRef(false);

  useEffect(() => {
    // Load user if token exists and not already loaded
    if (token && !userLoadedRef.current) {
      userLoadedRef.current = true;
      dispatch(loadUser());
    }
    
    // Load cart from localStorage - only once
    dispatch(loadCart());
  }, [dispatch, token]);

  // Separate useEffect for wishlist to avoid infinite loop
  useEffect(() => {
    // Load wishlist if user is authenticated and not already loaded
    const userId = user?.id || user?._id;
    if (userId && token && !wishlistLoadedRef.current) {
      wishlistLoadedRef.current = true;
      dispatch(getWishlist());
    }
    
    // Reset flags when user logs out
    if (!token) {
      userLoadedRef.current = false;
      wishlistLoadedRef.current = false;
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (user && token) {
      initializeSocket(token);
    }
  }, [user, token]);

  useEffect(() => {
    // Start keepalive service when app loads
    keepAliveService.start();
    
    // Cleanup on unmount
    return () => {
      keepAliveService.stop();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 7, sm: 8 } }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Auth Routes */}
          <Route 
            path="/auth/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/auth/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/products/add" 
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/products/:id/edit" 
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat/*" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      
      {/* Cart Drawer */}
      <Cart />
      
      {/* Global Notifications */}
      <NotificationContainer />
    </Box>
  );
}

export default App;
