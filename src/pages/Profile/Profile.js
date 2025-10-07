import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Verified as VerifiedIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

import { updateProfile, changePassword } from '../../store/slices/authSlice';
import GoogleMap from '../../components/Common/GoogleMap';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isError, message } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'buyer',
      businessInfo: {
        businessName: user?.businessInfo?.businessName || '',
        businessType: user?.businessInfo?.businessType || '',
        description: user?.businessInfo?.description || '',
        categories: user?.businessInfo?.categories || [],
      },
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessInfo: {
          businessName: user.businessInfo?.businessName || '',
          businessType: user.businessInfo?.businessType || '',
          description: user.businessInfo?.description || '',
          categories: user.businessInfo?.categories || [],
        },
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      // Exclude role from the update data as users cannot change their role
      const { role, ...updateData } = data;
      await dispatch(updateProfile(updateData)).unwrap();
      setEditMode(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await dispatch(changePassword(data)).unwrap();
      setPasswordDialogOpen(false);
      resetPassword();
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleCancel = () => {
    reset();
    setEditMode(false);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{ width: 80, height: 80 }}
              src={user?.avatar?.url && 
                   !user.avatar.url.includes('avatar_default.png') && 
                   !user.avatar.url.includes('cloudinary.com/demo') ? 
                   user.avatar.url : undefined}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 32,
                height: 32,
              }}
              onClick={() => setAvatarDialogOpen(true)}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h4">
                {user?.businessInfo?.businessName || user?.name}
              </Typography>
              {user?.isVerified && (
                <VerifiedIcon color="primary" />
              )}
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {user?.role === 'seller' ? 'Seller' : 'Buyer'} • Member since {new Date(user?.createdAt).toLocaleDateString()}
            </Typography>
            
            {user?.businessInfo?.businessType && (
              <Chip 
                label={user.businessInfo.businessType.replace('_', ' ')} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Button
            variant={editMode ? 'outlined' : 'contained'}
            startIcon={editMode ? <CancelIcon /> : <EditIcon />}
            onClick={editMode ? handleCancel : () => setEditMode(true)}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Tabs */}
      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PersonIcon />} label="Personal Info" />
          {user?.role === 'seller' && (
            <Tab icon={<BusinessIcon />} label="Business Info" />
          )}
          <Tab icon={<LocationIcon />} label="Location" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Preferences" />
        </Tabs>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 2 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('name', { required: 'Name is required' })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={!editMode}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phone', { required: 'Phone number is required' })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  disabled={!editMode}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled>
                  <InputLabel>Role</InputLabel>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Role">
                        <MenuItem value="buyer">Buyer</MenuItem>
                        <MenuItem value="seller">Seller</MenuItem>
                      </Select>
                    )}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Role cannot be changed. Contact support if you need to upgrade your account.
                  </Typography>
                </FormControl>
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isLoading}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
          </Box>
        </TabPanel>

        {/* Business Information Tab (Sellers only) */}
        {user?.role === 'seller' && (
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 2 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    {...register('businessInfo.businessName')}
                    error={!!errors.businessInfo?.businessName}
                    helperText={errors.businessInfo?.businessName?.message}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Business Type</InputLabel>
                    <Controller
                      name="businessInfo.businessType"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} label="Business Type">
                          <MenuItem value="artisan">Artisan</MenuItem>
                          <MenuItem value="home_chef">Home Chef</MenuItem>
                          <MenuItem value="small_business">Small Business</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Description"
                    multiline
                    rows={4}
                    {...register('businessInfo.description')}
                    disabled={!editMode}
                    placeholder="Tell customers about your business..."
                  />
                </Grid>

                {editMode && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={isLoading}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </form>

            <Divider sx={{ my: 3 }} />

            {/* Business Stats */}
            <Typography variant="h6" gutterBottom>
              Business Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StoreIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">12</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Products Listed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PersonIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">48</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Customers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            </Box>
          </TabPanel>
        )}

        {/* Location Tab */}
        <TabPanel value={tabValue} index={user?.role === 'seller' ? 2 : 1}>
          <Box sx={{ px: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Location
            </Typography>
          
          {user?.location && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Address:
                </Typography>
                <Typography variant="body1">
                  {user.location.address?.street && `${user.location.address.street}, `}
                  {user.location.address?.city && `${user.location.address.city}, `}
                  {user.location.address?.state && `${user.location.address.state} `}
                  {user.location.address?.zipCode}
                </Typography>
              </Box>

              <GoogleMap
                center={{
                  lat: user.location.coordinates[1],
                  lng: user.location.coordinates[0],
                }}
                markers={[
                  {
                    position: {
                      lat: user.location.coordinates[1],
                      lng: user.location.coordinates[0],
                    },
                    title: user.businessInfo?.businessName || user.name,
                  },
                ]}
                height="300px"
              />
            </>
          )}

          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" startIcon={<LocationIcon />}>
              Update Location
            </Button>
          </Box>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={user?.role === 'seller' ? 3 : 2}>
          <Box sx={{ px: 2 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Password"
                secondary="Last changed 30 days ago"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email Verification"
                secondary={user?.isEmailVerified ? "Verified" : "Not verified"}
              />
              <Chip
                label={user?.isEmailVerified ? "Verified" : "Unverified"}
                color={user?.isEmailVerified ? "success" : "warning"}
                size="small"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText
                primary="Phone Verification"
                secondary={user?.isPhoneVerified ? "Verified" : "Not verified"}
              />
              <Chip
                label={user?.isPhoneVerified ? "Verified" : "Unverified"}
                color={user?.isPhoneVerified ? "success" : "warning"}
                size="small"
              />
            </ListItem>
          </List>
          </Box>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={user?.role === 'seller' ? 4 : 3}>
          <Box sx={{ px: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive notifications via email"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label=""
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="SMS Notifications"
                secondary="Receive notifications via SMS"
              />
              <FormControlLabel
                control={<Switch />}
                label=""
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Order Updates"
                secondary="Get notified about order status changes"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label=""
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Marketing Communications"
                secondary="Receive promotional emails and offers"
              />
              <FormControlLabel
                control={<Switch />}
                label=""
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Privacy Settings
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Profile Visibility"
                secondary="Allow others to find your profile"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label=""
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Location Sharing"
                secondary="Share your location for better recommendations"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label=""
              />
            </ListItem>
          </List>
          </Box>
        </TabPanel>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <DialogContent sx={{ px: 3, py: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              margin="normal"
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
              {...registerPassword('newPassword', { 
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              margin="normal"
              {...registerPassword('confirmPassword', { 
                required: 'Please confirm your password',
                validate: (value, { newPassword }) => value === newPassword || 'Passwords do not match'
              })}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Avatar upload functionality coming soon!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
