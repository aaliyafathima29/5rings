import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Badge,
  Stack,
  Tooltip,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Notifications as BellIcon,
  TrendingUp as TrendingUpIcon,
  EventAvailable as TodayIcon,
  MonetizationOn as RevenueIcon,
  Storefront as StorefrontIcon,
  RestaurantMenu as MenuTabIcon,
  PendingActions as ActiveOrdersIcon,
  CheckCircle as DeliveredTabIcon,
  Cancel as CancelledTabIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { foodAPI, SERVER_BASE } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsPanel from '../shared/NotificationsPanel';

function VendorDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const { unreadCount, markAllRead } = useNotifications();
  useEffect(() => { if (tabValue === 4) markAllRead(); }, [tabValue, markAllRead]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesStats, setSalesStats] = useState({ totalRevenue: 0, totalSold: 0 });
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formError, setFormError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'snacks',
    price: '',
    preparationTime: '',
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
  });

  useEffect(() => {
    loadMenu();
    loadOrders();
    loadSalesStats();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await foodAPI.getVendorMenu();
      setMenuItems(response.data.menuItems);
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await foodAPI.getVendorOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadSalesStats = async () => {
    try {
      const response = await foodAPI.getVendorSalesStats();
      setSalesStats(response.data.revenue || { totalRevenue: 0, totalSold: 0 });
    } catch (error) {
      console.error('Failed to load sales stats:', error);
    }
  };

  const handleSaveMenuItem = async () => {
    try {
      // Image is mandatory — require a new file on create, or an existing preview on edit
      if (!imageFile && !imagePreview) {
        setFormError('A food image is required. Please upload an image.');
        return;
      }
      setFormError('');
      // Build multipart FormData so we can include the image file alongside text fields
      const data = new FormData();
      data.append('name', formData.name || '');
      data.append('description', formData.description || '');
      data.append('category', formData.category || 'snacks');
      data.append('price', formData.price || '');
      data.append('preparationTime', formData.preparationTime || '');
      // Send nutrition as a JSON string; backend will parse it
      const nutrition = {};
      if (formData.nutrition?.calories) nutrition.calories = Number(formData.nutrition.calories);
      if (formData.nutrition?.protein)  nutrition.protein  = Number(formData.nutrition.protein);
      if (formData.nutrition?.carbs)    nutrition.carbs    = Number(formData.nutrition.carbs);
      if (formData.nutrition?.fat)      nutrition.fat      = Number(formData.nutrition.fat);
      data.append('nutrition', JSON.stringify(nutrition));
      data.append('isVegetarian', formData.isVegetarian);
      data.append('isVegan', formData.isVegan);
      data.append('isGlutenFree', formData.isGlutenFree);
      data.append('isAvailable', formData.isAvailable);
      if (imageFile) {
        data.append('image', imageFile);
      }
      if (currentItem) {
        await foodAPI.updateMenuItem(currentItem._id, data);
      } else {
        await foodAPI.createMenuItem(data);
      }
      setOpenDialog(false);
      loadMenu();
      loadSalesStats();
      resetForm();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  // Order status is now managed by kitchen staff only

  const resetForm = () => {
    setCurrentItem(null);
    setImageFile(null);
    setImagePreview(null);
    setFormError('');
    setFormData({
      name: '',
      description: '',
      category: 'snacks',
      price: '',
      preparationTime: '',
      nutrition: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
      },
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true,
    });
  };

  const handleDeleteMenuItem = async () => {
    try {
      await foodAPI.deleteMenuItem(itemToDelete._id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadMenu();
      loadSalesStats();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '100vh', pt: 4 }}>

      {/* ── Order Detail Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!orderDetail} onClose={() => setOrderDetail(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {orderDetail && (() => {
          const statusCfg = { placed: ['warning', '#f59e0b'], confirmed: ['info', '#3b82f6'], preparing: ['primary', '#6366f1'], ready: ['success', '#10b981'], out_for_delivery: ['info', '#38bdf8'], delivered: ['success', '#059669'], cancelled: ['error', '#ef4444'] };
          const statusColor = (statusCfg[orderDetail.status] || ['default'])[0];
          const formatTS = (ts) => ts ? new Date(ts).toLocaleString() : null;
          return (
            <>
              <DialogTitle sx={{ background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`, color: 'white', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.3px' }}>Order #{orderDetail._id.slice(-6).toUpperCase()}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>{new Date(orderDetail.orderDate).toLocaleString()}</Typography>
                </Box>
                <Chip label={orderDetail.status.toUpperCase()} color={statusColor} size="small" sx={{ fontWeight: 800, mt: 0.5, fontSize: '0.7rem', letterSpacing: .5 }} />
              </DialogTitle>
              <DialogContent dividers>
                <Stack spacing={2.5}>

                  {/* Customer info */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', display: 'block', mb: 1 }}>Customer</Typography>
                    <Stack spacing={0.4}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>👤 {orderDetail.user?.name || '—'}</Typography>
                      {orderDetail.user?.email && <Typography variant="body2" color="text.secondary">✉️ {orderDetail.user.email}</Typography>}
                      {orderDetail.user?.phone && <Typography variant="body2" color="text.secondary">📞 {orderDetail.user.phone}</Typography>}
                    </Stack>
                  </Box>

                  {/* Delivery */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', display: 'block', mb: 1 }}>Delivery Location</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                      {orderDetail.deliveryLocation?.seatNumber
                        ? <Chip label={`🪡 Seat: ${orderDetail.deliveryLocation.seatNumber}`} size="small" variant="outlined" />
                        : <Typography variant="body2" color="text.secondary">No seat info</Typography>}
                      {orderDetail.deliveryLocation?.section && <Chip label={`§ Section: ${orderDetail.deliveryLocation.section}`} size="small" variant="outlined" />}
                      {orderDetail.deliveryLocation?.venue && <Chip label={`🏙️ ${orderDetail.deliveryLocation.venue}`} size="small" variant="outlined" />}
                    </Stack>
                    {orderDetail.specialInstructions && (
                      <Alert severity="info" sx={{ mt: 1 }} icon={false}>
                        <Typography variant="body2">📝 {orderDetail.specialInstructions}</Typography>
                      </Alert>
                    )}
                  </Box>

                  {/* Items breakdown table */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', display: 'block', mb: 1.5 }}>Order Items</Typography>
                    <Paper elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: 'rgba(255, 255, 255, 0.05)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.08)', py: 1.5 } }}>
                            <TableCell>Item</TableCell>
                            <TableCell align="center">Qty</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orderDetail.items.map((item, idx) => (
                            <TableRow key={idx} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#F8FAFC' }, '&:last-child td': { border: 0 } }}>
                              <TableCell sx={{ fontWeight: 700 }}>{item.name}</TableCell>
                              <TableCell align="center">{item.quantity}</TableCell>
                              <TableCell align="right">₹{item.price}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800 }}>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                            <TableCell colSpan={3} sx={{ fontWeight: 800, color: '#F8FAFC' }}>Total</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1rem', color: '#10B981' }}>₹{orderDetail.totalAmount?.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  </Box>

                  {/* Kitchen staff */}
                  {orderDetail.kitchen?.name && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', display: 'block', mb: 0.5 }}>Handled By</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>👨‍🍳 {orderDetail.kitchen.name}</Typography>
                    </Box>
                  )}

                  {/* Order timeline */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', display: 'block', mb: 1 }}>Order Timeline</Typography>
                    <Stack spacing={0.7}>
                      {[['#f59e0b', '📥 Placed', orderDetail.orderDate],
                        ['#3b82f6', '✅ Confirmed', orderDetail.confirmedAt],
                        ['#6366f1', '🔥 Preparing', orderDetail.preparedAt],
                        ['#10b981', '🍽️ Ready', orderDetail.readyAt],
                        ['#059669', '🚀 Delivered', orderDetail.deliveredAt],
                      ].filter(([,, ts]) => ts).map(([color, label, ts]) => (
                        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                          <Typography variant="caption"><b>{label}</b> — {formatTS(ts)}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  {/* Rating */}
                  {orderDetail.rating?.food && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', display: 'block', mb: 0.5 }}>Customer Rating</Typography>
                      <Stack spacing={0.3}>
                        <Typography variant="body2">🍽️ Food: {'\u2b50'.repeat(orderDetail.rating.food)} ({orderDetail.rating.food}/5)</Typography>
                        {orderDetail.rating.service && <Typography variant="body2">🤝 Service: {'\u2b50'.repeat(orderDetail.rating.service)} ({orderDetail.rating.service}/5)</Typography>}
                        {orderDetail.rating.comment && <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>"{orderDetail.rating.comment}"</Typography>}
                      </Stack>
                    </Box>
                  )}

                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={() => setOrderDetail(null)} sx={{ textTransform: 'none', color: '#64748b' }}>Close</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
      {/* Welcome Board */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          color: 'white',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <StorefrontIcon sx={{ fontSize: 40, color: '#6366f1' }} />
                <Typography variant="h3" className="text-gradient" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Vendor Dashboard
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 450 }}>
                Manage your menu • Track orders • Monitor revenue
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1.5, mt: 3 }}>
                <Chip label={`${menuItems.length} Menu Items`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'white', fontWeight: 700, fontSize: '0.75rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Chip label={`${orders.filter(o => ['placed','confirmed','preparing','ready','out_for_delivery'].includes(o.status)).length} Active Orders`} size="small" sx={{ bgcolor: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(251,191,36,0.2)' }} />
                <Chip label={`₹${(salesStats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Revenue`} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(16,185,129,0.2)' }} />
              </Stack>
            </Box>
            <Chip
              label="VENDOR"
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: 900,
                fontSize: '0.85rem',
                px: 3,
                py: 3,
                letterSpacing: 2,
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                borderRadius: 2
              }}
            />
          </Box>
        </CardContent>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, right: 120, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" className="text-gradient" sx={{ fontWeight: 800, letterSpacing: '-0.3px' }}>
            Store Overview
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Live metrics from your store</Typography>
        </Box>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(15,23,42,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #1e293b 0%, #3730a3 100%)', boxShadow: '0 6px 20px rgba(15,23,42,0.45)' },
            }}
          >
            Add Menu Item
          </Button>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Menu Items */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="glass-panel" sx={{ borderTop: '4px solid #6366f1', borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Menu Items</Typography>
                  <Typography variant="h3" sx={{ color: '#F8FAFC', fontWeight: 900, lineHeight: 1.1, mt: 1 }}>{menuItems.length}</Typography>
                  <Typography variant="caption" sx={{ color: '#6366f1', mt: 0.8, display: 'block', fontWeight: 700 }}>{menuItems.filter(i => i.isAvailable).length} available</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <InventoryIcon sx={{ color: '#6366f1', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Total Sold */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="glass-panel" sx={{ borderTop: '4px solid #10b981', borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Total Sold</Typography>
                  <Typography variant="h3" sx={{ color: '#F8FAFC', fontWeight: 900, lineHeight: 1.1, mt: 1 }}>{salesStats.totalSold || 0}</Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', mt: 0.8, display: 'block', fontWeight: 700 }}>items fulfilled</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <TrendingUpIcon sx={{ color: '#10b981', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Completed Today */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="glass-panel" sx={{ borderTop: '4px solid #f59e0b', borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Today</Typography>
                  <Typography variant="h3" sx={{ color: '#F8FAFC', fontWeight: 900, lineHeight: 1.1, mt: 1 }}>
                    {orders.filter(o => o.status === 'delivered' && new Date(o.deliveredAt).toDateString() === new Date().toDateString()).length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#f59e0b', mt: 0.8, display: 'block', fontWeight: 700 }}>deliveries completed</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <TodayIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} className="glass-panel" sx={{ borderTop: '4px solid #3b82f6', borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Revenue</Typography>
                  <Typography variant="h3" sx={{ color: '#60A5FA', fontWeight: 900, lineHeight: 1.1, mt: 1, fontSize: { xs: '1.8rem', md: '2.1rem' } }}>
                    ₹{(salesStats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#3b82f6', mt: 0.8, display: 'block', fontWeight: 700 }}>lifetime earnings</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <RevenueIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper className="glass-panel" elevation={0} sx={{ width: '100%', mb: 4, borderRadius: 4, overflow: 'hidden', bgcolor: 'transparent' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              color: '#94A3B8',
              minHeight: 64,
              fontSize: '0.9rem',
              '&.Mui-selected': { color: '#6366f1' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab icon={<MenuTabIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Menu Items" />
          <Tab
            icon={<ActiveOrdersIcon sx={{ fontSize: 18 }} />} iconPosition="start"
            label={<Stack direction="row" alignItems="center" spacing={1}><span>Active Orders</span>{orders.filter(o => ['placed','confirmed','preparing','ready','out_for_delivery'].includes(o.status)).length > 0 && <Chip label={orders.filter(o => ['placed','confirmed','preparing','ready','out_for_delivery'].includes(o.status)).length} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 900, bgcolor: '#f59e0b', color: 'white' }} />}</Stack>}
          />
          <Tab icon={<DeliveredTabIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Delivered" />
          <Tab icon={<CancelledTabIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Cancelled" />
          <Tab
            label={
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1 }}>
                  <BellIcon sx={{ fontSize: 18 }} />
                  <span>Notifications</span>
                </Stack>
              </Badge>
            }
          />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', color: '#94A3B8', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Calories</TableCell>
                  <TableCell>Sold</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item._id} hover sx={{ '&:last-child td': { border: 0 }, borderLeft: '4px solid #6366f1', '&:hover': { bgcolor: alpha('#6366f1', 0.02) } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                    <TableCell><Chip label={item.category} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} /></TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>₹{item.price}</TableCell>
                    <TableCell>{item.nutrition?.calories ? `${item.nutrition.calories} kcal` : '—'}</TableCell>
                    <TableCell><Chip label={item.soldCount || 0} color="primary" size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={item.isAvailable ? 'Available' : 'Offline'} color={item.isAvailable ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Button size="small" startIcon={<EditIcon />} onClick={() => { setCurrentItem(item); setFormData(item); setImageFile(null); setFormError(''); setImagePreview(item.images?.[0] ? `${SERVER_BASE}${item.images[0]}` : null); setOpenDialog(true); }} sx={{ textTransform: 'none', fontWeight: 600, color: '#6366f1', borderRadius: 1.5, '&:hover': { bgcolor: alpha('#6366f1', 0.08) } }}>Edit</Button>
                        <Tooltip title="Delete menu item">
                          <IconButton size="small" color="error" onClick={() => { setItemToDelete(item); setDeleteDialogOpen(true); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {menuItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <InventoryIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1.5, display: 'block', mx: 'auto' }} />
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>No menu items yet</Typography>
                      <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Click "Add Menu Item" to get started</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ── Tab 1: Active Orders ── */}
        {tabValue === 1 && (() => {
          const activeOrders = orders.filter(o => ['placed','confirmed','preparing','ready','out_for_delivery'].includes(o.status));
          return (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#0f172a', color: 'white', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: .5, borderBottom: 'none', whiteSpace: 'nowrap' } }}>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Seat / Section</TableCell>
                    <TableCell>Instructions</TableCell>
                    <TableCell>Ordered At</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeOrders.map(order => (
                    <TableRow key={order._id} hover onClick={() => setOrderDetail(order)} sx={{ cursor: 'pointer', '&:last-child td': { border: 0 }, borderLeft: '4px solid #6366f1' }}>
                      <TableCell>
                        <Tooltip title={`Full ID: ${order._id}`}>
                          <Box>
                            <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#6366f1', fontSize: '0.82rem', lineHeight: 1.2 }}>#{order._id.slice(-8).toUpperCase()}</Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.6rem' }}>{order._id.slice(0, 8)}…</Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{order.user?.name || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{order.user?.email || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{order.user?.phone || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{order.items.map(i => `×${i.quantity} ${i.name}`).join(', ')}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>₹{order.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.4}>
                          {order.deliveryLocation?.seatNumber && <Chip label={`🪑 ${order.deliveryLocation.seatNumber}`} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />}
                          {order.deliveryLocation?.section && <Chip label={`§ ${order.deliveryLocation.section}`} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />}
                          {!order.deliveryLocation?.seatNumber && <Typography variant="caption" color="text.disabled">—</Typography>}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        {order.specialInstructions
                          ? <Tooltip title={order.specialInstructions}><Typography variant="caption" sx={{ color: '#0ea5e9', fontStyle: 'italic', display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>📝 {order.specialInstructions}</Typography></Tooltip>
                          : <Typography variant="caption" color="text.disabled">—</Typography>}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(order.orderDate).toLocaleString()}</TableCell>
                      <TableCell><Chip label={order.status.toUpperCase()} color={order.status==='ready'?'success':order.status==='preparing'?'primary':order.status==='confirmed'?'info':'warning'} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem' }} /></TableCell>
                    </TableRow>
                  ))}
                  {activeOrders.length === 0 && <TableRow><TableCell colSpan={10} align="center" sx={{ py: 8 }}><ActiveOrdersIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1.5, display: 'block', mx: 'auto' }} /><Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>No active orders right now</Typography><Typography variant="caption" sx={{ color: '#cbd5e1' }}>New orders will appear here automatically</Typography></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })()}

        {/* ── Tab 2: Delivered ── */}
        {tabValue === 2 && (() => {
          const deliveredOrders = orders.filter(o => o.status === 'delivered');
          return (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#059669', color: 'white', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: .5, borderBottom: 'none', whiteSpace: 'nowrap' } }}>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Seat / Section</TableCell>
                    <TableCell>Instructions</TableCell>
                    <TableCell>Ordered At</TableCell>
                    <TableCell>Delivered At</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveredOrders.map(order => (
                    <TableRow key={order._id} hover onClick={() => setOrderDetail(order)} sx={{ cursor: 'pointer', '&:last-child td': { border: 0 }, borderLeft: '4px solid #059669' }}>
                      <TableCell>
                        <Tooltip title={`Full ID: ${order._id}`}>
                          <Box>
                            <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#059669', fontSize: '0.82rem', lineHeight: 1.2 }}>#{order._id.slice(-8).toUpperCase()}</Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.6rem' }}>{order._id.slice(0, 8)}…</Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{order.user?.name || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{order.user?.email || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{order.user?.phone || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{order.items.map(i => `×${i.quantity} ${i.name}`).join(', ')}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>₹{order.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.4}>
                          {order.deliveryLocation?.seatNumber && <Chip label={`🪑 ${order.deliveryLocation.seatNumber}`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />}
                          {order.deliveryLocation?.section && <Chip label={`§ ${order.deliveryLocation.section}`} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />}
                          {!order.deliveryLocation?.seatNumber && <Typography variant="caption" color="text.disabled">—</Typography>}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        {order.specialInstructions
                          ? <Tooltip title={order.specialInstructions}><Typography variant="caption" sx={{ color: '#0ea5e9', fontStyle: 'italic', display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>📝 {order.specialInstructions}</Typography></Tooltip>
                          : <Typography variant="caption" color="text.disabled">—</Typography>}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(order.orderDate).toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', whiteSpace: 'nowrap', color: '#059669', fontWeight: 600 }}>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : '—'}</TableCell>
                      <TableCell>
                        {order.rating?.food
                          ? <Box><Typography variant="caption" sx={{ fontWeight: 700 }}>{'⭐'.repeat(order.rating.food)} ({order.rating.food}/5)</Typography>{order.rating.comment && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>"{order.rating.comment}"</Typography>}</Box>
                          : <Typography variant="caption" color="text.disabled">No rating</Typography>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {deliveredOrders.length === 0 && <TableRow><TableCell colSpan={11} align="center" sx={{ py: 8 }}><DeliveredTabIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1.5, display: 'block', mx: 'auto' }} /><Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>No delivered orders yet</Typography><Typography variant="caption" sx={{ color: '#cbd5e1' }}>Completed orders will show here</Typography></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })()}

        {/* ── Tab 3: Cancelled ── */}
        {tabValue === 3 && (() => {
          const cancelledOrders = orders.filter(o => o.status === 'cancelled');
          return (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#ef4444', color: 'white', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: .5, borderBottom: 'none', whiteSpace: 'nowrap' } }}>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Seat / Section</TableCell>
                    <TableCell>Instructions</TableCell>
                    <TableCell>Ordered At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cancelledOrders.map(order => (
                    <TableRow key={order._id} hover onClick={() => setOrderDetail(order)} sx={{ cursor: 'pointer', '&:last-child td': { border: 0 }, borderLeft: '4px solid #ef4444' }}>
                      <TableCell>
                        <Tooltip title={`Full ID: ${order._id}`}>
                          <Box>
                            <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#ef4444', fontSize: '0.82rem', lineHeight: 1.2 }}>#{order._id.slice(-8).toUpperCase()}</Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.6rem' }}>{order._id.slice(0, 8)}…</Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{order.user?.name || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{order.user?.email || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>{order.user?.phone || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{order.items.map(i => `×${i.quantity} ${i.name}`).join(', ')}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>₹{order.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.4}>
                          {order.deliveryLocation?.seatNumber && <Chip label={`🪑 ${order.deliveryLocation.seatNumber}`} size="small" color="error" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />}
                          {order.deliveryLocation?.section && <Chip label={`§ ${order.deliveryLocation.section}`} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />}
                          {!order.deliveryLocation?.seatNumber && <Typography variant="caption" color="text.disabled">—</Typography>}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        {order.specialInstructions
                          ? <Tooltip title={order.specialInstructions}><Typography variant="caption" sx={{ color: '#0ea5e9', fontStyle: 'italic', display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>📝 {order.specialInstructions}</Typography></Tooltip>
                          : <Typography variant="caption" color="text.disabled">—</Typography>}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(order.orderDate).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {cancelledOrders.length === 0 && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 8 }}><CancelledTabIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1.5, display: 'block', mx: 'auto' }} /><Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>No cancelled orders</Typography><Typography variant="caption" sx={{ color: '#cbd5e1' }}>Any cancellations will appear here</Typography></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })()}
      {tabValue === 4 && <Box sx={{ p: 3 }}><NotificationsPanel /></Box>}
      </Paper>

      {/* ── Add / Edit Menu Item Dialog ── */}
      <Dialog
        open={openDialog}
        onClose={() => { setOpenDialog(false); resetForm(); }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#161b24',
            border: '1px solid rgba(148, 163, 184, 0.16)',
            boxShadow: '0 18px 48px rgba(0,0,0,0.45)'
          }
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC', lineHeight: 1.2 }}>
                Edit Menu Item
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Update menu details and availability
              </Typography>
            </Box>
            <IconButton
              onClick={() => { setOpenDialog(false); resetForm(); }}
              size="small"
              sx={{ color: '#CBD5E1', bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 3,
            '& .MuiInputLabel-root': { color: 'rgba(226, 232, 240, 0.7)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#E2E8F0' },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.75)',
              backgroundColor: '#161b24',
              padding: '0 6px'
            },
            '& .MuiInputBase-input': { color: '#E2E8F0' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'rgba(17, 24, 39, 0.9)',
              '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.22)' },
              '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
            },
            '& .MuiOutlinedInput-input': { py: 1.25 }
          }}
        >
          <Grid container spacing={2.5} sx={{ mt: 0 }}>

            {/* ── Section: Basic Info ── */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#A7B1C2', display: 'block', mb: 1 }}>Basic Information</Typography>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                SelectProps={{ native: true }}
                size="small"
                InputLabelProps={{ shrink: true }}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
                <option value="dessert">Dessert</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* ── Section: Pricing & Timing ── */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#A7B1C2', display: 'block', mb: 1, mt: 1 }}>Pricing &amp; Timing</Typography>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price (INR)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Prep Time (min)"
                placeholder="e.g. 15"
                value={formData.preparationTime || ''}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                InputProps={{ inputProps: { min: 1, max: 120 } }}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* ── Section: Nutrition ── */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#A7B1C2', display: 'block', mb: 1, mt: 1 }}>Nutrition (optional)</Typography>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Calories (kcal)"
                value={formData.nutrition?.calories || ''}
                onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, calories: e.target.value } })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Protein (g)"
                value={formData.nutrition?.protein || ''}
                onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, protein: e.target.value } })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* ── Section: Food Image (required) ── */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#A7B1C2', display: 'block', mb: 1, mt: 1 }}>Food Image</Typography>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '1px dashed rgba(148,163,184,0.35)', borderRadius: 3, p: 2, bgcolor: 'rgba(15,23,42,0.35)' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm="auto">
                    <Box sx={{ width: 160 }}>
                      {imagePreview ? (
                        <Box sx={{ width: 160, height: 110, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.3)' }}>
                          <Box component="img" src={imagePreview} alt="preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      ) : (
                        <Box sx={{ width: 160, height: 110, borderRadius: 2, border: `1px dashed ${formError ? 'rgba(239,68,68,0.6)' : 'rgba(148,163,184,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(15,23,42,0.45)' }}>
                          <MenuTabIcon sx={{ color: formError ? '#ef4444' : '#94A3B8', fontSize: 32 }} />
                        </Box>
                      )}
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        sx={{
                          mt: 1.25,
                          width: 176,
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          borderColor: 'rgba(148, 163, 184, 0.4)',
                          color: '#CBD5E1',
                          whiteSpace: 'nowrap',
                          '&:hover': { borderColor: 'rgba(148, 163, 184, 0.7)', bgcolor: 'rgba(148, 163, 184, 0.08)' }
                        }}
                      >
                        {imagePreview ? 'Change Image' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                            setFormError('');
                          }}
                        />
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm>
                    <Typography variant="body2" sx={{ color: '#CBD5E1', fontWeight: 600, mb: 0.75 }}>
                      Upload a menu image
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                      Recommended 1200x800. Max 5 MB · JPG, PNG, WEBP
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* ── Section: Dietary & Availability ── */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#A7B1C2', display: 'block', mb: 1, mt: 1 }}>Dietary Flags &amp; Availability</Typography>
              <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                <FormControlLabel control={<Switch checked={formData.isVegetarian} onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })} color="success" />} label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#CBD5E1' }}>Vegetarian</Typography>} />
                <FormControlLabel control={<Switch checked={formData.isVegan} onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })} color="success" />} label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#CBD5E1' }}>Vegan</Typography>} />
                <FormControlLabel control={<Switch checked={formData.isGlutenFree} onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })} color="warning" />} label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#CBD5E1' }}>Gluten Free</Typography>} />
                <FormControlLabel control={<Switch checked={formData.isAvailable} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} color="primary" />} label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#CBD5E1' }}>Available</Typography>} />
              </Box>
            </Grid>

          </Grid>
        </DialogContent>
        {formError && (
          <Alert severity="error" sx={{ mx: 3, mb: 0, borderRadius: 0, borderTop: '1px solid rgba(239,68,68,0.15)' }}>{formError}</Alert>
        )}
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }} variant="text" sx={{ textTransform: 'none', color: '#94A3B8', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveMenuItem} sx={{ background: '#2563EB', textTransform: 'none', fontWeight: 700, px: 3, borderRadius: 3, boxShadow: 'none', '&:hover': { background: '#1D4ED8' } }}>
            {currentItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DeleteIcon />
          Delete Menu Item
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ color: '#0f172a', mb: 1 }}>
            Are you sure you want to delete <strong>"{itemToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            This action cannot be undone. All associated sales data will be preserved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1, bgcolor: '#fef2f2', borderTop: '1px solid rgba(220,38,38,0.1)' }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteMenuItem} sx={{ textTransform: 'none', fontWeight: 700, px: 3, borderRadius: 2, boxShadow: 'none' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default VendorDashboard;
