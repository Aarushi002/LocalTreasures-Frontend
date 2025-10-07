import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const OrderCard = ({ order, userRole }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'warning',
      'confirmed': 'info',
      'preparing': 'info',
      'ready': 'primary',
      'out_for_delivery': 'primary',
      'delivered': 'success',
      'cancelled': 'error',
      'refunded': 'error',
    };
    return statusColors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      'pending': 'warning',
      'processing': 'info',
      'completed': 'success',
      'failed': 'error',
      'refunded': 'error',
    };
    return statusColors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOtherParty = () => {
    return userRole === 'seller' ? order.buyer : order.seller;
  };

  const getOtherPartyName = () => {
    const otherParty = getOtherParty();
    if (userRole === 'seller') {
      return otherParty?.name || 'Unknown Buyer';
    }
    return otherParty?.businessInfo?.businessName || otherParty?.name || 'Unknown Seller';
  };

  const handleContactOtherParty = () => {
    const otherParty = getOtherParty();
    if (otherParty?._id) {
      // Use otherUserId instead of assuming it's always a seller
      navigate(`/chat?userId=${otherParty._id}&orderId=${order._id}`);
    }
  };

  return (
    <>
      <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          {/* Order Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Order #{order.orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {formatDate(order.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={order.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(order.status)}
                size="small"
              />
              <IconButton
                onClick={() => setExpanded(!expanded)}
                size="small"
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Order Summary */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {userRole === 'seller' ? <PersonIcon fontSize="small" /> : <StoreIcon fontSize="small" />}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {userRole === 'seller' ? 'Customer' : 'Seller'}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {getOtherPartyName()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payment
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {order.payment.method.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShippingIcon fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Delivery
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {order.delivery.method.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h6" color="primary">
                  ${order.totals.total.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Order Items Preview */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}:
            </Typography>
            {order.items.slice(0, 3).map((item, index) => (
              <Avatar
                key={index}
                src={item.product?.images?.[0]?.url}
                alt={item.product?.name}
                sx={{ width: 32, height: 32 }}
                variant="rounded"
              />
            ))}
            {order.items.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{order.items.length - 3} more
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={() => setDetailsOpen(true)}
            >
              View Details
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ChatIcon />}
              onClick={handleContactOtherParty}
            >
              Contact {userRole === 'seller' ? 'Customer' : 'Seller'}
            </Button>
            {order.status === 'delivered' && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<StarIcon />}
                color="primary"
              >
                Rate Order
              </Button>
            )}
          </Box>

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Order Items
            </Typography>
            <List dense>
              {order.items.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      src={item.product?.images?.[0]?.url}
                      alt={item.product?.name}
                      variant="rounded"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product?.name}
                    secondary={`Quantity: ${item.quantity} × $${item.price} = $${(item.quantity * item.price).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>

            {/* Payment and Delivery Status */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Status
                  </Typography>
                  <Chip
                    label={order.payment.status.toUpperCase()}
                    color={getPaymentStatusColor(order.payment.status)}
                    size="small"
                  />
                </Paper>
              </Grid>
              {order.delivery.method === 'delivery' && order.delivery.address && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Delivery Address
                    </Typography>
                    <Typography variant="body2">
                      {order.delivery.address.street}, {order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zipCode}
                    </Typography>
                    {order.delivery.instructions && (
                      <Typography variant="caption" color="text.secondary">
                        Instructions: {order.delivery.instructions}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - #{order.orderNumber}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              <Typography variant="body2">
                <strong>Order Date:</strong> {formatDate(order.createdAt)}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {order.status.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Payment Method:</strong> {order.payment.method.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Payment Status:</strong> {order.payment.status.toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Typography variant="body2">
                <strong>Subtotal:</strong> ${order.totals.subtotal.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Delivery Fee:</strong> ${order.totals.deliveryFee.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Tax:</strong> ${order.totals.tax.toFixed(2)}
              </Typography>
              <Typography variant="h6" color="primary">
                <strong>Total: ${order.totals.total.toFixed(2)}</strong>
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const OrderList = ({ orders = [], userRole, loading = false }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading orders...</Typography>
      </Paper>
    );
  }

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <ShippingIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No orders found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {userRole === 'seller' 
            ? "You haven't received any orders yet. Start promoting your products to get your first order!"
            : "You haven't placed any orders yet. Start shopping to see your orders here!"
          }
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {userRole === 'seller' ? 'Customer Orders' : 'Your Orders'} ({orders.length})
      </Typography>
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} userRole={userRole} />
      ))}
    </Box>
  );
};

export default OrderList;
