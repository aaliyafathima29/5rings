import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Checkbox,
  Toolbar,
  Tooltip,
  Badge,
  Avatar,
  Stack,
  Divider,
  alpha,
  styled,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Storefront as StorefrontIcon,
  Restaurant as RestaurantIcon,
  Inventory as InventoryIcon,
  ViewModule as ViewModuleIcon,
  TableChart as TableChartIcon,
  FileUpload as FileUploadIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '../../utils/api';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
  borderRadius: 16
}));

const DropZone = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04)
  }
}));

const VendorProducts = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [products, setProducts] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    topSellingProduct: null
  });
  
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Equipment',
    stock: '',
    images: [],
    features: '',
    specifications: '',
    warranty: ''
  });

  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'snacks',
    preparationTime: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    allergens: '',
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    }
  });

  const productCategories = ['Equipment', 'Apparel', 'Accessories', 'Nutrition', 'Other'];
  const menuCategories = ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'dessert'];

  useEffect(() => {
    fetchProducts();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [products, menuItems]);

  const calculateAnalytics = () => {
    const currentItems = tabValue === 0 ? products : menuItems;
    const totalRevenue = currentItems.reduce((sum, item) => {
      // Simulate revenue calculation (price * estimated sales)
      return sum + (item.price * (item.ratings?.count || 1));
    }, 0);
    
    const topSelling = currentItems.reduce((top, item) => {
      const sales = item.ratings?.count || 0;
      return sales > (top?.ratings?.count || 0) ? item : top;
    }, null);

    setAnalytics({
      totalProducts: currentItems.length,
      totalRevenue,
      topSellingProduct: topSelling
    });
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/my-products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/food/vendor/menu');
      setMenuItems(response.data.menuItems || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenProductDialog = (product = null) => {
    if (product) {
      setEditingItem(product);
      setProductFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        images: product.images || []
      });
    } else {
      setEditingItem(null);
      setProductFormData({
        name: '',
        description: '',
        price: '',
        category: 'Equipment',
        stock: '',
        images: []
      });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleOpenMenuDialog = (menuItem = null) => {
    if (menuItem) {
      setEditingItem(menuItem);
      setMenuFormData({
        name: menuItem.name,
        description: menuItem.description || '',
        price: menuItem.price,
        category: menuItem.category,
        preparationTime: menuItem.preparationTime || '',
        isVegetarian: menuItem.isVegetarian || false,
        isVegan: menuItem.isVegan || false,
        isGlutenFree: menuItem.isGlutenFree || false,
        isAvailable: menuItem.isAvailable !== false,
        allergens: menuItem.allergens?.join(', ') || '',
        nutrition: {
          calories: menuItem.nutrition?.calories || '',
          protein: menuItem.nutrition?.protein || '',
          carbs: menuItem.nutrition?.carbs || '',
          fat: menuItem.nutrition?.fat || '',
          fiber: menuItem.nutrition?.fiber || ''
        }
      });
    } else {
      setEditingItem(null);
      setMenuFormData({
        name: '',
        description: '',
        price: '',
        category: 'snacks',
        preparationTime: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isAvailable: true,
        allergens: '',
        nutrition: {
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: ''
        }
      });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleProductChange = (e) => {
    setProductFormData({
      ...productFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleMenuChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name.startsWith('nutrition.')) {
      const field = name.split('.')[1];
      setMenuFormData({
        ...menuFormData,
        nutrition: {
          ...menuFormData.nutrition,
          [field]: value
        }
      });
    } else {
      setMenuFormData({
        ...menuFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingItem) {
        await api.put(`/products/${editingItem._id}`, productFormData);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/products', productFormData);
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchProducts();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const menuData = {
        ...menuFormData,
        allergens: menuFormData.allergens ? menuFormData.allergens.split(',').map(a => a.trim()) : []
      };

      if (editingItem) {
        await api.put(`/food/menu/${editingItem._id}`, menuData);
        setSuccess('Menu item updated successfully!');
      } else {
        await api.post('/food/menu', menuData);
        setSuccess('Menu item created successfully!');
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchMenuItems();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving menu item');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      fetchProducts();
      setSuccess('Product deleted successfully!');
    } catch (error) {
      setError('Error deleting product');
    }
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await api.delete(`/food/menu/${menuItemId}`);
      fetchMenuItems();
      setSuccess('Menu item deleted successfully!');
    } catch (error) {
      setError('Error deleting menu item');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      return;
    }

    try {
      const endpoint = tabValue === 0 ? 'products' : 'food/menu';
      
      await Promise.all(
        selectedItems.map(id => api.delete(`/${endpoint}/${id}`))
      );
      
      setSelectedItems([]);
      if (tabValue === 0) {
        fetchProducts();
      } else {
        fetchMenuItems();
      }
      setSuccess(`${selectedItems.length} items deleted successfully!`);
    } catch (error) {
      setError('Error deleting items');
    }
  };

  const handleSelectAll = (event) => {
    const items = tabValue === 0 ? filteredProducts : filteredMenuItems;
    if (event.target.checked) {
      setSelectedItems(items.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleImageUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // Here you would implement actual file upload logic
    // For now, we'll simulate it
    setTimeout(() => {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setProductFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }, 2000);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderProductCard = (product) => (
    <Grid item xs={12} sm={6} md={4} key={product._id}>
      <StyledCard>
        <Box sx={{ position: 'relative' }}>
          <Checkbox
            checked={selectedItems.includes(product._id)}
            onChange={() => handleSelectItem(product._id)}
            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
          />
          <CardMedia
            component="img"
            height="200"
            image={product.images?.[0] || '/api/placeholder/300/200'}
            alt={product.name}
            sx={{ bgcolor: '#f5f5f5' }}
          />
          <Chip
            label={product.category}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}
          />
        </Box>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600} noWrap>{product.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
            {product.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>${product.price?.toFixed(2)}</Typography>
            <Chip 
              label={`Stock: ${product.stock}`} 
              size="small" 
              color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={product.ratings?.count || 0} color="primary">
              <TrendingUpIcon fontSize="small" />
            </Badge>
            <Typography variant="caption">
              {product.ratings?.average?.toFixed(1) || '0.0'} rating
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleOpenProductDialog(product)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteProduct(product._id)}
          >
            Delete
          </Button>
          <IconButton size="small" sx={{ ml: 'auto' }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </StyledCard>
    </Grid>
  );

  const renderMenuCard = (item) => (
    <Grid item xs={12} sm={6} md={4} key={item._id}>
      <StyledCard>
        <Box sx={{ position: 'relative' }}>
          <Checkbox
            checked={selectedItems.includes(item._id)}
            onChange={() => handleSelectItem(item._id)}
            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
          />
          <CardMedia
            component="img"
            height="200"
            image={item.image || '/api/placeholder/300/200'}
            alt={item.name}
            sx={{ bgcolor: '#f5f5f5' }}
          />
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
            {item.isVegetarian && <Chip label="V" size="small" color="success" sx={{ minWidth: 24, height: 24, fontSize: '0.7rem' }} />}
            {item.isVegan && <Chip label="VG" size="small" color="success" sx={{ minWidth: 28, height: 24, fontSize: '0.7rem' }} />}
            {item.isGlutenFree && <Chip label="GF" size="small" color="info" sx={{ minWidth: 28, height: 24, fontSize: '0.7rem' }} />}
          </Box>
        </Box>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600} noWrap>{item.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: 40, overflow: 'hidden' }}>
            {item.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>${item.price?.toFixed(2)}</Typography>
            <Chip 
              label={item.isAvailable ? 'Available' : 'Unavailable'} 
              size="small" 
              color={item.isAvailable ? 'success' : 'default'}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="caption">
              {item.preparationTime || 'N/A'} min prep
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleOpenMenuDialog(item)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteMenuItem(item._id)}
          >
            Delete
          </Button>
          <IconButton size="small" sx={{ ml: 'auto' }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </StyledCard>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Analytics */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              Vendor Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage your products and menu items with powerful tools
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<StorefrontIcon />}
            onClick={() => navigate('/products')}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            View Store
          </Button>
        </Box>
        
        {/* Analytics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                <MoneyIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="h4" fontWeight="bold">
                  ${analytics.totalRevenue.toFixed(0)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Estimated Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                <InventoryIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="h4" fontWeight="bold">
                  {analytics.totalProducts}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total {tabValue === 0 ? 'Products' : 'Menu Items'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {analytics.topSellingProduct?.name || 'No data'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Top Selling Item
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            px: 1
          }}
        >
          <Tab 
            icon={<InventoryIcon />} 
            iconPosition="start" 
            label={`Products (${products.length})`}
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 64 }}
          />
          <Tab 
            icon={<RestaurantIcon />} 
            iconPosition="start" 
            label={`Menu Items (${menuItems.length})`}
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 64 }}
          />
        </Tabs>
      </Paper>

      {/* Controls Bar */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={`Search ${tabValue === 0 ? 'products' : 'menu items'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              size="small"
            >
              <MenuItem value="All">All Categories</MenuItem>
              {(tabValue === 0 ? productCategories : menuCategories).map((cat) => (
                <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
              <Tooltip title="Card View">
                <IconButton 
                  onClick={() => setViewMode('cards')}
                  sx={{ 
                    bgcolor: viewMode === 'cards' ? 'primary.main' : 'transparent',
                    color: viewMode === 'cards' ? 'white' : 'inherit',
                    borderRadius: '4px 0 0 4px'
                  }}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Table View">
                <IconButton 
                  onClick={() => setViewMode('table')}
                  sx={{ 
                    bgcolor: viewMode === 'table' ? 'primary.main' : 'transparent',
                    color: viewMode === 'table' ? 'white' : 'inherit',
                    borderRadius: '0 4px 4px 0'
                  }}
                >
                  <TableChartIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedItems.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  size="small"
                >
                  Delete ({selectedItems.length})
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => tabValue === 0 ? handleOpenProductDialog() : handleOpenMenuDialog()}
                sx={{ borderRadius: 2 }}
              >
                Add {tabValue === 0 ? 'Product' : 'Menu Item'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Content Area */}
      {tabValue === 0 && (
        <Box>
          {/* Bulk Actions Bar */}
          {selectedItems.length > 0 && (
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  {selectedItems.length} items selected
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </Box>
            </Paper>
          )}

          {viewMode === 'cards' ? (
            <Grid container spacing={3}>
              {filteredProducts.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 8, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <InventoryIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No products yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create your first product to start selling
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenProductDialog()}
                    >
                      Add Product
                    </Button>
                  </Paper>
                </Grid>
              ) : (
                filteredProducts.map(renderProductCard)
              )}
            </Grid>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.length === filteredProducts.length && filteredProducts.length > 0}
                        indeterminate={selectedItems.length > 0 && selectedItems.length < filteredProducts.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell><strong>Image</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Price</strong></TableCell>
                    <TableCell><strong>Stock</strong></TableCell>
                    <TableCell><strong>Rating</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                          No products found. Try adjusting your search or filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product._id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedItems.includes(product._id)}
                            onChange={() => handleSelectItem(product._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Avatar
                            src={product.images?.[0]}
                            variant="rounded"
                            sx={{ width: 50, height: 50 }}
                          >
                            <InventoryIcon />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={product.category} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ${product.price?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.stock} 
                            size="small" 
                            color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {product.ratings?.average?.toFixed(1) || '0.0'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({product.ratings?.count || 0})
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={product.isActive ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleOpenProductDialog(product)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteProduct(product._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Menu Items Tab */}
      {tabValue === 1 && (
        <Box>
          {/* Bulk Actions Bar */}
          {selectedItems.length > 0 && (
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  {selectedItems.length} items selected
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </Box>
            </Paper>
          )}

          {viewMode === 'cards' ? (
            <Grid container spacing={3}>
              {filteredMenuItems.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 8, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <RestaurantIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No menu items yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create your first menu item to start serving food
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenMenuDialog()}
                    >
                      Add Menu Item
                    </Button>
                  </Paper>
                </Grid>
              ) : (
                filteredMenuItems.map(renderMenuCard)
              )}
            </Grid>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.length === filteredMenuItems.length && filteredMenuItems.length > 0}
                        indeterminate={selectedItems.length > 0 && selectedItems.length < filteredMenuItems.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell><strong>Image</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Price</strong></TableCell>
                    <TableCell><strong>Dietary</strong></TableCell>
                    <TableCell><strong>Prep Time</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMenuItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                          No menu items found. Try adjusting your search or filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Avatar
                            src={item.image}
                            variant="rounded"
                            sx={{ width: 50, height: 50 }}
                          >
                            <RestaurantIcon />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.category.charAt(0).toUpperCase() + item.category.slice(1)} size="small" color="secondary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ${item.price?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {item.isVegetarian && <Chip label="V" size="small" color="success" />}
                            {item.isVegan && <Chip label="VG" size="small" color="success" />}
                            {item.isGlutenFree && <Chip label="GF" size="small" color="info" />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.preparationTime || 'N/A'} min
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.isAvailable ? 'Available' : 'Unavailable'} 
                            size="small" 
                            color={item.isAvailable ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleOpenMenuDialog(item)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteMenuItem(item._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Enhanced Product Dialog */}
      <Dialog open={openDialog && tabValue === 0} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {editingItem ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingItem ? 'Update your product information' : 'Create a new product for your store'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleProductSubmit}>
          <DialogContent sx={{ pb: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            {/* Image Upload Area */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Product Images</Typography>
              <DropZone
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  handleImageUpload(files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
                <FileUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Drag & drop images here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse files
                </Typography>
                {isUploading && (
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2, width: '60%' }} />
                )}
              </DropZone>
              
              {productFormData.images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {productFormData.images.map((image, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white' }}
                        onClick={() => {
                          setProductFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField 
                  fullWidth 
                  label="Product Name" 
                  name="name" 
                  value={productFormData.name} 
                  onChange={handleProductChange} 
                  required 
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth 
                  select 
                  label="Category" 
                  name="category" 
                  value={productFormData.category} 
                  onChange={handleProductChange} 
                  required
                  sx={{ mb: 2 }}
                >
                  {productCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Description" 
                  name="description" 
                  value={productFormData.description} 
                  onChange={handleProductChange} 
                  required 
                  multiline 
                  rows={4} 
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Price" 
                  name="price" 
                  type="number" 
                  value={productFormData.price} 
                  onChange={handleProductChange} 
                  required 
                  inputProps={{ step: '0.01', min: '0' }}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Stock Quantity" 
                  name="stock" 
                  type="number" 
                  value={productFormData.stock} 
                  onChange={handleProductChange} 
                  required 
                  inputProps={{ min: '0' }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Key Features (comma separated)" 
                  name="features" 
                  value={productFormData.features} 
                  onChange={handleProductChange}
                  placeholder="e.g., Waterproof, Durable, Lightweight"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Warranty Period" 
                  name="warranty" 
                  value={productFormData.warranty} 
                  onChange={handleProductChange}
                  placeholder="e.g., 1 year, 6 months"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Technical Specifications" 
                  name="specifications" 
                  value={productFormData.specifications} 
                  onChange={handleProductChange}
                  multiline 
                  rows={3} 
                  placeholder="Detailed specifications..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseDialog} size="large">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              sx={{ minWidth: 120 }}
            >
              {editingItem ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={openDialog && tabValue === 1}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            background: 'rgba(12, 18, 30, 0.96)',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(14px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC' }}>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {editingItem ? 'Update menu details and availability.' : 'Create a new menu item for your kitchen.'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleMenuSubmit}>
          <DialogContent
            sx={{
              pt: 2,
              pb: 3,
              '& .MuiInputLabel-root': { color: '#94A3B8' },
              '& .MuiInputBase-input': { color: '#E2E8F0' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.18)' },
                '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          >
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  label="Item Name"
                  name="name"
                  value={menuFormData.name}
                  onChange={handleMenuChange}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={menuFormData.category}
                  onChange={handleMenuChange}
                  required
                  size="small"
                >
                  {menuCategories.map((cat) => <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={menuFormData.description}
                  onChange={handleMenuChange}
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Price (INR)"
                  name="price"
                  type="number"
                  value={menuFormData.price}
                  onChange={handleMenuChange}
                  required
                  size="small"
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Prep Time (min)"
                  name="preparationTime"
                  type="number"
                  value={menuFormData.preparationTime}
                  onChange={handleMenuChange}
                  size="small"
                  inputProps={{ min: '0' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Allergens"
                  name="allergens"
                  value={menuFormData.allergens}
                  onChange={handleMenuChange}
                  placeholder="e.g., nuts, dairy, gluten"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#94A3B8', letterSpacing: 0.5 }}>
                  Dietary Flags & Availability
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, '& .MuiFormControlLabel-label': { color: '#CBD5E1' } }}>
                  <FormControlLabel control={<Switch checked={menuFormData.isVegetarian} onChange={handleMenuChange} name="isVegetarian" />} label="Vegetarian" />
                  <FormControlLabel control={<Switch checked={menuFormData.isVegan} onChange={handleMenuChange} name="isVegan" />} label="Vegan" />
                  <FormControlLabel control={<Switch checked={menuFormData.isGlutenFree} onChange={handleMenuChange} name="isGlutenFree" />} label="Gluten Free" />
                  <FormControlLabel control={<Switch checked={menuFormData.isAvailable} onChange={handleMenuChange} name="isAvailable" />} label="Available" />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#94A3B8', letterSpacing: 0.5 }}>
                  Nutrition (optional)
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <TextField fullWidth label="Calories" name="nutrition.calories" type="number" value={menuFormData.nutrition.calories} onChange={handleMenuChange} size="small" />
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <TextField fullWidth label="Protein (g)" name="nutrition.protein" type="number" value={menuFormData.nutrition.protein} onChange={handleMenuChange} size="small" />
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <TextField fullWidth label="Carbs (g)" name="nutrition.carbs" type="number" value={menuFormData.nutrition.carbs} onChange={handleMenuChange} size="small" />
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <TextField fullWidth label="Fat (g)" name="nutrition.fat" type="number" value={menuFormData.nutrition.fat} onChange={handleMenuChange} size="small" />
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <TextField fullWidth label="Fiber (g)" name="nutrition.fiber" type="number" value={menuFormData.nutrition.fiber} onChange={handleMenuChange} size="small" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Button onClick={handleCloseDialog} size="large" sx={{ color: '#94A3B8' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" size="large" sx={{ minWidth: 160, borderRadius: 3 }}>
              {editingItem ? 'Update Item' : 'Create Item'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default VendorProducts;
