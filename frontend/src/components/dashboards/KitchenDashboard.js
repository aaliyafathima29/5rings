import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Badge,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Slide,
  alpha,
  Collapse,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
  DoneAll as DoneAllIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Pending as PendingIcon,
  DeliveryDining as DeliveryIcon,
  NotificationsActive as NotifIcon,
  Notifications as BellIcon,
  DoneAll as MarkReadIcon,
  DeleteSweep as ClearIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { foodAPI } from '../../utils/api';
import { connectSocket } from '../../utils/socket';
import { useNotifications } from '../../context/NotificationContext';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  placed:           { label: 'Placed',          color: 'warning',  next: 'confirmed',        nextLabel: 'Confirm Order',   icon: <PendingIcon /> },
  confirmed:        { label: 'Confirmed',       color: 'info',     next: 'preparing',        nextLabel: 'Start Preparing', icon: <CheckCircleIcon /> },
  preparing:        { label: 'Preparing',       color: 'primary',  next: 'ready',            nextLabel: 'Mark Ready',      icon: <FireIcon /> },
  ready:            { label: 'Ready',           color: 'success',  next: 'out_for_delivery', nextLabel: 'Dispatch Order',  icon: <DoneAllIcon /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'info',     next: null,               nextLabel: null,             icon: <DeliveryIcon /> },
  delivered:        { label: 'Delivered',       color: 'default',  next: null,               nextLabel: null,             icon: <DeliveryIcon /> },
  cancelled:        { label: 'Cancelled',       color: 'error',    next: null,               nextLabel: null,             icon: <CancelIcon /> },
};

const ORDER_TABS = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
const NOTIF_TAB_INDEX = ORDER_TABS.length; // 4

// ── Severity → colour ───────────────────────────────────────────────────────
const SEV_COLOR = { warning: '#F97316', success: '#10B981', info: '#3B82F6', error: '#EF4444' };

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

// ── OrderTableRow sub-component ──────────────────────────────────────────────
const OrderTableRow = ({ order, onUpdateStatus, showActions }) => {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAdvance = async () => {
    if (!cfg.next) return;
    setLoading(true);
    await onUpdateStatus(order._id, cfg.next);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setLoading(true);
    await onUpdateStatus(order._id, 'cancelled');
    setLoading(false);
  };

  const borderColor = {
    placed: '#f59e0b', confirmed: '#3b82f6', preparing: '#6366f1',
    ready: '#10b981', delivered: '#059669', cancelled: '#ef4444',
  }[order.status] || '#94a3b8';

  const colSpan = showActions ? 10 : 9;

  return (
    <>
      <TableRow
        hover
        onClick={() => setExpanded(!expanded)}
        sx={{
          cursor: 'pointer',
          borderLeft: `4px solid ${borderColor}`,
          bgcolor: expanded ? alpha(borderColor, 0.04) : 'transparent',
          '&:hover': { bgcolor: alpha(borderColor, 0.06) },
          '& td': { borderBottom: expanded ? 'none' : undefined },
        }}
      >
        {/* Expand toggle */}
        <TableCell sx={{ py: 1, px: 1, width: 40 }}>
          <IconButton size="small" sx={{ color: '#94a3b8' }}>
            {expanded ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>

        {/* Order ID */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title={`Full ID: ${order._id}`} placement="right">
          <Box>
            <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: borderColor, fontSize: '0.85rem', lineHeight: 1.2, letterSpacing: 0.5 }}>
              #{order._id.slice(-8).toUpperCase()}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.65rem' }}>
              {order._id.slice(0, 8)}…
            </Typography>
          </Box>
          </Tooltip>
        </TableCell>

        {/* Customer */}
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{order.user?.name || 'Guest'}</Typography>
          {order.user?.email && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{order.user.email}</Typography>}
          {order.user?.phone && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem' }}>&#128222; {order.user.phone}</Typography>}
        </TableCell>

        {/* Items summary */}
        <TableCell sx={{ maxWidth: 220 }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {order.items.map((i) => `×${i.quantity} ${i.name}`).join(', ')}
          </Typography>
          <Typography variant="caption" color="text.secondary">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Typography>
        </TableCell>

        {/* Total */}
        <TableCell sx={{ fontWeight: 900, whiteSpace: 'nowrap', color: '#F8FAFC', fontSize: '0.95rem' }}>
          ₹{order.totalAmount?.toFixed(2)}
        </TableCell>

        {/* Seat / Section */}
        <TableCell>
          <Stack spacing={0.4}>
            {order.deliveryLocation?.seatNumber && (
              <Chip label={`🪑 ${order.deliveryLocation.seatNumber}`} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
            )}
            {order.deliveryLocation?.section && (
              <Chip label={`§ ${order.deliveryLocation.section}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
            )}
            {!order.deliveryLocation?.seatNumber && <Typography variant="caption" color="text.disabled">—</Typography>}
          </Stack>
        </TableCell>

        {/* Special instructions */}
        <TableCell sx={{ maxWidth: 160 }}>
          {order.specialInstructions
            ? <Tooltip title={order.specialInstructions}><Typography variant="caption" sx={{ color: '#0ea5e9', fontStyle: 'italic', display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>📝 {order.specialInstructions}</Typography></Tooltip>
            : <Typography variant="caption" color="text.disabled">—</Typography>}
        </TableCell>

        {/* Ordered at */}
        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#64748b' }}>
          {formatDate(order.orderDate)}<br />{formatTime(order.orderDate)}
        </TableCell>

        {/* Status */}
        <TableCell>
          <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
        </TableCell>

        {/* Actions */}
        {showActions && (
          <TableCell onClick={(e) => e.stopPropagation()}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
              {cfg.next && (
                <Button
                  size="small"
                  variant="contained"
                  color={cfg.color}
                  onClick={handleAdvance}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={12} color="inherit" /> : cfg.icon}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', px: 1, borderRadius: 1.5, boxShadow: 'none', whiteSpace: 'nowrap' }}
                >
                  {cfg.nextLabel}
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleCancel}
                disabled={loading}
                sx={{ textTransform: 'none', fontSize: '0.72rem', px: 1, borderRadius: 1.5, whiteSpace: 'nowrap' }}
              >
                Cancel
              </Button>
            </Stack>
          </TableCell>
        )}
      </TableRow>

      {/* Expandable detail row */}
      <TableRow sx={{ bgcolor: alpha(borderColor, 0.03) }}>
        <TableCell colSpan={colSpan} sx={{ py: 0, px: 0, border: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, borderTop: `1px dashed ${alpha(borderColor, 0.3)}`, display: 'flex', gap: 3, flexWrap: 'wrap' }}>

              {/* Items breakdown */}
              <Box sx={{ flex: '1 1 280px', minWidth: 220 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: '#64748b', display: 'block', mb: 1 }}>
                  Items Breakdown
                </Typography>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.05)', fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: 1, py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.08)' } }}>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Unit</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item, idx) => (
                        <TableRow key={idx} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#F8FAFC' }, '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.name}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.78rem' }}>{item.quantity}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>₹{item.price}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.78rem', fontWeight: 800 }}>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <TableCell colSpan={3} sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#F8FAFC' }}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#10B981' }}>₹{order.totalAmount?.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Box>

              {/* Order info + Timeline */}
              <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: '#64748b', display: 'block', mb: 1 }}>
                  Order Info
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  {order.event?.title && <Typography variant="caption">🏙️ Event: <b>{order.event.title}</b></Typography>}
                  {order.vendor?.name && <Typography variant="caption">🛒 Vendor: <b>{order.vendor.vendorProfile?.kitchenName || order.vendor.name}</b></Typography>}
                  {order.kitchen?.name && <Typography variant="caption">👨‍🍳 Kitchen: <b>{order.kitchen.name}</b></Typography>}
                  <Typography variant="caption">📝 Order placed: <b>{new Date(order.orderDate).toLocaleString()}</b></Typography>
                </Stack>

                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: '#64748b', display: 'block', mb: 0.8 }}>
                  Timeline
                </Typography>
                <Stack spacing={0.5}>
                  {[
                    ['#f59e0b', '📥 Placed',    order.orderDate],
                    ['#3b82f6', '✅ Confirmed', order.confirmedAt],
                    ['#6366f1', '🔥 Preparing', order.preparedAt],
                    ['#10b981', '🍽️ Ready',    order.readyAt],
                    ['#059669', '🚀 Delivered', order.deliveredAt],
                  ].filter(([, , ts]) => ts).map(([color, label, ts]) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                      <Typography variant="caption"><b>{label}</b> — {new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} {formatDate(ts)}</Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Rating */}
                {order.rating?.food && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: '#64748b', display: 'block', mb: 0.5 }}>Rating</Typography>
                    <Typography variant="caption" display="block">🍽️ Food: <b>{'⭐'.repeat(order.rating.food)}</b> ({order.rating.food}/5)</Typography>
                    {order.rating.service && <Typography variant="caption" display="block">🤝 Service: <b>{'⭐'.repeat(order.rating.service)}</b> ({order.rating.service}/5)</Typography>}
                    {order.rating.comment && <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>"{order.rating.comment}"</Typography>}
                  </Box>
                )}
              </Box>

            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ── Notifications Panel ──────────────────────────────────────────────────────
const NotificationsPanel = () => {
  const { notifications, unreadCount, markAllRead, clearAll, markRead } = useNotifications();

  // Filter to kitchen-relevant notifications (new orders)
  const kitchenNotifs = notifications.filter((n) => n.type === 'new_order');

  return (
    <Box>
      {/* Panel header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <BellIcon color="warning" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Order Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} unread`} color="warning" size="small" />
          )}
        </Stack>
        {kitchenNotifs.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Mark all read">
              <Button size="small" startIcon={<MarkReadIcon />} onClick={markAllRead} variant="outlined">
                Mark read
              </Button>
            </Tooltip>
            <Tooltip title="Clear all">
              <Button size="small" startIcon={<ClearIcon />} onClick={clearAll} variant="outlined" color="error">
                Clear
              </Button>
            </Tooltip>
          </Stack>
        )}
      </Box>

      {kitchenNotifs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
          <BellIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6">No notifications yet</Typography>
          <Typography variant="body2" color="text.secondary">
            New order notifications will appear here in real-time
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {kitchenNotifs.map((n) => (
            <Paper
              key={n.id}
              elevation={0}
              onClick={() => markRead(n.id)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: n.read ? 'divider' : 'warning.main',
                borderLeft: '4px solid',
                borderLeftColor: n.read
                  ? 'divider'
                  : (SEV_COLOR[n.severity] || '#F97316'),
                bgcolor: n.read ? 'transparent' : alpha(SEV_COLOR[n.severity] || '#F97316', 0.05),
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ fontSize: 28, lineHeight: 1.2, mt: 0.2 }}>{n.emoji || '🛎️'}</Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: n.read ? 500 : 800, color: n.read ? 'text.primary' : 'warning.dark' }}
                    >
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                      {n.message}
                    </Typography>
                    {n.data?.deliveryLocation?.seatNumber && (
                      <Chip
                        label={`🪑 Seat ${n.data.deliveryLocation.seatNumber} · Section ${n.data.deliveryLocation.section || '—'}`}
                        size="small"
                        sx={{ mt: 0.5 }}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 70, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(n.timestamp)}
                  </Typography>
                  {!n.read && (
                    <Box
                      sx={{
                        width: 8, height: 8,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        ml: 'auto', mt: 0.5,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [incomingOrder, setIncomingOrder] = useState(null);
  const prevPlacedIds = useRef(new Set());
  const loadOrdersRef  = useRef(null);

  // Access the notification context for badge on Notifications tab
  const { unreadCount, markAllRead } = useNotifications();

  // ── Socket: real-time new order popup ────────────────────────────────────
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const socket = connectSocket(storedUser.role || 'kitchen', storedUser.id || storedUser._id);

    socket.on('new_order', (order) => {
      setIncomingOrder(order);        // show popup dialog
      setTabIndex(0);                 // jump to Placed tab
      loadOrdersRef.current?.(false); // refresh order list
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🍽️ New Order #${String(order._id).slice(-6).toUpperCase()}`, {
          body: `From ${order.user?.name || 'Guest'} · ₹${order.totalAmount?.toFixed(2)}`,
          icon: '/favicon.ico',
        });
      }
    });

    return () => {
      socket.off('new_order');
      // Note: do NOT call disconnectSocket() here — logout in Dashboard.js handles cleanup
    };
  }, []);

  // Request browser notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mark all notifications as read when Notifications tab is opened
  useEffect(() => {
    if (tabIndex === NOTIF_TAB_INDEX) {
      markAllRead();
    }
  }, [tabIndex, markAllRead]);

  const fireBrowserNotification = (count) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🍽️ ${count} new order${count > 1 ? 's' : ''} received!`, {
        body: 'Open the Kitchen Dashboard to confirm.',
        icon: '/favicon.ico',
      });
    }
  };

  const loadOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError('');
    try {
      const res = await foodAPI.getKitchenOrders({ all: 'true' });
      const fetchedOrders = res.data.orders || [];

      const currentPlaced    = fetchedOrders.filter((o) => o.status === 'placed');
      const currentPlacedIds = new Set(currentPlaced.map((o) => o._id));

      if (!isInitial) {
        const newIds = [...currentPlacedIds].filter((id) => !prevPlacedIds.current.has(id));
        if (newIds.length > 0) {
          setNewOrderAlert({ count: newIds.length });
          fireBrowserNotification(newIds.length);
          setTabIndex(0);
        }
      }

      prevPlacedIds.current = currentPlacedIds;
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);
  loadOrdersRef.current = loadOrders;

  useEffect(() => {
    loadOrders(true);
    const interval = setInterval(() => loadOrders(false), 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await foodAPI.updateOrderStatus(orderId, newStatus);
      setSuccessMsg(`Order marked as ${newStatus}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadOrders(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  // Counts per tab
  const countByStatus = ORDER_TABS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const currentStatus   = ORDER_TABS[tabIndex];
  const filteredOrders  = orders.filter((o) => o.status === currentStatus);
  const activeCount     = orders.filter((o) => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;
  const deliveredToday  = orders.filter((o) => {
    if (o.status !== 'delivered') return false;
    const d = new Date(o.deliveredAt);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  }).length;


  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header card */}
      <Card
        elevation={0}
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)', 
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
                <RestaurantIcon sx={{ fontSize: 40, color: '#10B981' }} />
                <Typography variant="h3" className="text-gradient" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Kitchen Dashboard
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 450 }}>
                Manage live orders • Track preparation • Ensure quality
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {/* Active stat box */}
              <Box sx={{ textAlign: 'center', px: 3, py: 2, borderRadius: 3, bgcolor: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', backdropFilter: 'blur(8px)', minWidth: 100 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>{activeCount}</Typography>
                <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mt: 0.5 }}>Active</Typography>
              </Box>
              {/* Delivered today stat box */}
              <Box sx={{ textAlign: 'center', px: 3, py: 2, borderRadius: 3, bgcolor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(8px)', minWidth: 100 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981', lineHeight: 1 }}>{deliveredToday}</Typography>
                <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mt: 0.5 }}>Today</Typography>
              </Box>
              <Tooltip title="Refresh orders">
                <IconButton onClick={() => loadOrders(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', transform: 'rotate(180deg)' }, transition: 'all 0.5s ease' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </CardContent>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, right: 120, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </Card>

      {/* Alerts */}
      {newOrderAlert && (
        <Alert
          severity="warning"
          icon={<NotifIcon />}
          sx={{ mb: 2, fontWeight: 700, fontSize: 16,
            animation: 'pulse 1s ease-in-out 3',
            '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
          }}
          onClose={() => setNewOrderAlert(null)}
        >
          🍽️ {newOrderAlert.count} new order{newOrderAlert.count > 1 ? 's' : ''} just came in! Showing the <strong>Placed</strong> tab.
        </Alert>
      )}
      {error     && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

      {/* ── Status tabs + Notifications tab ─── */}
      <Paper className="glass-panel" elevation={0} sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', bgcolor: 'transparent' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
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
              '&.Mui-selected': { color: '#6366f1' }
            },
            '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          {/* Order status tabs */}
          {ORDER_TABS.map((s) => {
            const dotColor = { placed: '#f59e0b', confirmed: '#3b82f6', preparing: '#6366f1', ready: '#10b981' }[s] || '#94a3b8';
            return (
              <Tab
                key={s}
                label={
                  <Badge badgeContent={countByStatus[s]} color={STATUS_CONFIG[s].color} showZero={false}>
                    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ px: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }} />
                      <Box>{STATUS_CONFIG[s].label}</Box>
                    </Stack>
                  </Badge>
                }
              />
            );
          })}

          {/* 🔔 Notifications tab */}
          <Tab
            label={
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
                  <BellIcon sx={{ fontSize: 16 }} />
                  <Box>Notifications</Box>
                </Stack>
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* ── Notifications panel (index 6) ───── */}
      {tabIndex === NOTIF_TAB_INDEX ? (
        <Paper elevation={0} className="glass-panel-static" sx={{ p: 3, borderRadius: 2 }}>
          <NotificationsPanel />
        </Paper>
      ) : (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mt: 10, gap: 2 }}>
              <CircularProgress size={52} sx={{ color: '#6366f1' }} />
              <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>Loading orders…</Typography>
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Paper elevation={0} className="glass-panel-static" sx={{ borderRadius: 2, py: 8, textAlign: 'center' }}>
              {React.cloneElement(STATUS_CONFIG[currentStatus]?.icon || <RestaurantIcon />, { sx: { fontSize: 56, color: '#e2e8f0', mb: 2, display: 'block', mx: 'auto' } })}
              <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 700, mb: 0.5 }}>
                No {STATUS_CONFIG[currentStatus]?.label} orders
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                {{
                  placed:    'New orders will appear here in real-time',
                  confirmed: 'Confirm incoming orders to see them here',
                  preparing: 'Start preparing confirmed orders to see them here',
                  ready:     'Mark orders ready to see them here',
                }[currentStatus] || 'No orders in this status'}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} className="glass-panel-static" sx={{ borderRadius: 2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', color: '#94A3B8', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' } }}>
                    <TableCell sx={{ width: 40, bgcolor: 'rgba(255,255,255,0.01)' }} />
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Seat / Section</TableCell>
                    <TableCell>Instructions</TableCell>
                    <TableCell>Ordered At</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <OrderTableRow
                      key={order._id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      showActions={true}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* ── Real-time New Order Popup ─────────────────────────────────────── */}
      <Dialog
        open={!!incomingOrder}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, border: '3px solid', borderColor: 'warning.main' } }}
      >
        {incomingOrder && (
          <>
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg,#ff6f00,#ffa726)',
                color: 'white',
                fontWeight: 800,
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <NotifIcon
                sx={{
                  animation: 'shake 0.4s ease infinite alternate',
                  '@keyframes shake': { from: { transform: 'rotate(-15deg)' }, to: { transform: 'rotate(15deg)' } },
                }}
              />
              New Order #{String(incomingOrder._id).slice(-6).toUpperCase()}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <b>From:</b> {incomingOrder.user?.name || 'Guest'}
                {incomingOrder.user?.phone ? ` · 📞 ${incomingOrder.user.phone}` : ''}
              </Typography>
              {incomingOrder.deliveryLocation?.seatNumber && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  🪑 Seat <b>{incomingOrder.deliveryLocation.seatNumber}</b>
                  {incomingOrder.deliveryLocation?.section ? ` · Section ${incomingOrder.deliveryLocation.section}` : ''}
                </Typography>
              )}
              <List dense disablePadding sx={{ bgcolor: 'grey.50', borderRadius: 2, px: 1, mb: 1 }}>
                {(incomingOrder.items || []).map((item, i) => (
                  <ListItem key={i} disableGutters>
                    <ListItemText
                      primary={`×${item.quantity} ${item.name}`}
                      secondary={`₹${(item.price * item.quantity).toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'right' }}>
                Total: ₹{incomingOrder.totalAmount?.toFixed(2)}
              </Typography>
              {incomingOrder.specialInstructions && (
                <Alert severity="info" sx={{ mt: 1 }} icon={false}>
                  📝 {incomingOrder.specialInstructions}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={async () => {
                  await handleUpdateStatus(incomingOrder._id, 'confirmed');
                  setIncomingOrder(null);
                }}
                startIcon={<CheckCircleIcon />}
              >
                Confirm Order
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                  await handleUpdateStatus(incomingOrder._id, 'cancelled');
                  setIncomingOrder(null);
                }}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
            </DialogActions>
            <Box sx={{ pb: 1, px: 2 }}>
              <Button
                size="small"
                fullWidth
                onClick={() => setIncomingOrder(null)}
                sx={{ color: 'text.secondary' }}
              >
                Dismiss (handle later from dashboard)
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </Container>
  );
}
