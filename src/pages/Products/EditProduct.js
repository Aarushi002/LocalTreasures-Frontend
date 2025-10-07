import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Inventory as InventoryIcon,
  LocalShipping as DeliveryIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import productService from '../../services/productService';
import uploadService from '../../services/uploadService';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [location, setLocation] = useState({
    coordinates: [0, 0],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const { register, control, watch, formState: { errors }, getValues, trigger, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      quantity: 1,
      inStock: true,
      customizable: false,
      material: '',
      color: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      },
      weight: {
        value: '',
        unit: 'kg'
      },
      deliveryAvailable: true,
      deliveryRadius: 10,
      deliveryFee: 0,
      estimatedDeliveryMin: 24,
      estimatedDeliveryMax: 72,
      pickupAvailable: true,
      pickupAddress: '',
      pickupInstructions: '',
    },
  });

  const deliveryAvailable = watch('deliveryAvailable');
  const pickupAvailable = watch('pickupAvailable');

  const steps = [
    'Basic Information',
    'Product Details',
    'Specifications',
    'Delivery & Pickup',
    'Review & Update'
  ];

  const categories = [
    { value: 'handmade', label: '🎨 Handmade Crafts' },
    { value: 'food', label: '🍯 Food & Beverages' },
    { value: 'art', label: '🖼️ Art & Paintings' },
    { value: 'clothing', label: '👗 Clothing & Fashion' },
    { value: 'jewelry', label: '💍 Jewelry' },
    { value: 'home_decor', label: '🏠 Home Decor' },
    { value: 'other', label: '🔗 Other' },
  ];

  // Load product data on component mount
  useEffect(() => {
    console.log('EditProduct - Current user:', user);
    console.log('EditProduct - Product ID:', id);
    
    if (!user || user.role !== 'seller') {
      console.log('EditProduct - User not found or not a seller, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        const response = await productService.getProduct(id);
        const product = response.product;
        
        console.log('EditProduct - Product data:', product);
        console.log('EditProduct - Product seller ID:', product.seller._id);
        console.log('EditProduct - Current user ID:', user._id);
        console.log('EditProduct - IDs match:', product.seller._id === user._id);

        // Check if user owns this product
        if (product.seller._id !== user._id && user.role !== 'admin') {
          console.log('EditProduct - Authorization failed');
          setError('You are not authorized to edit this product');
          return;
        }

        // Populate form with product data
        reset({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          quantity: product.availability?.quantity || 1,
          inStock: product.availability?.inStock !== false,
          customizable: product.specifications?.customizable || false,
          material: product.specifications?.material || '',
          color: product.specifications?.color || '',
          dimensions: {
            length: product.specifications?.dimensions?.length || '',
            width: product.specifications?.dimensions?.width || '',
            height: product.specifications?.dimensions?.height || '',
            unit: product.specifications?.dimensions?.unit || 'cm'
          },
          weight: {
            value: product.specifications?.weight?.value || '',
            unit: product.specifications?.weight?.unit || 'kg'
          },
          deliveryAvailable: product.delivery?.available !== false,
          deliveryRadius: product.delivery?.radius || 10,
          deliveryFee: product.delivery?.fee || 0,
          estimatedDeliveryMin: product.delivery?.estimatedTime?.min || 24,
          estimatedDeliveryMax: product.delivery?.estimatedTime?.max || 72,
          pickupAvailable: product.pickup?.available !== false,
          pickupAddress: product.pickup?.location?.address || '',
          pickupInstructions: product.pickup?.location?.instructions || '',
        });

        // Set images and tags
        setExistingImages(product.images || []);
        setTags(product.tags || []);
        
        // Set location
        if (product.location) {
          setLocation({
            coordinates: product.location.coordinates || [0, 0],
            address: product.location.address || {}
          });
        }

      } catch (error) {
        console.error('Error loading product:', error);
        setError('Failed to load product data');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, user, navigate, reset]);

  const handleNext = async () => {
    const isValid = await validateStep(activeStep);
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = async (step) => {
    setError('');
    const validationResults = [];
    
    switch (step) {
      case 0: // Basic Information
        const step0Fields = ['name', 'description', 'price', 'category'];
        for (const field of step0Fields) {
          const result = await trigger(field);
          if (!result) validationResults.push(field);
        }
        break;
        
      case 1: // Product Details
        const step1Fields = ['quantity'];
        for (const field of step1Fields) {
          const result = await trigger(field);
          if (!result) validationResults.push(field);
        }
        if (existingImages.length === 0 && images.length === 0) {
          validationResults.push('images');
        }
        break;
        
      default:
        break;
    }
    
    if (validationResults.length > 0) {
      const fieldNames = {
        name: 'Product Name',
        description: 'Description',
        price: 'Price',
        category: 'Category',
        quantity: 'Quantity',
        images: 'Product Images'
      };
      
      const errorMessages = validationResults.map(field => fieldNames[field] || field);
      setError(`Please complete the following required fields:\n• ${errorMessages.join('\n• ')}`);
      return false;
    }
    
    return true;
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          url: e.target.result,
          public_id: `temp_${Date.now()}_${Math.random()}`
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            coordinates: [position.coords.longitude, position.coords.latitude]
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleUpdateProduct = async () => {
    setLoading(true);
    setError('');

    try {
      // Upload new images if any
      let newImageData = [];
      if (images.length > 0) {
        const uploadResult = await uploadService.uploadProductImages(images);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
        newImageData = uploadResult.data?.images || [];
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageData];

      const formData = getValues();
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        images: allImages,
        availability: {
          inStock: formData.inStock,
          quantity: Number(formData.quantity),
        },
        specifications: {
          dimensions: {
            length: formData.dimensions.length ? Number(formData.dimensions.length) : undefined,
            width: formData.dimensions.width ? Number(formData.dimensions.width) : undefined,
            height: formData.dimensions.height ? Number(formData.dimensions.height) : undefined,
            unit: formData.dimensions.unit,
          },
          weight: {
            value: formData.weight.value ? Number(formData.weight.value) : undefined,
            unit: formData.weight.unit,
          },
          material: formData.material,
          color: formData.color,
          customizable: formData.customizable,
        },
        delivery: {
          available: formData.deliveryAvailable,
          radius: Number(formData.deliveryRadius),
          fee: Number(formData.deliveryFee),
          estimatedTime: {
            min: Number(formData.estimatedDeliveryMin),
            max: Number(formData.estimatedDeliveryMax),
          },
        },
        pickup: {
          available: formData.pickupAvailable,
          location: {
            address: formData.pickupAddress,
            instructions: formData.pickupInstructions,
          },
        },
        location: {
          type: 'Point',
          coordinates: location.coordinates,
          address: location.address
        },
        tags,
      };

      const result = await productService.updateProduct(id, productData);
      
      if (result.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      
      let errorMessage = 'Failed to update product';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationMessages = errorData.errors.map(err => {
            if (err.param && err.msg) {
              return `${err.param}: ${err.msg}`;
            } else if (err.message) {
              return err.message;
            }
            return err.msg || 'Validation error';
          });
          errorMessage = `Validation failed:\n• ${validationMessages.join('\n• ')}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              margin="normal"
              label="Product Name *"
              {...register('name', {
                required: 'Product name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InventoryIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Product Description *"
              multiline
              rows={4}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' },
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Price *"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' },
                  })}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PriceIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category *</InputLabel>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Category *"
                        error={!!errors.category}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                      {errors.category.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              margin="normal"
              label="Subcategory (Optional)"
              {...register('subcategory')}
              placeholder="e.g., Wooden crafts, Oil paintings, etc."
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Product Images *
            </Typography>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Images
                </Typography>
                <Grid container spacing={2}>
                  {existingImages.map((image, index) => (
                    <Grid item xs={6} md={3} key={index}>
                      <Card>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(255,255,255,0.8)',
                            }}
                            size="small"
                            onClick={() => removeExistingImage(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Upload New Images */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Add New Images
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload New Images
                  </Button>
                </label>

                <Grid container spacing={2}>
                  {images.map((image, index) => (
                    <Grid item xs={6} md={3} key={index}>
                      <Card>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={image.url}
                            alt={`New ${index + 1}`}
                            style={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(255,255,255,0.8)',
                            }}
                            size="small"
                            onClick={() => removeImage(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quantity *"
                  type="number"
                  inputProps={{ min: 0 }}
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity cannot be negative' },
                  })}
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Controller
                      name="inStock"
                      control={control}
                      render={({ field }) => (
                        <Switch {...field} checked={field.value} />
                      )}
                    />
                  }
                  label="In Stock"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Tags
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Add Tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={addTag}>
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="e.g., handmade, unique, gift"
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Product Specifications
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Material (Optional)"
                  {...register('material')}
                  placeholder="e.g., Wood, Cotton, Silver"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Color (Optional)"
                  {...register('color')}
                  placeholder="e.g., Blue, Natural, Mixed"
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Dimensions (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Length"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  {...register('dimensions.length')}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Width"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  {...register('dimensions.width')}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Height"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  {...register('dimensions.height')}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Controller
                    name="dimensions.unit"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Unit">
                        <MenuItem value="cm">cm</MenuItem>
                        <MenuItem value="inch">inch</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Weight (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Weight"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  {...register('weight.value')}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Controller
                    name="weight.unit"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Unit">
                        <MenuItem value="g">g</MenuItem>
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="lb">lb</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Controller
                  name="customizable"
                  control={control}
                  render={({ field }) => (
                    <Switch {...field} checked={field.value} />
                  )}
                />
              }
              label="This product can be customized"
              sx={{ mt: 2 }}
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Delivery Options
            </Typography>

            <FormControlLabel
              control={
                <Controller
                  name="deliveryAvailable"
                  control={control}
                  render={({ field }) => (
                    <Switch {...field} checked={field.value} />
                  )}
                />
              }
              label="Delivery Available"
              sx={{ mb: 2 }}
            />

            {deliveryAvailable && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Delivery Radius (km)"
                    type="number"
                    inputProps={{ min: 1, max: 50 }}
                    {...register('deliveryRadius')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DeliveryIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Delivery Fee"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    {...register('deliveryFee')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PriceIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Min Hours"
                        type="number"
                        inputProps={{ min: 1 }}
                        {...register('estimatedDeliveryMin')}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Hours"
                        type="number"
                        inputProps={{ min: 1 }}
                        {...register('estimatedDeliveryMax')}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Pickup Options
            </Typography>

            <FormControlLabel
              control={
                <Controller
                  name="pickupAvailable"
                  control={control}
                  render={({ field }) => (
                    <Switch {...field} checked={field.value} />
                  )}
                />
              }
              label="Pickup Available"
              sx={{ mb: 2 }}
            />

            {pickupAvailable && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pickup Address (Optional)"
                    {...register('pickupAddress')}
                    placeholder="If different from your business address"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pickup Instructions (Optional)"
                    multiline
                    rows={2}
                    {...register('pickupInstructions')}
                    placeholder="Special instructions for pickup"
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Current coordinates: {location.coordinates[1]?.toFixed(4) || 0}, {location.coordinates[0]?.toFixed(4) || 0}
              </Typography>
              <Button 
                size="small" 
                onClick={getCurrentLocation}
                variant="outlined"
              >
                Update Location
              </Button>
            </Box>
          </Box>
        );

      case 4:
        const formData = getValues();
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Changes
            </Typography>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{formData.name}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  {categories.find(c => c.value === formData.category)?.label}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {formData.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${formData.price}
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Availability
                    </Typography>
                    <Typography>Quantity: {formData.quantity}</Typography>
                    <Typography>In Stock: {formData.inStock ? 'Yes' : 'No'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Images
                    </Typography>
                    <Typography>
                      Current: {existingImages.length}, New: {images.length}
                    </Typography>
                    <Typography>
                      Total: {existingImages.length + images.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {tags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loadingProduct) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading product...
        </Typography>
      </Container>
    );
  }

  if (!user || user.role !== 'seller') {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          onClick={() => navigate('/dashboard')}
          sx={{ cursor: 'pointer' }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Edit Product</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Edit Product
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Update your product information
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: 'block' }}>
          Fields marked with * are required
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
                
                <Box sx={{ mt: 3 }}>
                  {index === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleUpdateProduct}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Updating Product...' : 'Update Product'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                  )}
                  {index > 0 && (
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default EditProduct;
