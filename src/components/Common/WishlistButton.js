import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { 
  Favorite as FavoriteIcon, 
  FavoriteBorder as FavoriteBorderIcon 
} from '@mui/icons-material';

import { 
  addToWishlist, 
  removeFromWishlist
} from '../../store/slices/wishlistSlice';
import { addNotification } from '../../store/slices/notificationSlice';

const WishlistButton = ({ 
  product, 
  size = 'medium', 
  color = 'default',
  variant = 'icon' // 'icon' or 'button'
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items = [], isLoading = false } = useSelector((state) => state.wishlist || {});
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (user && items) {
      setIsInWishlist(items.some(item => item._id === product._id));
    }
  }, [items, product._id, user]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (!user) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please log in to add items to your wishlist',
      }));
      return;
    }

    if (product.seller._id === user.id) {
      dispatch(addNotification({
        type: 'error',
        message: 'You cannot add your own product to wishlist',
      }));
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Removed from wishlist',
        }));
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Added to wishlist',
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Something went wrong',
      }));
    }
  };

  if (!user) {
    return (
      <Tooltip title="Login to add to wishlist">
        <IconButton 
          onClick={handleWishlistToggle}
          size={size}
          color={color}
          disabled={isLoading}
        >
          <FavoriteBorderIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
      <IconButton 
        onClick={handleWishlistToggle}
        size={size}
        color={isInWishlist ? 'error' : color}
        disabled={isLoading}
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default WishlistButton;
