import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Rating,
  Tab,
  Tabs,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  ShoppingCart as CartIcon,
  Chat as ChatIcon,
  Verified as VerifiedIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import { getProduct, addReview, checkCanReview } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { openCart } from '../../store/slices/uiSlice';
import { addNotification, createNotification } from '../../store/slices/notificationSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import GoogleMap from '../../components/Common/GoogleMap';
import WishlistButton from '../../components/Common/WishlistButton';
import ReviewHelpGuide from '../../components/Common/ReviewHelpGuide';
import ProductImage from '../../components/Common/ProductImage';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { product, isLoading, isError, message, canReview } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  // Get fallback image URL
  const getFallbackImage = (category = 'other', index = 0) => {
    const fallbackImages = {
      handmade: `https://picsum.photos/400/400?random=${100 + index}`,
      food: `https://picsum.photos/400/400?random=${200 + index}`, 
      art: `https://picsum.photos/400/400?random=${300 + index}`,
      clothing: `https://picsum.photos/400/400?random=${400 + index}`,
      jewelry: `https://picsum.photos/400/400?random=${500 + index}`,
      home_decor: `https://picsum.photos/400/400?random=${600 + index}`,
      other: `https://picsum.photos/400/400?random=${700 + index}`
    };
    return fallbackImages[category] || fallbackImages.other;
  };

  // Get image URL with fallback
  const getImageUrl = (imageIndex) => {
    return product.images?.[imageIndex]?.url || getFallbackImage(product?.category, imageIndex);
  };

  useEffect(() => {
    if (id) {
      dispatch(getProduct(id));
      if (user) {
        dispatch(checkCanReview(id));
      }
    }
  }, [dispatch, id, user]);

  const handleQuantityChange = (event) => {
    const value = Math.max(1, Math.min(event.target.value, product?.stock || 1));
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    // Prevent sellers from adding products to cart
    if (user.role === 'seller') {
      dispatch(addNotification(createNotification.error('Sellers cannot purchase products. Please switch to a buyer account to make purchases.')));
      return;
    }

    if (!product.availability?.inStock || product.availability.quantity === 0) {
      dispatch(addNotification(createNotification.error('This product is currently out of stock')));
      return;
    }

    // Add product to cart
    dispatch(addToCart({ product, quantity, userRole: user.role }));
    
    // Show success notification and open cart
    dispatch(addNotification(createNotification.success(`Added ${quantity} ${product.name} to cart`)));
    
    // Open cart drawer
    dispatch(openCart());
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    // Prevent sellers from buying products
    if (user.role === 'seller') {
      dispatch(addNotification(createNotification.error('Sellers cannot purchase products. Please switch to a buyer account to make purchases.')));
      return;
    }

    if (!product.availability?.inStock || product.availability.quantity === 0) {
      dispatch(addNotification(createNotification.error('This product is currently out of stock')));
      return;
    }

    // Create item for checkout
    const checkoutItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0]?.url || '',
      seller: {
        id: product.seller._id,
        name: product.seller?.businessInfo?.businessName || product.seller?.name,
      },
      availability: product.availability,
      category: product.category,
    };

    // Navigate to checkout with this single item
    navigate('/checkout', { state: { items: [checkoutItem] } });
  };

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    // Prevent sellers from contacting other sellers
    if (user.role === 'seller') {
      dispatch(addNotification(createNotification.error('Sellers cannot contact other sellers. Only buyers can contact sellers for purchases.')));
      return;
    }

    if (product?.seller?._id) {
      // Navigate to chat page with seller and product context
      navigate(`/chat?sellerId=${product.seller._id}&productId=${id}&productName=${encodeURIComponent(product.name)}`);
    }
  };

  const handleAddReview = async () => {
    // Prevent sellers from submitting reviews
    if (user?.role === 'seller') {
      dispatch(addNotification(createNotification.error('Sellers cannot write reviews. Only buyers can review products.')));
      return;
    }

    if (!newReview.rating || !newReview.comment.trim()) {
      dispatch(addNotification(createNotification.error('Please provide both rating and comment')));
      return;
    }

    try {
      await dispatch(addReview({ 
        productId: id, 
        reviewData: {
          rating: newReview.rating,
          comment: newReview.comment.trim()
        }
      })).unwrap();

      setReviewDialogOpen(false);
      setNewReview({ rating: 5, comment: '' });
      
      // Refresh product data to show the new review
      dispatch(getProduct(id));
    } catch (error) {
      // Error is already handled by the Redux action with toast
      console.error('Failed to add review:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {message || 'Product not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          Home
        </Link>
        <Link color="inherit" onClick={() => navigate('/products')} sx={{ cursor: 'pointer' }}>
          Products
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <ProductImage
              src={getImageUrl(selectedImageIndex)}
              alt={product.name}
              category={product.category}
              index={selectedImageIndex}
              sx={{ height: 400 }}
            />
          </Card>
          
          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: 80,
                    height: 80,
                    cursor: 'pointer',
                    border: selectedImageIndex === index ? '2px solid primary.main' : '1px solid grey.300',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <ProductImage
                    src={getImageUrl(index)}
                    alt={`${product.name} ${index + 1}`}
                    category={product.category}
                    index={index}
                    sx={{ width: '100%', height: '100%' }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Title and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              <Box>
                <WishlistButton product={product} size="small" />
                <IconButton size="small" onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Rating and Reviews */}
            {product.ratings && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={product.ratings.average} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
                </Typography>
              </Box>
            )}

            {/* Price */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" color="primary" component="span">
                ${product.price}
              </Typography>
              {product.originalPrice && product.originalPrice > product.price && (
                <Typography
                  variant="h6"
                  sx={{
                    ml: 2,
                    textDecoration: 'line-through',
                    color: 'text.disabled',
                  }}
                  component="span"
                >
                  ${product.originalPrice}
                </Typography>
              )}
            </Box>

            {/* Description */}
            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            {/* Category and Tags */}
            <Box sx={{ mb: 3 }}>
              <Chip label={product.category} color="primary" sx={{ mr: 1 }} />
              {product.tags?.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" size="small" sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={product.availability?.inStock ? `${product.availability.quantity} in stock` : 'Out of stock'}
                color={product.availability?.inStock ? 'success' : 'error'}
                icon={product.availability?.inStock ? <VerifiedIcon /> : undefined}
              />
            </Box>

            {/* Quantity Selector */}
            {product.availability?.inStock && product.availability.quantity > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Quantity:
                </Typography>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1, max: product.availability?.quantity || 1 }}
                  size="small"
                  sx={{ width: 100 }}
                />
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'nowrap', alignItems: 'center', overflow: 'hidden' }}>
              {user?.role === 'seller' ? (
                <Button
                  variant="outlined"
                  size="large"
                  disabled
                  sx={{ 
                    flex: '1 1 auto', 
                    minWidth: 120,
                    maxWidth: 200,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  Sellers Cannot Purchase
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CartIcon />}
                  onClick={handleAddToCart}
                  disabled={!product.availability?.inStock || product.availability.quantity === 0}
                  sx={{ 
                    flex: '1 1 auto', 
                    minWidth: 120,
                    maxWidth: 200,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  Add to Cart
                </Button>
              )}
              <Button
                variant="outlined"
                size="large"
                onClick={handleBuyNow}
                disabled={!product.availability?.inStock || product.availability.quantity === 0 || user?.role === 'seller'}
                sx={{ 
                  flex: '1 1 auto', 
                  minWidth: 100,
                  maxWidth: 150,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Buy Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ChatIcon />}
                onClick={handleContactSeller}
                disabled={user?.role === 'seller'}
                sx={{ 
                  minWidth: 120,
                  maxWidth: 160,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Contact Seller
              </Button>
              <WishlistButton 
                product={product} 
                size="large"
              />
            </Box>

            {/* Seller Info */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  <StoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {product.seller?.businessInfo?.businessName || product.seller?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.seller?.businessInfo?.businessType}
                  </Typography>
                </Box>
              </Box>
              
              {product.distance && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {product.distance.toFixed(1)} km away
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/seller/${product.seller._id}`)}
              >
                View Store
              </Button>
            </Paper>

            {/* Delivery Info */}
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShippingIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Delivery Information</Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Free delivery within 5km
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Delivery charge: $5 for 5-10km
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Estimated delivery: 1-2 business days
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <SecurityIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Secure payment and buyer protection
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Description" />
          <Tab label="Reviews" />
          <Tab label="Location" />
          <Tab label="Similar Products" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {product.longDescription || product.description}
          </Typography>
          
          {product.specifications && (
            <>
              <Typography variant="h6" gutterBottom>
                Specifications
              </Typography>
              <List dense>
                {Object.entries(product.specifications).map(([key, value]) => {
                  // Handle object values properly
                  let displayValue = '';
                  if (typeof value === 'object' && value !== null) {
                    if (value.length !== undefined && value.width !== undefined && value.height !== undefined) {
                      // Dimensions object
                      displayValue = `${value.length} × ${value.width} × ${value.height} ${value.unit || ''}`;
                    } else if (value.value !== undefined && value.unit !== undefined) {
                      // Value-unit object
                      displayValue = `${value.value} ${value.unit}`;
                    } else {
                      // Generic object - convert to string
                      displayValue = JSON.stringify(value);
                    }
                  } else {
                    displayValue = String(value);
                  }
                  
                  return (
                    <ListItem key={key}>
                      <ListItemText
                        primary={key}
                        secondary={displayValue}
                        sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ReviewHelpGuide canReview={canReview} user={user} product={product} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Customer Reviews ({product.reviews?.length || 0})
            </Typography>
            {user && canReview?.canReview && user.role !== 'seller' && (
              <Button
                variant="outlined"
                onClick={() => setReviewDialogOpen(true)}
              >
                Write Review
              </Button>
            )}
            {user && user.role === 'seller' && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Sellers can view reviews but cannot write them
              </Typography>
            )}
          </Box>

          {/* Review Summary */}
          {product.ratings && product.ratings.count > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {product.ratings.average.toFixed(1)}
                    </Typography>
                    <Rating value={product.ratings.average} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      Based on {product.ratings.count} reviews
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = product.reviews?.filter(r => r.rating === star).length || 0;
                    const percentage = product.ratings.count > 0 ? (count / product.ratings.count) * 100 : 0;
                    
                    return (
                      <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 60 }}>
                          {star} stars
                        </Typography>
                        <Box
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            mx: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: 'primary.main',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 30 }}>
                          {count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Grid>
              </Grid>
            </Paper>
          )}

          {product.reviews && product.reviews.length > 0 ? (
            <List>
              {[...product.reviews]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((review, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={review.user.avatar?.url || review.user.avatar}>
                      {review.user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2">{review.user.name}</Typography>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.disabled">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {review.comment}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No reviews yet. Be the first to review this product!
              </Typography>
              {user && canReview?.canReview && user.role !== 'seller' && (
                <Button
                  variant="contained"
                  onClick={() => setReviewDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Write First Review
                </Button>
              )}
              {user && user.role === 'seller' && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2 }}>
                  Sellers can view reviews but cannot write them
                </Typography>
              )}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {product.seller?.location && (
            <GoogleMap
              center={{
                lat: product.seller.location.coordinates[1],
                lng: product.seller.location.coordinates[0],
              }}
              markers={[
                {
                  position: {
                    lat: product.seller.location.coordinates[1],
                    lng: product.seller.location.coordinates[0],
                  },
                  title: product.seller.businessInfo?.businessName || product.seller.name,
                  infoWindow: `
                    <div>
                      <h4>${product.seller.businessInfo?.businessName || product.seller.name}</h4>
                      <p>${product.seller.location.address?.street || ''}</p>
                      <p>${product.seller.location.address?.city || ''}</p>
                    </div>
                  `,
                },
              ]}
              height="400px"
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="body2" color="text.secondary">
            Similar products feature coming soon!
          </Typography>
        </TabPanel>
      </Box>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen && user?.role !== 'seller'} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={product.images?.[0]?.url} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="h6">Write a Review</Typography>
              <Typography variant="body2" color="text.secondary">
                {product.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" gutterBottom>
              How would you rate this product?
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(e, newValue) => setNewReview(prev => ({ ...prev, rating: newValue }))}
              size="large"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Share your experience"
              multiline
              rows={4}
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Tell others about your experience with this product..."
              helperText={`${newReview.comment.length}/500 characters`}
              inputProps={{ maxLength: 500 }}
              error={newReview.comment.length > 500}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Your review will help other customers make informed decisions.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddReview}
            disabled={!newReview.rating || !newReview.comment.trim()}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetail;