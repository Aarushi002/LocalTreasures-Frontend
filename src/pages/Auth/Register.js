import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { register as registerUser, clearError } from '../../store/slices/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoading, isError, message, validationErrors } = useSelector((state) => state.auth);
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      role: 'buyer',
      businessCategory: '',
    },
  });
  
  const role = watch('role');

  // Clear errors when component unmounts or user starts typing
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    // For demo purposes, we'll use a default location
    const userData = {
      ...data,
      location: {
        longitude: -122.4194, // San Francisco coordinates
        latitude: 37.7749,
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
      },
    };

    if (role === 'seller' && data.businessName) {
      // Map business category to both type and category for backend compatibility
      const categoryMapping = {
        'handmade_crafts': { type: 'artisan', category: 'handmade' },
        'food_beverages': { type: 'home_chef', category: 'food' },
        'art_paintings': { type: 'artisan', category: 'art' },
        'clothing_fashion': { type: 'small_business', category: 'clothing' },
        'jewelry': { type: 'artisan', category: 'jewelry' },
        'home_decor': { type: 'artisan', category: 'home_decor' },
        'beauty_wellness': { type: 'small_business', category: 'other' },
        'services': { type: 'small_business', category: 'other' },
        'technology': { type: 'small_business', category: 'other' },
        'books_media': { type: 'small_business', category: 'other' },
        'other': { type: 'other', category: 'other' },
      };

      const mapping = categoryMapping[data.businessCategory] || { type: 'other', category: 'other' };
      
      userData.businessInfo = {
        businessName: data.businessName,
        businessType: mapping.type,
        description: data.businessDescription,
        categories: [mapping.category],
      };
    }

    const result = await dispatch(registerUser(userData));
    if (result.type === 'auth/register/fulfilled') {
      navigate('/dashboard');
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography component="h1" variant="h4" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join the Local Treasures community
          </Typography>
        </Box>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
            {validationErrors.general && (
              <Box component="div" sx={{ mt: 1 }}>
                {validationErrors.general}
              </Box>
            )}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            error={!!errors.name || !!validationErrors.name}
            helperText={errors.name?.message || validationErrors.name}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email',
              },
            })}
            error={!!errors.email || !!validationErrors.email}
            helperText={errors.email?.message || validationErrors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
              },
            })}
            error={!!errors.password || !!validationErrors.password}
            helperText={
              errors.password?.message || 
              validationErrors.password || 
              'Password must contain at least one lowercase letter, one uppercase letter, and one number'
            }
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="phone"
            label="Phone Number"
            type="tel"
            id="phone"
            autoComplete="tel"
            {...register('phone', {
              required: 'Phone number is required',
            })}
            error={!!errors.phone || !!validationErrors.phone}
            helperText={errors.phone?.message || validationErrors.phone}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">I am a</InputLabel>
            <Controller
              name="role"
              control={control}
              defaultValue="buyer"
              rules={{ required: 'Please select your role' }}
              render={({ field }) => (
                <Select
                  labelId="role-label"
                  label="I am a"
                  {...field}
                  value={field.value || 'buyer'}
                  error={!!errors.role}
                >
                  <MenuItem value="buyer">Buyer</MenuItem>
                  <MenuItem value="seller">Seller/Artisan</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          {role === 'seller' && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                name="businessName"
                label="Business Name"
                {...register('businessName', {
                  required: role === 'seller' ? 'Business name is required for sellers' : false,
                })}
                error={!!errors.businessName}
                helperText={errors.businessName?.message}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="business-category-label">Business Category</InputLabel>
                <Controller
                  name="businessCategory"
                  control={control}
                  defaultValue=""
                  rules={{ required: role === 'seller' ? 'Business category is required for sellers' : false }}
                  render={({ field }) => (
                    <Select
                      labelId="business-category-label"
                      label="Business Category"
                      {...field}
                      value={field.value || ''}
                      error={!!errors.businessCategory}
                    >
                      <MenuItem value="handmade_crafts">🎨 Handmade Crafts & Artisan Work</MenuItem>
                      <MenuItem value="food_beverages">🍯 Food & Beverages (Home Chef)</MenuItem>
                      <MenuItem value="art_paintings">🖼️ Art & Paintings</MenuItem>
                      <MenuItem value="clothing_fashion">👗 Clothing & Fashion</MenuItem>
                      <MenuItem value="jewelry">💍 Jewelry & Accessories</MenuItem>
                      <MenuItem value="home_decor">🏠 Home Decor & Furnishing</MenuItem>
                      <MenuItem value="beauty_wellness">💄 Beauty & Wellness Products</MenuItem>
                      <MenuItem value="services">🔧 Local Services</MenuItem>
                      <MenuItem value="technology">📱 Technology & Electronics</MenuItem>
                      <MenuItem value="books_media">📚 Books & Media</MenuItem>
                      <MenuItem value="other">🔗 Other</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>

              <TextField
                margin="normal"
                fullWidth
                name="businessDescription"
                label="Business Description"
                multiline
                rows={3}
                {...register('businessDescription')}
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Create Account'
            )}
          </Button>
          
          <Box textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'inherit' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
