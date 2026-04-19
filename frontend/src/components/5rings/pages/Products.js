import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Rating,
  Stack,
  Paper,
  Tab,
  Tabs,
  Divider,
  Avatar,
  FormControlLabel,
  Checkbox,
  Slider,
  styled
} from '@mui/material';
import Layout from '../components/Layout.js';
import { useCart } from '../../../context/CartContext';
import {
  AddShoppingCart as AddShoppingCartIcon,
  Search as SearchIcon,
  LocalOffer as LocalOfferIcon,
  Visibility as VisibilityIcon,
  FavoriteBorder as FavoriteIcon,
  Favorite as FavoriteFilledIcon,
  Compare as CompareIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import axios from 'axios';

// Styled components
const StyledProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
    '& .product-image': {
      transform: 'scale(1.05)'
    }
  }
}));

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openQuickView, setOpenQuickView] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const categories = ['All', 'Equipment', 'Apparel', 'Accessories', 'Nutrition', 'Other'];

  useEffect(() => {
    fetchProducts();
    loadWishlist();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, category, searchTerm, sortBy, priceRange, showOnlyInStock]);

  const loadWishlist = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  };

  const toggleWishlist = (productId) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const toggleCompare = (product) => {
    const isInCompare = compareList.find(p => p._id === product._id);
    if (isInCompare) {
      setCompareList(compareList.filter(p => p._id !== product._id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, product]);
    } else {
      alert('You can compare up to 3 products at a time');
    }
  };

  const openQuickViewDialog = (product) => {
    setSelectedProduct(product);
    setOpenQuickView(true);
  };

  const shareProduct = async (product) => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `Check out this product: ${product.name} - ${window.location.href}`
      );
      alert('Product link copied to clipboard!');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filtering
    filtered = filtered.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Stock filtering
    if (showOnlyInStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <Layout>
      <Box sx={{ pt: { xs: 10, md: 12 }, bgcolor: 'transparent', minHeight: '100vh' }}>
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
          <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center', mb: 8 }}>
            <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '4.5rem' }, mb: 3, color: 'text.primary' }}>
              Our{' '}
              <Box component="span" sx={{ position: 'relative', display: 'inline-block', '&::after': { content: '""', position: 'absolute', bottom: 8, left: 0, width: '100%', height: 12, bgcolor: alpha('#1a1a1a', 0.1), zIndex: -1 } }}>
                Products
              </Box>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontSize: '1.25rem' }}>
              Premium sports equipment and gear for champions
            </Typography>
          </Box>

          {/* Enhanced Filters */}
          <Card elevation={0} sx={{ p: 3, mb: 6, bgcolor: 'background.paper', border: '1px solid', borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon />
                Product Filters
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {compareList.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<CompareIcon />}
                    onClick={() => alert('Compare functionality would open here')}
                    color="primary"
                  >
                    Compare ({compareList.length})
                  </Button>
                )}
                <Tooltip title={viewMode === 'grid' ? 'List View' : 'Grid View'}>
                  <IconButton 
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Price Range</Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000}
                  step={100}
                  marks={[
                    { value: 0, label: '₹0' },
                    { value: 5000, label: '₹5K' },
                    { value: 10000, label: '₹10K' }
                  ]}
                  valueLabelFormat={(value) => `₹${value}`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showOnlyInStock}
                      onChange={(e) => setShowOnlyInStock(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show only products in stock"
                />
              </Grid>
            </Grid>
            
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mt: 3, pt: 3, borderTop: 1, borderColor: 'grey.200', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={filteredProducts.length} color="primary">
                  <LocalOfferIcon color="action" />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Products Found
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={wishlist.length} color="secondary">
                  <FavoriteIcon color="action" />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Wishlist Items
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={compareList.length} color="info">
                  <CompareIcon color="action" />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Compare List
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Products Grid */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <TrendingUpIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Loading products...</Typography>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
              <LocalOfferIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>No products found</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search criteria or filters to find what you're looking for.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setSearchTerm('');
                  setCategory('All');
                  setPriceRange([0, 10000]);
                  setShowOnlyInStock(false);
                }}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={4}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <StyledProductCard>
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: 260 }}>
                      {product.images && product.images[0] ? (
                        <CardMedia
                          component="img"
                          image={product.images[0]}
                          alt={product.name}
                          className="product-image"
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'grey.100' }}>
                          <LocalOfferIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                        </Box>
                      )}
                      
                      {/* Status Indicators */}
                      {product.stock < 10 && product.stock > 0 && (
                        <Chip 
                          label="Low Stock" 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            bgcolor: '#ff9800', 
                            color: 'white', 
                            fontWeight: 600 
                          }} 
                        />
                      )}
                      {product.stock === 0 && (
                        <Chip 
                          label="Out of Stock" 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            bgcolor: '#f44336', 
                            color: 'white', 
                            fontWeight: 600 
                          }} 
                        />
                      )}
                      
                      {/* Category Badge */}
                      {product.category && (
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            fontWeight: 600,
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      )}
                      
                      {/* Action Buttons */}
                      <Box sx={{ position: 'absolute', top: 12, right: product.stock === 0 ? 12 : 60, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product._id);
                          }}
                          sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                        >
                          {wishlist.includes(product._id) ? 
                            <FavoriteFilledIcon fontSize="small" color="error" /> : 
                            <FavoriteIcon fontSize="small" />
                          }
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(product);
                          }}
                          sx={{ 
                            bgcolor: compareList.find(p => p._id === product._id) ? 'primary.main' : 'rgba(255,255,255,0.9)', 
                            color: compareList.find(p => p._id === product._id) ? 'white' : 'inherit',
                            backdropFilter: 'blur(8px)' 
                          }}
                        >
                          <CompareIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareProduct(product);
                          }}
                          sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 1, minHeight: 48, lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 2, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', 
                        lineHeight: 1.6,
                        minHeight: 40
                      }}>
                        {product.description}
                      </Typography>
                      
                      {/* Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating 
                          value={product.ratings?.average || 0} 
                          precision={0.5} 
                          size="small" 
                          readOnly 
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({product.ratings?.count || 0})
                        </Typography>
                      </Box>
                      
                      {/* Price and Stock */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h5" fontWeight={900} sx={{ color: 'text.primary' }}>
                          ₹{product.price?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stock: {product.stock}
                        </Typography>
                      </Box>
                      
                      {/* Features */}
                      {product.features && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {product.features.split(',').slice(0, 2).map((feature, index) => (
                            <Chip 
                              key={index} 
                              label={feature.trim()} 
                              size="small" 
                              variant="outlined" 
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 3, pt: 0, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => openQuickViewDialog(product)}
                        sx={{ flexGrow: 1, borderRadius: 2 }}
                      >
                        Quick View
                      </Button>
                      
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        sx={{
                          flexGrow: 2,
                          bgcolor: 'background.paper',
                          color: 'white',
                          fontWeight: 600,
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#2a2a2a' },
                          '&:disabled': { bgcolor: 'grey.300', color: 'grey.600' }
                        }}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </StyledProductCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Quick View Dialog */}
      <Dialog 
        open={openQuickView} 
        onClose={() => setOpenQuickView(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        {selectedProduct && (
          <Box>
            {/* Header */}
            <DialogTitle sx={{ p: 0, position: 'relative' }}>
              <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                {selectedProduct.images?.[0] ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    bgcolor: 'grey.100', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <LocalOfferIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                  </Box>
                )}
                
                {/* Overlay */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  p: 3,
                  color: 'white'
                }}>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    {selectedProduct.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Rating value={selectedProduct.ratings?.average || 0} precision={0.5} size="small" readOnly />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      ({selectedProduct.ratings?.count || 0} reviews)
                    </Typography>
                  </Box>
                </Box>
                
                {/* Close Button */}
                <IconButton
                  onClick={() => setOpenQuickView(false)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  ×
                </IconButton>
              </Box>
            </DialogTitle>
            
            {/* Content */}
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Product Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {selectedProduct.description}
                  </Typography>
                  
                  {selectedProduct.features && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        Key Features
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedProduct.features.split(',').map((feature, index) => (
                          <Chip key={index} label={feature.trim()} variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {selectedProduct.specifications && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        Specifications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedProduct.specifications}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Product Details
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Category</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedProduct.category}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Availability</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'} 
                            size="small" 
                            color={selectedProduct.stock > 0 ? 'success' : 'error'} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({selectedProduct.stock} units)
                          </Typography>
                        </Box>
                      </Box>
                      
                      {selectedProduct.warranty && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Warranty</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <SecurityIcon fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight={600}>
                              {selectedProduct.warranty}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Shipping</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <ShippingIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            Free shipping on orders over ₹999
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h3" fontWeight={900} color="primary.main" sx={{ mb: 1 }}>
                          ₹{selectedProduct.price?.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Inclusive of all taxes
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            
            {/* Actions */}
            <DialogActions sx={{ p: { xs: 2.5, sm: 4 }, pt: 0, display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="outlined"
                  sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { xs: '100%', sm: 'auto' } }}
                  startIcon={wishlist.includes(selectedProduct._id) ? <FavoriteFilledIcon /> : <FavoriteIcon />}
                  onClick={() => toggleWishlist(selectedProduct._id)}
                  color={wishlist.includes(selectedProduct._id) ? 'error' : 'inherit'}
                >
                  {wishlist.includes(selectedProduct._id) ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => shareProduct(selectedProduct)}
                >
                  Share
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  onClick={() => toggleCompare(selectedProduct)}
                  color={compareList.find(p => p._id === selectedProduct._id) ? 'primary' : 'inherit'}
                >
                  {compareList.find(p => p._id === selectedProduct._id) ? 'Added' : 'Compare'}
                </Button>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                fullWidth={{ xs: true, sm: false }}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                startIcon={<AddShoppingCartIcon />}
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setOpenQuickView(false);
                }}
                disabled={selectedProduct.stock === 0}
                sx={{
                  bgcolor: 'background.paper',
                  minWidth: 160,
                  '&:hover': { bgcolor: '#2a2a2a' }
                }}
              >
                {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </Layout>
  );
};

export default Products;
