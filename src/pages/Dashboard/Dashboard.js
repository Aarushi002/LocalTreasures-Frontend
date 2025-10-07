import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ShoppingBag as OrdersIcon,
  Chat as ChatIcon,
  TrendingUp as SalesIcon,
  Inventory as ProductsIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  People as CustomersIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

import { getSellerProducts } from '../../store/slices/productSlice';
import { getOrders } from '../../store/slices/orderSlice';
import OrderList from '../../components/Orders/OrderList';
import Wishlist from '../../components/Wishlist/Wishlist';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products = [], sellerProducts = [] } = useSelector((state) => state.products || {});
  // Use sellerProducts for sellers, products for buyers
  const userProducts = user?.role === 'seller' ? sellerProducts : products;
  const { orders = [] } = useSelector((state) => state.orders || {});
  const { totalItems: wishlistCount = 0 } = useSelector((state) => state.wishlist || {});
  
  const [tabValue, setTabValue] = useState(0);

  // Mock data - Replace with real data from Redux store
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      newMessages: 0,
      productViews: 0,
    },
    recentOrders: [],
    recentMessages: [],
    popularProducts: [],
    notifications: [],
  });

  // Set tab based on URL path
  useEffect(() => {
    const path = location.pathname;
    const role = user?.role;
    if (role === 'seller') {
      if (path.includes('/dashboard/products')) {
        setTabValue(1); // Products tab
      } else if (path.includes('/dashboard/orders')) {
        setTabValue(2); // Orders tab
      } else if (path.includes('/dashboard/analytics')) {
        setTabValue(3); // Analytics tab
      } else {
        setTabValue(0); // Overview tab
      }
    } else if (role === 'buyer') {
      if (path.includes('/dashboard/orders')) {
        setTabValue(1); // Orders tab for buyers
      } else if (path.includes('/dashboard/wishlist')) {
        setTabValue(2); // Wishlist tab for buyers
      } else {
        setTabValue(0); // Overview tab
      }
    }
  }, [location.pathname, user?.role]);

  useEffect(() => {
    // Load user's products and orders
    if (user?.role === 'seller' && user?._id) {
      dispatch(getSellerProducts({ sellerId: user._id }));
      dispatch(getOrders({ seller: user._id }));
    } else if (user?._id) {
      dispatch(getOrders({ buyer: user._id }));
    }
    
    // Wishlist is already loaded in App.js, no need to reload here
  }, [dispatch, user?._id, user?.role]); // Use specific properties instead of entire user object

  // Calculate dashboard stats from orders and products
  const calculatedStats = useMemo(() => {
    const stats = {
      totalProducts: userProducts?.length || 0,
      totalOrders: orders?.length || 0,
      totalRevenue: 0,
      totalCustomers: 0,
      newMessages: 0,
      productViews: 0,
    };

    if (orders && Array.isArray(orders) && orders.length > 0 && user?.role) {
      const role = user.role;
      const totalRevenue = orders
        .filter(order => order?.status === 'delivered' && order?.payment?.status === 'completed')
        .reduce((sum, order) => sum + (order?.totals?.total || 0), 0);
      
      const uniqueCustomers = new Set(
        orders
          .filter(order => order && (order.buyer?._id || order.seller?._id))
          .map(order => role === 'seller' ? order.buyer?._id : order.seller?._id)
      ).size;

      stats.totalRevenue = totalRevenue;
      stats.totalCustomers = uniqueCustomers;
    }

    return stats;
  }, [userProducts?.length, orders, user?.role]);

  const recentOrders = useMemo(() => {
    return orders && Array.isArray(orders) && orders.length > 0 ? orders.slice(0, 5) : [];
  }, [orders]);

  // Update dashboard data when calculated values change
  useEffect(() => {
    setDashboardData(prev => ({
      ...prev,
      stats: calculatedStats,
      recentOrders: recentOrders,
    }));
  }, [calculatedStats, recentOrders]);

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const StatCard = ({ title, value, icon, color, trend, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 3 } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
            {trend && (
              <Typography 
                variant="caption" 
                color={trend > 0 ? 'success.main' : 'error.main'}
              >
                {trend > 0 ? '+' : ''}{trend}% from last month
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Buyer Dashboard
  const BuyerDashboard = () => (
    <>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover amazing local products and track your orders
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={dashboardData.stats.totalOrders}
            icon={<OrdersIcon />}
            color="primary.main"
            onClick={() => navigate('/dashboard/orders')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Wishlist Items"
            value={wishlistCount}
            icon={<StarIcon />}
            color="secondary.main"
            onClick={() => navigate('/wishlist')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Spent"
            value={`$${dashboardData.stats.totalRevenue.toFixed(2)}`}
            icon={<MoneyIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Messages"
            value={dashboardData.stats.newMessages}
            icon={<ChatIcon />}
            color="warning.main"
            onClick={() => navigate('/chat')}
          />
        </Grid>
      </Grid>

      {/* Tabs for buyers */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => {
            setTabValue(newValue);
            // Update URL based on tab selection for buyers
            switch (newValue) {
              case 0:
                navigate('/dashboard');
                break;
              case 1:
                navigate('/dashboard/orders');
                break;
              case 2:
                navigate('/dashboard/wishlist');
                break;
              default:
                navigate('/dashboard');
            }
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Overview" icon={<AnalyticsIcon />} />
          <Tab label="Orders" icon={<OrdersIcon />} />
          <Tab label="Wishlist" icon={<StarIcon />} />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Orders</Typography>
                  <Button size="small" onClick={() => navigate('/dashboard/orders')}>
                    View All
                  </Button>
                </Box>
                
                {dashboardData.recentOrders && Array.isArray(dashboardData.recentOrders) && dashboardData.recentOrders.length > 0 ? (
                  <List>
                    {dashboardData.recentOrders.slice(0, 5).map((order, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={`Order #${order?.orderNumber || 'N/A'}`}
                          secondary={`${order?.items?.length || 0} items • $${order?.totals?.total?.toFixed(2) || '0.00'}`}
                        />
                        <Chip 
                          label={order?.status || 'unknown'} 
                          color={order?.status === 'delivered' ? 'success' : 'primary'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No orders yet. Start shopping to see your orders here!
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recommended Products */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recommended for You</Typography>
                  <Button size="small" onClick={() => navigate('/products')}>
                    Browse All
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Personalized recommendations coming soon!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <OrderList orders={orders} userRole="buyer" />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Wishlist />
      </TabPanel>
    </>
  );

  // Seller Dashboard
  const SellerDashboard = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {user?.businessInfo?.businessName || `${user?.name}'s Store`}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your products and track your business performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/add')}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={dashboardData.stats.totalProducts}
            icon={<ProductsIcon />}
            color="primary.main"
            trend={5}
            onClick={() => navigate('/dashboard/products')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={dashboardData.stats.totalOrders}
            icon={<OrdersIcon />}
            color="secondary.main"
            trend={12}
            onClick={() => navigate('/dashboard/orders')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`$${dashboardData.stats.totalRevenue.toFixed(2)}`}
            icon={<SalesIcon />}
            color="success.main"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={dashboardData.stats.totalCustomers}
            icon={<CustomersIcon />}
            color="warning.main"
            trend={3}
          />
        </Grid>
      </Grid>

      {/* Tabs for detailed views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => {
            setTabValue(newValue);
            // Update URL based on tab selection
            switch (newValue) {
              case 0:
                navigate('/dashboard');
                break;
              case 1:
                navigate('/dashboard/products');
                break;
              case 2:
                navigate('/dashboard/orders');
                break;
              case 3:
                navigate('/dashboard/analytics');
                break;
              default:
                navigate('/dashboard');
            }
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Overview" icon={<AnalyticsIcon />} />
          <Tab label="Products" icon={<ProductsIcon />} />
          <Tab label="Orders" icon={<OrdersIcon />} />
          <Tab label="Analytics" icon={<SalesIcon />} />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                
                {dashboardData.recentOrders && Array.isArray(dashboardData.recentOrders) && dashboardData.recentOrders.length > 0 ? (
                  <List>
                    {dashboardData.recentOrders.slice(0, 5).map((order, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={`Order #${order?.orderNumber || 'N/A'}`}
                          secondary={`${order?.buyer?.name || 'Unknown Buyer'} • $${order?.totals?.total?.toFixed(2) || '0.00'}`}
                        />
                        <Chip 
                          label={order?.status || 'unknown'} 
                          color={order?.status === 'delivered' ? 'success' : 'primary'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No orders yet. Once customers start buying, you'll see orders here!
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Store Completion</Typography>
                    <Typography variant="body2">75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Product Views</Typography>
                    <Typography variant="body2">{dashboardData.stats.productViews}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={60} color="secondary" />
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ViewIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Profile Views" 
                      secondary="324 this month"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Average Rating" 
                      secondary="4.8 out of 5"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Your Products</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/products/add')}
          >
            Add New Product
          </Button>
        </Box>

        {userProducts && Array.isArray(userProducts) && userProducts.length > 0 ? (
          <Grid container spacing={2}>
            {userProducts.slice(0, 8).map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product?._id || Math.random()}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.png'}
                      alt={product.name}
                      style={{ width: '100%', height: 150, objectFit: 'cover' }}
                    />
                    <IconButton
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}
                      size="small"
                      onClick={() => navigate(`/dashboard/products/${product._id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" noWrap gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    <Chip
                      label={product.availability?.inStock ? `In Stock (${product.availability?.quantity || 0})` : 'Out of Stock'}
                      size="small"
                      color={product.availability?.inStock ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ProductsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No products yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first product to begin selling
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/add')}
            >
              Add Your First Product
            </Button>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <OrderList orders={orders} userRole="seller" />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Analytics & Insights
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <AnalyticsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Advanced analytics coming soon!
          </Typography>
        </Paper>
      </TabPanel>
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Notifications */}
      {dashboardData.notifications.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You have {dashboardData.notifications.length} new notifications
          </Typography>
        </Alert>
      )}

      {/* Location Info */}
      {user?.location && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Serving customers in {user.location.address?.city}, {user.location.address?.state}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Render appropriate dashboard based on user role */}
      {user?.role === 'seller' ? <SellerDashboard /> : <BuyerDashboard />}
    </Container>
  );
};

export default Dashboard;
