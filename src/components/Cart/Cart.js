import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  TextField,
  Card,
  CardContent,
  Alert,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

import { closeCart } from '../../store/slices/uiSlice';
import { updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { cartOpen } = useSelector((state) => state.ui);
  const { items, totalQuantity, totalAmount, isError, message } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
      setNotification({
        open: true,
        message: 'Item removed from cart',
        severity: 'info'
      });
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    setNotification({
      open: true,
      message: 'Item removed from cart',
      severity: 'info'
    });
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setNotification({
      open: true,
      message: 'Cart cleared',
      severity: 'info'
    });
  };

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login
      navigate('/auth/login');
      handleClose();
      return;
    }

    // Prevent sellers from checking out
    if (user.role === 'seller') {
      setNotification({
        open: true,
        message: 'Sellers cannot purchase products. Please switch to a buyer account to make purchases.',
        severity: 'error'
      });
      return;
    }

    // Navigate to checkout page with cart items
    navigate('/checkout', { state: { items, fromCart: true } });
    handleClose();
  };

  const calculateDeliveryFee = () => {
    // Simple delivery fee calculation - could be more sophisticated
    return totalAmount > 50 ? 0 : 5;
  };

  const deliveryFee = calculateDeliveryFee();
  const finalTotal = totalAmount + deliveryFee;

  return (
    <Drawer
      anchor="right"
      open={cartOpen}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: 400,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CartIcon />
              <Typography variant="h6">
                Shopping Cart ({totalQuantity})
              </Typography>
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {user?.role === 'seller' ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CartIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Cart not available
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                Sellers cannot purchase products. The cart feature is only available for buyers.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  navigate('/products');
                  handleClose();
                }}
              >
                View Products
              </Button>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CartIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                Add some products to get started
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  navigate('/products');
                  handleClose();
                }}
              >
                Shop Now
              </Button>
            </Box>
          ) : (
            <>
              <List sx={{ p: 0 }}>
                {items.map((item) => (
                  <ListItem key={item.productId} sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
                    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.image}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          by {item.seller.name}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${item.price}
                        </Typography>
                        
                        {/* Availability check */}
                        {item.availability && !item.availability.inStock && (
                          <Chip 
                            label="Out of Stock" 
                            color="error" 
                            size="small" 
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveItem(item.productId)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    {/* Quantity Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            handleUpdateQuantity(item.productId, value);
                          }}
                          inputProps={{
                            min: 1,
                            max: item.availability?.quantity || 999,
                            style: { textAlign: 'center' }
                          }}
                          size="small"
                          sx={{ width: 60 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= (item.availability?.quantity || 999)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>

              {/* Clear Cart Button */}
              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearCart}
                  size="small"
                  fullWidth
                >
                  Clear Cart
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Cart Summary & Checkout */}
        {items.length > 0 && user?.role !== 'seller' && (
          <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal ({totalQuantity} items)</Typography>
                  <Typography>${totalAmount.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShippingIcon fontSize="small" />
                    <Typography>Delivery</Typography>
                  </Box>
                  <Typography color={deliveryFee === 0 ? 'success.main' : 'text.primary'}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ${finalTotal.toFixed(2)}
                  </Typography>
                </Box>

                {!user && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Please sign in to proceed with checkout
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  sx={{ mb: 1 }}
                >
                  {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    navigate('/products');
                    handleClose();
                  }}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Error Display */}
      {isError && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{message}</Alert>
        </Box>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default Cart;
