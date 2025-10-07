import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
} from '@mui/material';
import { LocationOn, Store, LocalDining } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { getFeaturedProducts, getCategories } from '../store/slices/productSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ProductCarousel from '../components/Common/ProductCarousel';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { featuredProducts, categories, isLoading, featuredProductsFallback } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getFeaturedProducts(12)); // Get more products for carousel
    dispatch(getCategories());
  }, [dispatch]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/products');
    } else {
      navigate('/register');
    }
  };

  // Category icon and display name mapping
  const categoryMapping = {
    handmade: { name: 'Handmade Crafts', icon: '🎨' },
    food: { name: 'Local Food', icon: '🍯' },
    art: { name: 'Art & Paintings', icon: '🖼️' },
    clothing: { name: 'Clothing', icon: '👗' },
    jewelry: { name: 'Artisan Jewelry', icon: '💎' },
    home_decor: { name: 'Home Decor', icon: '🏺' },
    other: { name: 'Other', icon: '🛍️' },
  };

  // Transform backend categories to display format
  const transformedCategories = categories.map(cat => ({
    id: cat._id,
    name: categoryMapping[cat._id]?.name || cat._id,
    icon: categoryMapping[cat._id]?.icon || '🛍️',
    count: cat.count,
  }));

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 25%, #4CAF50 75%, #66BB6A 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          minHeight: { xs: '80vh', md: '85vh' },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  animation: 'slideInLeft 0.8s ease-out',
                  '@keyframes slideInLeft': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateX(-50px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                  },
                }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    lineHeight: 1.2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(45deg, #FFFFFF, #E8F5E8)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  Discover Local
                  <Box component="span" sx={{ display: 'block', color: '#FFF59D' }}>
                    Treasures ✨
                  </Box>
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    lineHeight: 1.6,
                    fontWeight: 400,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Connect with amazing local artisans, home chefs, and small businesses 
                  right in your neighborhood. Support your community and discover unique treasures!
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 3, 
                    flexWrap: 'wrap',
                    mb: 4,
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{ 
                      px: 4, 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      backgroundColor: '#FF6B35',
                      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
                      border: 'none',
                      borderRadius: 3,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #E55A30, #E8851B)',
                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    🚀 Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/products')}
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      color: 'white',
                      borderWidth: 2,
                      borderRadius: 3,
                      textTransform: 'none',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    🛍️ Browse Products
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  animation: 'slideInRight 0.8s ease-out 0.3s both',
                  '@keyframes slideInRight': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateX(50px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                  },
                }}
              >
                {/* Product Carousel with enhanced styling */}
                <Box 
                  sx={{ 
                    width: '100%', 
                    maxWidth: 450,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -20,
                      left: -20,
                      right: -20,
                      bottom: -20,
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      borderRadius: 4,
                      filter: 'blur(20px)',
                      zIndex: -1,
                    }
                  }}
                >
                  <ProductCarousel 
                    products={featuredProducts.slice(0, 8)} 
                    title="✨ Amazing Local Products"
                    heroMode={true}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose Local Treasures?
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <LocationOn
                sx={{
                  fontSize: '4rem',
                  color: 'primary.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom>
                Hyperlocal Discovery
              </Typography>
              <Typography color="text.secondary">
                Find amazing products and services within 10km of your location. 
                Support your local community and reduce environmental impact.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Store
                sx={{
                  fontSize: '4rem',
                  color: 'primary.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom>
                Verified Artisans
              </Typography>
              <Typography color="text.secondary">
                All sellers are verified local artisans, home chefs, and small businesses. 
                Quality and authenticity guaranteed.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <LocalDining
                sx={{
                  fontSize: '4rem',
                  color: 'primary.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom>
                Real-time Chat
              </Typography>
              <Typography color="text.secondary">
                Chat directly with sellers, ask questions, and customize your orders. 
                Build genuine connections with local creators.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Popular Categories
          </Typography>
          
          <Grid container spacing={3}>
            {transformedCategories.length > 0 ? (
              transformedCategories.slice(0, 8).map((category, index) => (
                <Grid item xs={6} md={3} key={category.id || index}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate(`/products?category=${category.id}`)}
                  >
                    <CardContent>
                      <Typography
                        sx={{
                          fontSize: '3rem',
                          mb: 1,
                        }}
                      >
                        {category.icon}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {category.name}
                      </Typography>
                      <Chip
                        label={`${category.count} product${category.count !== 1 ? 's' : ''}`}
                        color="primary"
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              // Fallback skeleton categories while loading
              [1, 2, 3, 4].map((i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      opacity: 0.6,
                    }}
                  >
                    <CardContent>
                      <Typography
                        sx={{
                          fontSize: '3rem',
                          mb: 1,
                        }}
                      >
                        🛍️
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        Loading...
                      </Typography>
                      <Chip
                        label="..."
                        color="primary"
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 2 }}
        >
          {featuredProductsFallback ? 'Popular Products' : 'Featured Products'}
        </Typography>
        
        {featuredProductsFallback && (
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Showing most popular products in your area
          </Typography>
        )}

        {!featuredProductsFallback && (
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Hand-picked products from local artisans
          </Typography>
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading featured products..." />
        ) : (
          <Grid container spacing={3}>
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(8, 12).map((product, index) => (
                <Grid item xs={12} sm={6} md={3} key={product._id || index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 200,
                        backgroundColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        backgroundImage: product.images?.[0]?.url ? `url(${product.images[0].url.startsWith('/') ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${product.images[0].url}` : product.images[0].url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!product.images?.[0]?.url && (
                        categoryMapping[product.category]?.icon || '🎨'
                      )}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {product.seller?.businessInfo?.businessName || product.seller?.name || 'Local Artisan'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="h6" color="primary">
                          ${product.price?.toFixed(2)}
                        </Typography>
                        {product.ratings?.count > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              ⭐ {product.ratings.average.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ({product.ratings.count})
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              // Placeholder products if no featured products
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card
                      sx={{
                        opacity: 0.6,
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate('/products')}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 200,
                          backgroundColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                        }}
                      >
                        🎨
                      </CardMedia>
                      <CardContent>
                        <Typography variant="h6">
                          Sample Product {i}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          Local Artisan
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          $25.00
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </>
            )}
          </Grid>
        )}

        <Box textAlign="center" sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/products')}
          >
            View All Products
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
