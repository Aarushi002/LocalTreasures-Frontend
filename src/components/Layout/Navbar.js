import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Chat as ChatIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

import { logout } from '../../store/slices/authSlice';
import { setSearchQuery, toggleMobileMenu, openCart } from '../../store/slices/uiSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useSelector((state) => state.auth);
  const { searchQuery, notificationCount } = useSelector((state) => state.ui);
  const { totalQuantity } = useSelector((state) => state.cart);
  const { totalItems = 0 } = useSelector((state) => state.wishlist || {});

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState(searchQuery);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      dispatch(setSearchQuery(searchValue));
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="fixed" 
      color="primary" 
      elevation={1}
      sx={{ zIndex: theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => dispatch(toggleMobileMenu())}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            cursor: 'pointer',
            fontWeight: 'bold',
            mr: 3,
            flexShrink: 0,
          }}
          onClick={() => navigate('/')}
        >
          Local Treasures
        </Typography>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, mr: 3 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              sx={{ 
                fontWeight: isActive('/') ? 600 : 400,
                textDecoration: isActive('/') ? 'underline' : 'none',
              }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/products')}
              sx={{ 
                fontWeight: isActive('/products') ? 600 : 400,
                textDecoration: isActive('/products') ? 'underline' : 'none',
              }}
            >
              Products
            </Button>
          </Box>
        )}

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, maxWidth: 400, mx: 2 }}>
          <TextField
            placeholder="Search local treasures..."
            value={searchValue}
            onChange={handleSearchChange}
            onKeyPress={handleSearch}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                color: 'white',
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Location Button */}
          <IconButton color="inherit" size="small">
            <LocationIcon />
          </IconButton>

          {user ? (
            <>
              {/* Notifications */}
              <IconButton color="inherit" size="small">
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Chat */}
              <IconButton 
                color="inherit" 
                size="small"
                onClick={() => navigate('/chat')}
              >
                <ChatIcon />
              </IconButton>

              {/* Wishlist - Only for buyers */}
              {user.role !== 'seller' && (
                <IconButton 
                  color="inherit" 
                  size="small"
                  onClick={() => navigate('/wishlist')}
                >
                  <Badge 
                    badgeContent={totalItems} 
                    color="error"
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -3,
                        top: -3,
                        fontSize: '0.75rem',
                        minWidth: '16px',
                        height: '16px',
                      },
                    }}
                  >
                    <FavoriteIcon />
                  </Badge>
                </IconButton>
              )}

              {/* Cart - Only for buyers */}
              {user.role !== 'seller' && (
                <IconButton 
                  color="inherit" 
                  size="small"
                  onClick={() => dispatch(openCart())}
                  sx={{ position: 'relative' }}
                >
                  <Badge 
                    badgeContent={totalQuantity} 
                    color="error"
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -3,
                        top: -3,
                        fontSize: '0.75rem',
                        minWidth: '16px',
                        height: '16px',
                      },
                    }}
                  >
                    <CartIcon />
                  </Badge>
                </IconButton>
              )}

              {/* User Role Badge */}
              {!isMobile && (
                <Box sx={{ mx: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: user.role === 'seller' ? 'success.main' : user.role === 'admin' ? 'error.main' : 'info.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      boxShadow: 1,
                    }}
                  >
                    {user.role}
                  </Typography>
                </Box>
              )}

              {/* User Menu */}
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                color="inherit"
              >
                {user.avatar?.url && 
                 !user.avatar.url.includes('avatar_default.png') && 
                 !user.avatar.url.includes('cloudinary.com/demo') ? (
                  <Avatar
                    src={user.avatar.url}
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info Header */}
                <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: user.role === 'seller' ? 'success.main' : user.role === 'admin' ? 'error.main' : 'info.main',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  >
                    {user.role} Account
                  </Typography>
                </Box>
                <MenuItem onClick={() => navigate('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </MenuItem>
                {user.role === 'seller' && (
                  <>
                    <MenuItem onClick={() => navigate('/products/add')}>
                      Add Product
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/dashboard/products')}>
                      My Products
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={() => navigate('/dashboard/orders')}>
                  Orders
                </MenuItem>
                <MenuItem onClick={() => navigate('/chat')}>
                  Messages
                </MenuItem>
                {user.role !== 'seller' && (
                  <MenuItem onClick={() => navigate('/wishlist')}>
                    Wishlist
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                variant="outlined"
                size="small"
                onClick={() => navigate('/login')}
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                  },
                }}
              >
                Login
              </Button>
              <Button
                color="secondary"
                variant="contained"
                size="small"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
