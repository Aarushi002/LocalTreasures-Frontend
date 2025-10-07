import React, { useState } from 'react';
import { Box } from '@mui/material';

const ProductImage = ({ 
  src, 
  alt, 
  fallbackSrc, 
  category = 'other', 
  index = 0, 
  sx = {}, 
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback images for different categories
  const getFallbackImage = (cat, idx) => {
    const fallbackImages = {
      handmade: `https://picsum.photos/400/400?random=${100 + idx}`,
      food: `https://picsum.photos/400/400?random=${200 + idx}`, 
      art: `https://picsum.photos/400/400?random=${300 + idx}`,
      clothing: `https://picsum.photos/400/400?random=${400 + idx}`,
      jewelry: `https://picsum.photos/400/400?random=${500 + idx}`,
      home_decor: `https://picsum.photos/400/400?random=${600 + idx}`,
      other: `https://picsum.photos/400/400?random=${700 + idx}`
    };
    return fallbackImages[cat] || fallbackImages.other;
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const imageSrc = hasError 
    ? (fallbackSrc || getFallbackImage(category, index))
    : src || getFallbackImage(category, index);

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      {/* Loading placeholder */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isLoading ? 'none' : 'block',
        }}
        {...props}
      />
    </Box>
  );
};

export default ProductImage;
