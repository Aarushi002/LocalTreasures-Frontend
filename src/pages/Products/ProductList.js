import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { getProducts, updateFilters, resetFilters } from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import WishlistButton from '../../components/Common/WishlistButton';
import ProductImage from '../../components/Common/ProductImage';

const ProductList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  const { 
    products, 
    isLoading, 
    isError, 
    message, 
    filters, 
    pagination 
  } = useSelector((state) => state.products);
  
  const { user } = useSelector((state) => state.auth);
  const { userLocation } = useSelector((state) => state.ui);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchInput, setSearchInput] = useState('');

  // Initialize search input once
  useEffect(() => {
    setSearchInput(filters.search || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Initialize filters from URL parameters - this effect runs first
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    
    if (categoryFromUrl || searchFromUrl) {
      const urlFilters = {};
      let needsUpdate = false;
      
      if (categoryFromUrl && categoryFromUrl !== filters.category) {
        urlFilters.category = categoryFromUrl;
        needsUpdate = true;
      }
      
      if (searchFromUrl && searchFromUrl !== filters.search) {
        urlFilters.search = searchFromUrl;
        setSearchInput(searchFromUrl);
        needsUpdate = true;
      }
      
      // Only update if there are actual filter changes
      if (needsUpdate) {
        dispatch(updateFilters(urlFilters));
      }
    } else {
      // If no URL params but filters have category/search, clear them
      if (filters.category || filters.search) {
        dispatch(updateFilters({ category: '', search: '' }));
        setSearchInput('');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Create a stable debounced search function using useMemo
  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => {
      dispatch(updateFilters({ search: searchTerm }));
    }, 300),
    [dispatch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Load products on component mount and when filters change
  useEffect(() => {    
    const params = {
      page: searchParams.get('page') || 1,
      limit: 12,
    };

    // Priority: URL parameters override stored filters
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    
    // Add URL parameters first (they take priority)
    if (categoryFromUrl) {
      params.category = categoryFromUrl;
    }
    if (searchFromUrl) {
      params.search = searchFromUrl;
    }

    // Add all other filters to params (excluding category and search if they came from URL)
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        // Skip category and search if they came from URL
        if ((key === 'category' && categoryFromUrl) || (key === 'search' && searchFromUrl)) {
          return;
        }
        
        if (key === 'priceRange' && Array.isArray(filters[key])) {
          params.minPrice = filters[key][0];
          params.maxPrice = filters[key][1];
        } else {
          params[key] = filters[key];
        }
      }
    });

    // Add remaining filters if not overridden by URL
    if (!categoryFromUrl && filters.category) {
      params.category = filters.category;
    }
    if (!searchFromUrl && filters.search) {
      params.search = filters.search;
    }

    // Add location-based search if user location is available
    if (userLocation) {
      params.latitude = userLocation.latitude;
      params.longitude = userLocation.longitude;
      params.radius = filters.radius ? filters.radius * 1000 : 10000; // Convert km to meters
    }

    dispatch(getProducts(params));
  }, [dispatch, filters, searchParams, userLocation]);

  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setSearchInput(searchValue); // Update local state immediately for UI responsiveness
    debouncedSearch(searchValue); // Debounced update to Redux store
  };

  const handleCategoryChange = (event) => {
    dispatch(updateFilters({ category: event.target.value }));
  };

  const handleSortChange = (event) => {
    dispatch(updateFilters({ sort: event.target.value }));
  };

  const handlePriceRangeChange = (event, newValue) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: newValue
    }));
  };

  const handleDistanceChange = (event, newValue) => {
    setLocalFilters(prev => ({
      ...prev,
      radius: newValue
    }));
  };

  const handleRatingFilterChange = (event, newValue) => {
    setLocalFilters(prev => ({
      ...prev,
      minRating: newValue
    }));
  };

  const applyFilters = () => {
    dispatch(updateFilters(localFilters));
    setFilterDialogOpen(false);
  };

  const clearFilters = () => {
    setSearchInput(''); // Clear search input immediately
    dispatch(resetFilters());
    setLocalFilters({
      search: '',
      category: '',
      subcategory: '',
      priceRange: [0, 1000],
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      location: null,
      radius: 10,
      sort: 'newest',
      inStockOnly: false,
      freeDelivery: false,
      tags: '',
    });
    setFilterDialogOpen(false);
  };

  const handlePageChange = (event, page) => {
    navigate(`/products?page=${page}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search && filters.search.trim() !== '') count++;
    if (filters.category && filters.category !== '') count++;
    if (filters.priceRange && (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000)) count++;
    if (filters.minRating && filters.minRating > 0) count++;
    if (filters.inStockOnly) count++;
    if (filters.freeDelivery) count++;
    return count;
  };

  // Render active filters summary
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.search && filters.search.trim() !== '') {
      activeFilters.push({ key: 'search', label: `Search: "${filters.search}"` });
    }
    if (filters.category && filters.category !== '') {
      activeFilters.push({ key: 'category', label: `Category: ${filters.category}` });
    }
    if (filters.priceRange && (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000)) {
      activeFilters.push({ 
        key: 'price', 
        label: `Price: $${filters.priceRange[0]} - $${filters.priceRange[1]}` 
      });
    }
    if (filters.minRating && filters.minRating > 0) {
      activeFilters.push({ key: 'rating', label: `Rating: ${filters.minRating}+ stars` });
    }
    if (filters.inStockOnly) {
      activeFilters.push({ key: 'stock', label: 'In Stock Only' });
    }
    if (filters.freeDelivery) {
      activeFilters.push({ key: 'delivery', label: 'Free Delivery' });
    }

    return activeFilters;
  };

  if (isLoading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Local Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover amazing products from local artisans and businesses near you
        </Typography>
      </Box>

        {/* Search and Filters Bar */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              key="search-input"
              fullWidth
              placeholder="Search products..."
              value={searchInput}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category || ''}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="handmade">Handmade</MenuItem>
                <MenuItem value="food">Food & Beverages</MenuItem>
                <MenuItem value="art">Art</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="jewelry">Jewelry</MenuItem>
                <MenuItem value="home_decor">Home Decor</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort || 'newest'}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="distance">Nearest First</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDialogOpen(true)}
              color={getActiveFiltersCount() > 0 ? "primary" : "inherit"}
            >
              Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Button>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {renderActiveFilters().length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            {renderActiveFilters().map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                onDelete={() => {
                  if (filter.key === 'search') {
                    setSearchInput('');
                    dispatch(updateFilters({ search: '' }));
                  } else if (filter.key === 'category') {
                    dispatch(updateFilters({ category: '' }));
                  } else if (filter.key === 'price') {
                    dispatch(updateFilters({ priceRange: [0, 1000] }));
                  } else if (filter.key === 'rating') {
                    dispatch(updateFilters({ minRating: 0 }));
                  } else if (filter.key === 'stock') {
                    dispatch(updateFilters({ inStockOnly: false }));
                  } else if (filter.key === 'delivery') {
                    dispatch(updateFilters({ freeDelivery: false }));
                  }
                }}
                size="small"
                variant="outlined"
              />
            ))}
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ ml: 1 }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Box>

      {/* Error Message */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message || 'Failed to load products. Please try again.'}
        </Alert>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => handleProductClick(product._id)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <ProductImage
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      category={product.category}
                      index={0}
                      sx={{ height: 200 }}
                    />
                    
                    {/* Wishlist Button */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WishlistButton 
                        product={product} 
                        size="small"
                      />
                    </Box>

                    {/* Distance Badge */}
                    {product.distance && (
                      <Chip
                        label={`${product.distance.toFixed(1)} km`}
                        size="small"
                        icon={<LocationIcon />}
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="primary">
                        ${product.price}
                      </Typography>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <Typography
                          variant="body2"
                          sx={{
                            ml: 1,
                            textDecoration: 'line-through',
                            color: 'text.disabled',
                          }}
                        >
                          ${product.originalPrice}
                        </Typography>
                      )}
                    </Box>

                    {/* Rating */}
                    {product.ratings && product.ratings.count > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon color="warning" fontSize="small" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {product.ratings.average.toFixed(1)} ({product.ratings.count})
                        </Typography>
                      </Box>
                    )}

                    {/* Seller Info */}
                    <Typography variant="caption" color="text.secondary">
                      by {product.seller?.businessInfo?.businessName || product.seller?.name}
                    </Typography>

                    {/* Stock Status */}
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={product.availability?.inStock ? 'In Stock' : 'Out of Stock'}
                        size="small"
                        color={product.availability?.inStock ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : !isLoading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No products found
          </Typography>
          {getActiveFiltersCount() > 0 ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                No products match your current filters. Try adjusting your search criteria.
              </Typography>
              <Button variant="contained" onClick={clearFilters} sx={{ mb: 2 }}>
                Clear All Filters
              </Button>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              There are no products available at the moment. Check back later!
            </Typography>
          )}
          
          {userLocation && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Searching within {filters.radius || 10} km of your location
            </Typography>
          )}
        </Box>
      ) : null}

      {/* Add Product FAB (for sellers) */}
      {user?.role === 'seller' && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/products/add')}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Advanced Filters Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Advanced Filters
            <IconButton onClick={() => setFilterDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Price Range */}
            <Typography gutterBottom variant="h6">
              Price Range
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ${localFilters.priceRange?.[0] || 0} - ${localFilters.priceRange?.[1] || 1000}
            </Typography>
            <Slider
              value={localFilters.priceRange || [0, 1000]}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={10}
              sx={{ mb: 3 }}
            />

            {/* Subcategory */}
            <TextField
              fullWidth
              label="Subcategory"
              value={localFilters.subcategory || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, subcategory: e.target.value }))}
              placeholder="e.g., pottery, organic, vintage..."
              sx={{ mb: 3 }}
            />

            {/* Minimum Rating */}
            <Typography gutterBottom variant="h6">
              Minimum Rating
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {localFilters.minRating || 0} stars and above
            </Typography>
            <Slider
              value={localFilters.minRating || 0}
              onChange={handleRatingFilterChange}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: 'Any' },
                { value: 1, label: '1+' },
                { value: 2, label: '2+' },
                { value: 3, label: '3+' },
                { value: 4, label: '4+' },
                { value: 5, label: '5' },
              ]}
              sx={{ mb: 3 }}
            />

            {/* Distance */}
            {userLocation && (
              <>
                <Typography gutterBottom variant="h6">
                  Search Radius
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Within {localFilters.radius || 10} km of your location
                </Typography>
                <Slider
                  value={localFilters.radius || 10}
                  onChange={handleDistanceChange}
                  valueLabelDisplay="auto"
                  min={1}
                  max={50}
                  marks={[
                    { value: 1, label: '1km' },
                    { value: 10, label: '10km' },
                    { value: 25, label: '25km' },
                    { value: 50, label: '50km' },
                  ]}
                  sx={{ mb: 3 }}
                />
              </>
            )}

            {/* Toggle Filters */}
            <Typography gutterBottom variant="h6">
              Additional Filters
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={localFilters.inStockOnly || false}
                  onChange={(e) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      inStockOnly: e.target.checked
                    }))
                  }
                />
              }
              label="Show in-stock items only"
              sx={{ mb: 1, display: 'block' }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={localFilters.freeDelivery || false}
                  onChange={(e) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      freeDelivery: e.target.checked
                    }))
                  }
                />
              }
              label="Free delivery only"
              sx={{ mb: 3, display: 'block' }}
            />

            {/* Apply Filters Button */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && products.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default ProductList;
