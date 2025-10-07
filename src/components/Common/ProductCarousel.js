import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProductCarousel = ({ products = [], title = "Featured Products", heroMode = false }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [products.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Category icon mapping
  const categoryMapping = {
    handmade: { icon: '🎨' },
    food: { icon: '🍯' },
    art: { icon: '🖼️' },
    clothing: { icon: '👗' },
    jewelry: { icon: '💎' },
    home_decor: { icon: '🏺' },
    other: { icon: '🛍️' },
  };

  if (!products || products.length === 0) {
    return (
      <Card
        sx={{
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No products available
        </Typography>
      </Card>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Title */}
      <Typography
        variant="h5"
        component="h3"
        gutterBottom
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          color: heroMode ? 'white' : 'inherit',
          textAlign: 'center',
          fontSize: heroMode ? '1.4rem' : '1.25rem',
          textShadow: heroMode ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </Typography>

      {/* Carousel Card */}
      <Card
        sx={{
          height: 450,
          position: 'relative',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: heroMode ? 'scale(1.03) rotateY(2deg)' : 'scale(1.02)',
            boxShadow: heroMode ? 
              '0 15px 35px rgba(255, 255, 255, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)' : 
              '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
          overflow: 'hidden',
          backgroundColor: heroMode ? 'rgba(255, 255, 255, 0.98)' : 'white',
          backdropFilter: heroMode ? 'blur(15px)' : 'none',
          borderRadius: heroMode ? 3 : 2,
          border: heroMode ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
          boxShadow: heroMode ? 
            '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(255, 255, 255, 0.1)' : 
            '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => handleProductClick(currentProduct._id)}
      >
        {/* Product Image */}
        <CardMedia
          component="div"
          sx={{
            height: 280,
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            backgroundImage: currentProduct.images?.[0]?.url ? 
              `url(${currentProduct.images[0].url.startsWith('/') ? 
                `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${currentProduct.images[0].url}` : 
                currentProduct.images[0].url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            '&::before': heroMode ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, transparent 0%, transparent 70%, rgba(0,0,0,0.3) 100%)',
              zIndex: 1,
            } : {},
          }}
        >
          {!currentProduct.images?.[0]?.url && (
            categoryMapping[currentProduct.category]?.icon || '🎨'
          )}

          {/* Navigation Arrows */}
          {products.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                  zIndex: 2,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                  zIndex: 2,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}

          {/* Featured Badge */}
          {currentProduct.isFeatured && (
            <Chip
              label="⭐ Featured"
              color="secondary"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontWeight: 'bold',
                backgroundColor: '#FF6B35',
                color: 'white',
                zIndex: 2,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            />
          )}
        </CardMedia>

        {/* Product Information */}
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            noWrap 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              fontSize: '1.1rem',
              color: heroMode ? '#2E7D32' : 'inherit',
            }}
          >
            {currentProduct.name}
          </Typography>
          
          <Typography 
            color="text.secondary" 
            variant="body2"
            sx={{ 
              mb: 2,
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            by {currentProduct.seller?.businessInfo?.businessName || 
                 currentProduct.seller?.name || 
                 'Local Artisan'}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.3rem',
                color: heroMode ? '#FF6B35' : 'primary.main',
              }}
            >
              ${currentProduct.price?.toFixed(2)}
            </Typography>
            
            {currentProduct.ratings?.count > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ color: '#FFD700', fontSize: '1.1rem' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                  {currentProduct.ratings.average.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({currentProduct.ratings.count})
                </Typography>
              </Box>
            )}
          </Box>

          {/* Dots Indicator */}
          {products.length > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 1,
              mt: 2
            }}>
              {products.map((_, index) => (
                <Box
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index === currentIndex ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: index === currentIndex ? 'primary.main' : 'grey.400',
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Product Counter */}
      <Typography
        variant="body2"
        color={heroMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'}
        sx={{ 
          textAlign: 'center', 
          mt: 1,
          fontSize: '0.75rem'
        }}
      >
        {currentIndex + 1} of {products.length}
      </Typography>
    </Box>
  );
};

export default ProductCarousel;