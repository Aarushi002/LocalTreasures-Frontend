
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  IconButton,
  Chip,
  Rating,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

import { 
  removeFromWishlist, 
  clearWishlist,
  reset 
} from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import LoadingSpinner from '../Common/LoadingSpinner';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { items = [], isLoading = false, isError = false, message = '' } = useSelector((state) => state.wishlist || {});
  
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Debug logging (moved above hooks)
  console.log('🛍️ Wishlist component render:', {
    user: user?.id || user?._id,
    userObject: user,
    itemsLength: items.length,
    items: items,
    isLoading,
    isError,
    message
  });

  useEffect(() => {
    // Wishlist is already loaded in App.js, no need to reload here
    // Only reset on unmount
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      dispatch(addNotification({
        type: isError ? 'error' : 'success',
        message,
      }));
    }
  }, [message, isError, dispatch]);

  // Prevent sellers from accessing wishlist
  if (user?.role === 'seller') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FavoriteIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.secondary">
            Wishlist Not Available
          </Typography>
          <Typography variant="body1" color="text.disabled" sx={{ mb: 3 }}>
            Sellers cannot use the wishlist feature. The wishlist is only available for buyers to save products they want to purchase.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
          >
            View Products
          </Button>
        </Box>
      </Container>
    );
  }



  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    // Prevent sellers from adding to cart
    if (user?.role === 'seller') {
      dispatch(addNotification({
        type: 'error',
        message: 'Sellers cannot purchase products. Please switch to a buyer account to make purchases.',
      }));
      return;
    }

    dispatch(addToCart({ product, quantity: 1, userRole: user?.role }));
    dispatch(addNotification({
      type: 'success',
      message: 'Product added to cart',
    }));
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    setClearDialogOpen(false);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Please log in to view your wishlist.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Wishlist
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </Typography>
        </Box>
        
        {items.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={() => setClearDialogOpen(true)}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Wishlist Items */}
      {items.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center',
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start adding products you love to see them here
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            size="large"
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {/* Remove from Wishlist Button */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    zIndex: 1,
                    '&:hover': {
                      bgcolor: 'error.main',
                      color: 'white',
                    },
                  }}
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  size="small"
                >
                  <FavoriteIcon color="error" />
                </IconButton>

                {/* Product Image */}
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images?.[0]?.url || '/placeholder-image.jpg'}
                  alt={product.name}
                  sx={{
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewProduct(product._id)}
                />

                {/* Product Content */}
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleViewProduct(product._id)}
                  >
                    {product.name}
                  </Typography>

                  {/* Price */}
                  <Typography
                    variant="h6"
                    color="primary"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ${product.price}
                  </Typography>

                  {/* Category */}
                  <Chip
                    label={product.category}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />

                  {/* Rating */}
                  {product.ratings?.average > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating
                        value={product.ratings.average}
                        precision={0.5}
                        size="small"
                        readOnly
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.ratings.count})
                      </Typography>
                    </Box>
                  )}

                  {/* Seller Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {product.seller?.businessInfo?.businessName || product.seller?.name}
                    </Typography>
                  </Box>

                  {/* Availability */}
                  {product.availability?.quantity <= 5 && (
                    <Typography
                      variant="caption"
                      color="warning.main"
                      sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}
                    >
                      Only {product.availability.quantity} left!
                    </Typography>
                  )}
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant={user?.role === 'seller' ? "outlined" : "contained"}
                    fullWidth
                    startIcon={user?.role === 'seller' ? null : <CartIcon />}
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.availability?.inStock || user?.role === 'seller'}
                  >
                    {user?.role === 'seller' 
                      ? 'Sellers Cannot Purchase'
                      : product.availability?.inStock 
                        ? 'Add to Cart' 
                        : 'Out of Stock'
                    }
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Clear Wishlist Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Clear Wishlist</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove all items from your wishlist? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleClearWishlist}
            color="error"
            variant="contained"
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Wishlist;
