import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { addNotification, createNotification } from '../../store/slices/notificationSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const steps = ['Delivery Details', 'Payment Method', 'Review Order'];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { isLoading = false, isError = false, message = '' } = useSelector((state) => state.orders || {});
  
  const [activeStep, setActiveStep] = useState(0);
  const [items, setItems] = useState([]);
  const [deliveryDetails, setDeliveryDetails] = useState({
    method: 'delivery',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    // Get items from location state (Buy Now) or cart
    const checkoutItems = location.state?.items || cartItems;
    
    if (!checkoutItems || checkoutItems.length === 0) {
      navigate('/products');
      return;
    }

    setItems(checkoutItems);
  }, [user, location.state, cartItems, navigate]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryDetails.method === 'delivery' ? (subtotal > 50 ? 0 : 5) : 0;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;
    
    return { subtotal, deliveryFee, tax, total };
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate delivery details
      if (deliveryDetails.method === 'delivery') {
        const { street, city, state, zipCode } = deliveryDetails.address;
        if (!street || !city || !state || !zipCode) {
          alert('Please fill in all delivery address fields');
          return;
        }
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    // Prevent multiple submissions
    if (isPlacingOrder || isLoading) {
      return;
    }

    setIsPlacingOrder(true);
    setConfirmOrder(false); // Close confirmation dialog

    try {
      // Group items by seller
      const itemsBySeller = items.reduce((acc, item) => {
        const sellerId = item.seller.id;
        if (!acc[sellerId]) {
          acc[sellerId] = {
            seller: item.seller,
            items: [],
          };
        }
        acc[sellerId].items.push({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
        return acc;
      }, {});

      // Create separate orders for each seller
      const orderPromises = Object.values(itemsBySeller).map(({ seller, items: sellerItems }) => {
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const sellerDeliveryFee = deliveryDetails.method === 'delivery' ? (sellerSubtotal > 50 ? 0 : 5) : 0;
        const sellerTax = sellerSubtotal * 0.08;
        const sellerTotal = sellerSubtotal + sellerDeliveryFee + sellerTax;

        return dispatch(createOrder({
          seller: seller.id,
          items: sellerItems,
          totals: {
            subtotal: sellerSubtotal,
            deliveryFee: sellerDeliveryFee,
            tax: sellerTax,
            total: sellerTotal,
          },
          delivery: deliveryDetails,
          payment: {
            method: paymentMethod,
            status: 'pending',
          },
          metadata: {
            source: 'web',
          },
        }));
      });

      const results = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const hasFailures = results.some(result => result.type.includes('rejected'));
      
      if (!hasFailures) {
        // All orders created successfully
        setOrderSuccess(true);
        
        // Show success notification
        dispatch(addNotification(createNotification.success(
          `Order${orderPromises.length > 1 ? 's' : ''} placed successfully! You will receive a confirmation email shortly.`
        )));
        
        // Clear cart if this was a cart checkout
        if (location.state?.fromCart) {
          dispatch(clearCart());
        }
      } else {
        // Some orders failed
        dispatch(addNotification(createNotification.error(
          'Some orders could not be placed. Please try again or contact support.'
        )));
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      
      // Show error notification
      dispatch(addNotification(createNotification.error(
        'Failed to place order. Please try again or contact support if the problem persists.'
      )));
      
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleOrderSuccess = () => {
    setOrderSuccess(false);
    navigate('/dashboard?tab=orders');
  };

  const totals = calculateTotals();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderDeliveryStep = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Delivery Information
      </Typography>
      
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Delivery Method</FormLabel>
        <RadioGroup
          value={deliveryDetails.method}
          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, method: e.target.value }))}
        >
          <FormControlLabel value="delivery" control={<Radio />} label="Home Delivery" />
          <FormControlLabel value="pickup" control={<Radio />} label="Pickup from Store" />
        </RadioGroup>
      </FormControl>

      {deliveryDetails.method === 'delivery' && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Delivery Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={deliveryDetails.address.street}
                onChange={(e) => setDeliveryDetails(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={deliveryDetails.address.city}
                onChange={(e) => setDeliveryDetails(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={deliveryDetails.address.state}
                onChange={(e) => setDeliveryDetails(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={deliveryDetails.address.zipCode}
                onChange={(e) => setDeliveryDetails(prev => ({
                  ...prev,
                  address: { ...prev.address, zipCode: e.target.value }
                }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Instructions (Optional)"
                multiline
                rows={2}
                value={deliveryDetails.instructions}
                onChange={(e) => setDeliveryDetails(prev => ({
                  ...prev,
                  instructions: e.target.value
                }))}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );

  const renderPaymentStep = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      
      <FormControl component="fieldset">
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel 
            value="stripe" 
            control={<Radio />} 
            label="Credit/Debit Card (Stripe)" 
          />
          <FormControlLabel 
            value="razorpay" 
            control={<Radio />} 
            label="Razorpay" 
          />
          <FormControlLabel 
            value="cash_on_delivery" 
            control={<Radio />} 
            label="Cash on Delivery" 
          />
        </RadioGroup>
      </FormControl>

      {paymentMethod === 'cash_on_delivery' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You will pay in cash when your order is delivered.
        </Alert>
      )}
    </Paper>
  );

  const renderReviewStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          <List>
            {items.map((item, index) => (
              <ListItem key={`${item.productId}-${index}`} divider>
                <ListItemAvatar>
                  <Avatar src={item.image} variant="rounded" />
                </ListItemAvatar>
                <Box sx={{ flex: 1, ml: 2 }}>
                  <Typography variant="subtitle1">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {item.seller.name}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {item.quantity} × ${item.price} = ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Delivery Details
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ mr: 1 }} />
            <Typography>
              {deliveryDetails.method === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
            </Typography>
          </Box>
          {deliveryDetails.method === 'delivery' && (
            <Typography variant="body2" color="text.secondary">
              {deliveryDetails.address.street}, {deliveryDetails.address.city}, {deliveryDetails.address.state} {deliveryDetails.address.zipCode}
            </Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Payment Method
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon sx={{ mr: 1 }} />
            <Typography>
              {paymentMethod === 'stripe' && 'Credit/Debit Card (Stripe)'}
              {paymentMethod === 'razorpay' && 'Razorpay'}
              {paymentMethod === 'cash_on_delivery' && 'Cash on Delivery'}
            </Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>${totals.subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Delivery</Typography>
              <Typography>{totals.deliveryFee === 0 ? 'FREE' : `$${totals.deliveryFee.toFixed(2)}`}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax</Typography>
              <Typography>${totals.tax.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ${totals.total.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>
        {activeStep === 0 && renderDeliveryStep()}
        {activeStep === 1 && renderPaymentStep()}
        {activeStep === 2 && renderReviewStep()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setConfirmOrder(true)}
            disabled={isLoading || isPlacingOrder}
            sx={{ minWidth: 150 }}
          >
            Place Order
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>

      {/* Order Confirmation Dialog */}
      <Dialog 
        open={confirmOrder} 
        onClose={() => setConfirmOrder(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Confirm Your Order
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to place this order?
          </Typography>
          <Typography variant="h6" color="primary">
            Total: ${totals.total.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Payment Method: {paymentMethod === 'stripe' && 'Credit/Debit Card (Stripe)'}
            {paymentMethod === 'razorpay' && 'Razorpay'}
            {paymentMethod === 'cash_on_delivery' && 'Cash on Delivery'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setConfirmOrder(false)}
            disabled={isPlacingOrder}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePlaceOrder}
            disabled={isLoading || isPlacingOrder}
            startIcon={isLoading || isPlacingOrder ? <CircularProgress size={20} /> : null}
            sx={{ 
              minWidth: 150,
              '&.Mui-disabled': {
                backgroundColor: 'primary.main',
                opacity: 0.6,
                color: 'white',
              }
            }}
          >
            {isLoading || isPlacingOrder ? 'Placing Order...' : 'Confirm & Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog 
        open={orderSuccess} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              Order Placed Successfully!
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h6" gutterBottom>
            Thank you for your order!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your order has been received and is being processed. You will receive an email confirmation shortly with your order details and tracking information.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can track your order status in your dashboard.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleOrderSuccess}
            size="large"
            sx={{ minWidth: 150 }}
          >
            View My Orders
          </Button>
          <Button 
            variant="outlined"
            onClick={() => navigate('/products')}
            size="large"
            sx={{ minWidth: 150 }}
          >
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout;
