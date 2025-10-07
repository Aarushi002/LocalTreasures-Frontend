import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Inventory as InventoryIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import productService from '../../services/productService';
import uploadService from '../../services/uploadService';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]);
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

  const { register,control, watch, formState: { errors }, getValues, trigger } = useForm({
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
    'Review & Submit'
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

  // Check if user is a seller
  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateStep = async (step) => {
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
        if (images.length === 0) {
          validationResults.push('images');
        }
        break;
        
      case 2: // Specifications (optional, no validation needed)
        break;
        
      case 3: // Delivery & Pickup (optional, no validation needed)
        break;
        
      default:
        break;
    }
    
    return validationResults;
  };

  const handleNext = async () => {
    console.log('Next button clicked, current step:', activeStep);
    
    // Clear previous errors
    setError('');
    
    // Validate current step
    const stepErrors = await validateStep(activeStep);
    
    if (stepErrors.length > 0) {
      const fieldNames = {
        name: 'Product Name',
        description: 'Description',
        price: 'Price',
        category: 'Category',
        quantity: 'Quantity',
        images: 'Product Images'
      };
      
      const errorMessages = stepErrors.map(field => fieldNames[field] || field);
      setError(`Please complete the following required fields:\n• ${errorMessages.join('\n• ')}`);
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
          // Set default coordinates (San Francisco) if geolocation fails
          setLocation(prev => ({
            ...prev,
            coordinates: [-122.4194, 37.7749]
          }));
        }
      );
    } else {
      // Set default coordinates if geolocation is not supported
      setLocation(prev => ({
        ...prev,
        coordinates: [-122.4194, 37.7749]
      }));
    }
  };

  // Get current location on component mount
  React.useEffect(() => {
    getCurrentLocation();
  }, []);

  const getValidationErrors = () => {
    const errorMessages = [];
    
    // Check for form validation errors
    if (errors.name) errorMessages.push(`Name: ${errors.name.message}`);
    if (errors.description) errorMessages.push(`Description: ${errors.description.message}`);
    if (errors.price) errorMessages.push(`Price: ${errors.price.message}`);
    if (errors.category) errorMessages.push(`Category: ${errors.category.message}`);
    if (errors.quantity) errorMessages.push(`Quantity: ${errors.quantity.message}`);
    
    // Check for images
    if (images.length === 0) {
      errorMessages.push('At least one product image is required');
    }
    
    return errorMessages;
  };

  const handleCreateProduct = async () => {
    console.log('Create Product button clicked!');
    console.log('Current form values:', getValues());
    console.log('Form errors:', errors);
    
    // Clear previous errors
    setError('');
    
    // Trigger validation
    const isValid = await trigger();
    console.log('Form validation result:', isValid);
    
    // Get all validation errors
    const validationErrors = getValidationErrors();
    
    if (!isValid || validationErrors.length > 0) {
      console.log('Form validation failed:', errors);
      console.log('Validation errors:', validationErrors);
      
      if (validationErrors.length > 0) {
        setError(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
      } else {
        setError('Please fill in all required fields before submitting.');
      }
      return;
    }
    
    console.log('Form is valid, submitting...');
    const formData = getValues();
    onSubmit(formData);
  };

  const onSubmit = async (data) => {
    console.log('Form submit triggered with data:', data);
    
    if (images.length === 0) {
      setError('Please add at least one product image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload images first
      console.log('Uploading images...', images);
      const uploadResult = await uploadService.uploadProductImages(images);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      console.log('Images uploaded successfully:', uploadResult);
      console.log('Upload result data:', uploadResult.data);
      
      // Safely access the images array
      const imageData = uploadResult.data?.images;
      
      if (!imageData || !Array.isArray(imageData) || imageData.length === 0) {
        console.error('Invalid image data received:', imageData);
        throw new Error('No images returned from upload');
      }

      console.log('Image data extracted:', imageData);
      console.log('Location state:', location);
      console.log('Form data:', data);

      const productData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        subcategory: data.subcategory,
        images: imageData,
        availability: {
          inStock: data.inStock,
          quantity: Number(data.quantity),
        },
        specifications: {
          dimensions: {
            length: data.dimensions.length ? Number(data.dimensions.length) : undefined,
            width: data.dimensions.width ? Number(data.dimensions.width) : undefined,
            height: data.dimensions.height ? Number(data.dimensions.height) : undefined,
            unit: data.dimensions.unit,
          },
          weight: {
            value: data.weight.value ? Number(data.weight.value) : undefined,
            unit: data.weight.unit,
          },
          material: data.material,
          color: data.color,
          customizable: data.customizable,
        },
        delivery: {
          available: data.deliveryAvailable,
          radius: Number(data.deliveryRadius),
          fee: Number(data.deliveryFee),
          estimatedTime: {
            min: Number(data.estimatedDeliveryMin),
            max: Number(data.estimatedDeliveryMax),
          },
        },
        pickup: {
          available: data.pickupAvailable,
          location: {
            address: data.pickupAddress,
            instructions: data.pickupInstructions,
          },
        },
        location: {
          type: 'Point',
          coordinates: location.coordinates,
          address: {
            street: data.street || location.address.street || '123 Main St',
            city: data.city || location.address.city || 'San Francisco',
            state: data.state || location.address.state || 'CA',
            zipCode: data.zipCode || location.address.zipCode || '94102',
            country: data.country || location.address.country || 'USA'
          }
        },
        tags,
      };

      const result = await productService.createProduct(productData);
      
      if (result.success) {
        setSuccess('Product created successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create product';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors from express-validator
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
        }
        // Handle single error message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle generic error with details
        else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      // Handle network or other errors
      else if (error.message) {
        errorMessage = error.message;
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
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
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
                    Upload Images
                  </Button>
                </label>

                <Grid container spacing={2}>
                  {images.map((image, index) => (
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

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Business Location
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Street Address (Optional)"
                  {...register('street')}
                  placeholder="123 Main Street"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City (Optional)"
                  {...register('city')}
                  placeholder="San Francisco"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State (Optional)"
                  {...register('state')}
                  placeholder="CA"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code (Optional)"
                  {...register('zipCode')}
                  placeholder="94102"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country (Optional)"
                  {...register('country')}
                  placeholder="USA"
                  defaultValue="USA"
                />
              </Grid>
            </Grid>
            
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
              Review Your Product
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
                      Delivery & Pickup
                    </Typography>
                    <Typography>
                      Delivery: {formData.deliveryAvailable ? `Yes (${formData.deliveryRadius}km)` : 'No'}
                    </Typography>
                    <Typography>
                      Pickup: {formData.pickupAvailable ? 'Yes' : 'No'}
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

  if (!user || user.role !== 'seller') {
    console.log('User access check failed:', { user: user?.name, role: user?.role });
    return null;
  }

  console.log('AddProduct component rendered, current step:', activeStep);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Add New Product
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Fill in the details to list your product on Local Treasures
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ mb: 4, display: 'block' }}>
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
                      onClick={handleCreateProduct}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Creating Product...' : 'Create Product'}
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

export default AddProduct;
