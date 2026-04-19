import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Rating,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
  DoneAll as DoneAllIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  DeliveryDining as DeliveryIcon,
  HourglassTop as WaitingIcon,
  Star as StarIcon,
  Call as CallIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { foodAPI } from '../../utils/api';
import { connectSocket } from '../../utils/socket';

// ── Status meta ───────────────────────────────────────────────────────────────
const STATUS = {
  placed:           { label: 'Waiting for Kitchen', color: 'warning', icon: <WaitingIcon />, progress: 10, active: true },
  confirmed:        { label: 'Order Confirmed',     color: 'info',    icon: <CheckCircleIcon />, progress: 30, active: true },
  preparing:        { label: 'Preparing',           color: 'primary', icon: <FireIcon />, progress: 55, active: true },
  ready:            { label: 'Ready for Pickup',    color: 'success', icon: <DoneAllIcon />, progress: 80, active: true },
  out_for_delivery: { label: 'Out for Delivery',    color: 'success', icon: <DeliveryIcon />, progress: 90, active: true },
  delivered:        { label: 'Delivered',           color: 'default', icon: <DeliveryIcon />, progress: 100, active: false },
  cancelled:        { label: 'Cancelled',           color: 'error',   icon: <CancelIcon />, progress: 0, active: false },
};

const ACTIVE_STATUSES = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

const formatCoordinates = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return '—';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

const buildMapUrl = ({ lat, lng, address }) => {
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
  }
  return '';
};

// ── Single order card ─────────────────────────────────────────────────────────
function OrderStatusCard({ order, cancelDisabled = false }) {
  const cfg = STATUS[order.status] || STATUS.placed;
  const isUserCancellable = ['placed', 'confirmed'].includes(order.status);
  const [chatDraft, setChatDraft] = useState('');
  const lastLocation = order.deliveryTracking?.lastLocation;
  const customerAddress = [
    order.address?.street,
    order.address?.area,
    order.address?.city,
    order.address?.state,
    order.address?.pincode,
  ]
    .filter(Boolean)
    .join(', ');
  const customerVenue = [
    order.deliveryLocation?.venue,
    order.deliveryLocation?.section,
    order.deliveryLocation?.seatNumber,
  ]
    .filter(Boolean)
    .join(' · ');
  const deliveryMapUrl = buildMapUrl({ lat: lastLocation?.lat, lng: lastLocation?.lng });
  const customerMapUrl = buildMapUrl({ address: customerAddress });

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid',
        borderColor: cfg.active ? `${cfg.color}.main` : 'rgba(255, 255, 255, 0.1)',
        mb: 2.5,
        overflow: 'visible',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.2)' }
      }}
    >
      {/* Active pulse ring */}
      {cfg.active && (
        <Box
          sx={{
            position: 'absolute',
            top: -4, right: -4,
            width: 16, height: 16,
            borderRadius: '50%',
            bgcolor: `${cfg.color}.main`,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%,100%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.6)', opacity: 0.4 },
            },
          }}
        />
      )}

      <CardContent sx={{ pb: '12px !important' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
            Order #{String(order._id).slice(-6).toUpperCase()}
          </Typography>
          <Chip
            label={cfg.label}
            color={cfg.color}
            size="small"
            icon={cfg.icon}
          />
        </Box>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={cfg.progress}
          color={cfg.color === 'default' ? 'inherit' : cfg.color}
          sx={{ borderRadius: 4, height: 6, mb: 1.5 }}
        />

        {/* Items */}
        <Typography variant="caption" color="#94A3B8" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
          {order.items?.map((i) => `${i.name} ×${i.quantity}`).join(' · ')}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 900, color: '#F8FAFC' }}>
            ₹{order.totalAmount?.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: cfg.active ? (cfg.color === 'warning' ? '#f59e0b' : '#60A5FA') : '#475569' }}>
            {cfg.active ? '● Processing' : '● Completed'}
          </Typography>
        </Box>
        {order.deliveryPartner && (
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, border: '1px solid rgba(148,163,184,0.2)', bgcolor: 'rgba(15,23,42,0.7)' }}>
            <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 0.5 }}>
              Delivery Partner
            </Typography>
            <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
              {order.deliveryPartner?.name || 'Assigned'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
              {order.deliveryPartner?.phone || 'Phone not available'}
            </Typography>
            {order.deliveryPartner?.phone && (
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CallIcon />}
                    onClick={() => window.open(`tel:${order.deliveryPartner.phone}`)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Call Partner
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ChatIcon />}
                    onClick={() => window.open(`https://wa.me/${String(order.deliveryPartner.phone).replace(/[^\d]/g, '')}`)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Message Partner
                  </Button>
                </Stack>
              </Box>
            )}
            <Divider sx={{ my: 1, borderColor: 'rgba(148,163,184,0.2)' }} />
            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(2,6,23,0.55)', border: '1px solid rgba(148,163,184,0.16)' }}>
              <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 0.5 }}>
                Live Tracking
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                Partner location: {lastLocation?.city || '—'}, {lastLocation?.area || '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                GPS: {formatCoordinates(lastLocation?.lat, lastLocation?.lng)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                Last update: {lastLocation?.updatedAt ? new Date(lastLocation.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                ETA: {order.deliveryEtaMinutes ? `${order.deliveryEtaMinutes} min` : 'Estimating'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!deliveryMapUrl}
                  onClick={() => window.open(deliveryMapUrl)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  View live map
                </Button>
              </Stack>
              <Divider sx={{ my: 1.2, borderColor: 'rgba(148,163,184,0.2)' }} />
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                Your destination: {customerAddress || '—'}
              </Typography>
              {customerVenue && (
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                  {customerVenue}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!customerMapUrl}
                  onClick={() => window.open(customerMapUrl)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Open destination
                </Button>
              </Stack>
            </Box>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(148,163,184,0.2)' }} />
            <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 1 }}>
              Delivery Chat
            </Typography>
            <Box sx={{ maxHeight: 140, overflowY: 'auto', pr: 1 }}>
              {(order.deliveryChat || []).map((msg, idx) => (
                <Box key={`${msg.sentAt}-${idx}`} sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {msg.senderRole === 'delivery' ? 'Delivery Partner' : 'You'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#F8FAFC' }}>
                    {msg.message}
                  </Typography>
                </Box>
              ))}
              {(order.deliveryChat || []).length === 0 && (
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  No messages yet.
                </Typography>
              )}
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message"
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (!chatDraft.trim()) return;
                  order.onSendChat?.(chatDraft.trim());
                  setChatDraft('');
                }}
                sx={{ fontWeight: 700 }}
              >
                Send
              </Button>
            </Stack>
          </Box>
        )}
        {isUserCancellable && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={order.onCancel}
              disabled={cancelDisabled}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Cancel Order
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyFoodOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, severity }
  const [ratingDialog, setRatingDialog] = useState({ open: false, orderId: null, food: 0, service: 0, comment: '' });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null });

  const loadOrders = useCallback(async () => {
    try {
      const res = await foodAPI.getUserOrders();
      setOrders(res.data.orders || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitRating = async () => {
    if (!ratingDialog.food) return;
    setRatingSubmitting(true);
    try {
      await foodAPI.rateOrder(ratingDialog.orderId, {
        food: ratingDialog.food,
        service: ratingDialog.service || null,
        comment: ratingDialog.comment.trim(),
      });
          setToast({ message: 'Thank you for rating your order.', severity: 'success' });
      setRatingDialog({ open: false, orderId: null, food: 0, service: 0, comment: '' });
      loadOrders(); // refresh to reflect rated
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit rating', severity: 'error' });
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    setCancelDialog({ open: true, orderId });
  };

  const handleConfirmCancel = async () => {
    if (!cancelDialog.orderId) return;
    setCancelingId(cancelDialog.orderId);
    try {
      await foodAPI.cancelOrder(cancelDialog.orderId);
      setToast({ message: 'Order cancelled successfully.', severity: 'success' });
      loadOrders();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to cancel order', severity: 'error' });
    } finally {
      setCancelingId(null);
      setCancelDialog({ open: false, orderId: null });
    }
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ── Socket: listen for status updates ──────────────────────────────────────
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    const socket = connectSocket(user.role, userId);

    socket.on('order_status_updated', (updatedOrder) => {
      let previousStatus = null;
      setOrders((prev) => {
        const existing = prev.find((o) => o._id === updatedOrder._id);
        previousStatus = existing?.status || null;
        if (!existing) return [updatedOrder, ...prev];
        return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      });

      const orderRef = `#${String(updatedOrder._id).slice(-6).toUpperCase()}`;

      if (previousStatus && previousStatus === updatedOrder.status) return;

      if (updatedOrder.status === 'confirmed') {
        setToast({
          message: `Order ${orderRef} confirmed. Kitchen is getting ready.`,
          severity: 'success',
        });
      } else if (updatedOrder.status === 'preparing') {
        setToast({ message: `Kitchen is now preparing your order ${orderRef}.`, severity: 'info' });
      } else if (updatedOrder.status === 'ready') {
        setToast({ message: `Order ${orderRef} is ready for delivery.`, severity: 'success' });
      } else if (updatedOrder.status === 'out_for_delivery') {
        setToast({ message: `Order ${orderRef} is out for delivery.`, severity: 'info' });
      } else if (updatedOrder.status === 'delivered') {
        setToast({ message: `Order ${orderRef} delivered.`, severity: 'success' });
      } else if (updatedOrder.status === 'cancelled') {
        setToast({ message: `Order ${orderRef} was cancelled by the kitchen.`, severity: 'error' });
      }
    });

    socket.on('delivery_chat_message', (payload) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === payload.orderId);
        if (!exists) return prev;
        return prev.map((o) =>
          o._id === payload.orderId
            ? { ...o, deliveryChat: [...(o.deliveryChat || []), payload] }
            : o
        );
      });
    });

    socket.on('delivery_tracking_update', (payload) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === payload.orderId);
        if (!exists) return prev;
        return prev.map((o) =>
          o._id === payload.orderId
            ? {
              ...o,
              deliveryTracking: payload.deliveryTracking || o.deliveryTracking,
              deliveryEtaMinutes: payload.deliveryEtaMinutes ?? o.deliveryEtaMinutes,
              deliveryEtaUpdatedAt: payload.deliveryEtaUpdatedAt ?? o.deliveryEtaUpdatedAt,
            }
            : o
        );
      });
    });

    return () => {
      socket.off('order_status_updated');
      socket.off('delivery_chat_message');
      socket.off('delivery_tracking_update');
    };
  }, [user]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders   = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Toast notification */}
      <Snackbar
        open={!!toast}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={toast?.severity || 'info'}
          onClose={() => setToast(null)}
          sx={{ fontWeight: 600, borderRadius: 2, boxShadow: 4 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, orderId: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#0f172a' } }}
      >
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800 }}>Cancel order?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>
            This action cannot be undone once the kitchen starts preparing.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCancelDialog({ open: false, orderId: null })}
            sx={{ color: '#94A3B8', fontWeight: 700 }}
          >
            Keep Order
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={!!cancelingId}
            sx={{ fontWeight: 800 }}
          >
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Active orders */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <RestaurantIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
          <Typography variant="h5" className="text-gradient" sx={{ fontWeight: 900 }}>
            Active Orders
          </Typography>
          {activeOrders.length > 0 && (
            <Chip 
              label={activeOrders.length} 
              size="small" 
              sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 900, border: '1px solid rgba(245, 158, 11, 0.2)' }} 
            />
          )}
        </Stack>

        {activeOrders.length === 0 ? (
          <Alert severity="info" icon={<PendingIcon />}>
            No active orders right now. Visit the Food page to place one!
          </Alert>
        ) : (
          activeOrders.map((o) => (
            <OrderStatusCard
              key={o._id}
              order={{
                ...o,
                onCancel: () => handleCancelOrder(o._id),
                onSendChat: async (message) => {
                  try {
                    await foodAPI.postDeliveryChat(o._id, { message });
                  } catch (err) {
                    setToast({ message: err.response?.data?.message || 'Failed to send message', severity: 'error' });
                  }
                },
              }}
              cancelDisabled={cancelingId === o._id}
            />
          ))
        )}
      </Box>

      {/* Past orders */}
      {pastOrders.length > 0 && (
        <Box>
          <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800, color: '#F8FAFC', letterSpacing: 1 }}>
            ORDER HISTORY
          </Typography>
          <List dense disablePadding>
            {pastOrders.slice(0, 5).map((o) => {
              const cfg = STATUS[o.status] || STATUS.delivered;
              const canRate = o.status === 'delivered' && !o.rating?.food;
              return (
                <ListItem
                  key={o._id}
                  disableGutters
                  sx={{ borderBottom: '1px solid', borderColor: 'rgba(255, 255, 255, 0.04)', py: 1.5 }}
                  secondaryAction={
                    canRate ? (
                      <Button
                        size="small"
                        startIcon={<StarIcon />}
                        onClick={() => setRatingDialog({ open: true, orderId: o._id, food: 0, service: 0, comment: '' })}
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#f59e0b', fontSize: '0.75rem' }}
                      >
                        Rate
                      </Button>
                    ) : o.rating?.food ? (
                      <Rating value={o.rating.food} size="small" readOnly />
                    ) : null
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                          #{String(o._id).slice(-6).toUpperCase()}
                        </Typography>
                        <Chip 
                          label={cfg.label} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontWeight: 700, color: '#94A3B8', borderColor: 'rgba(255, 255, 255, 0.1)' }} 
                        />
                      </Box>
                    }
                    secondary={`${o.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ')} · ₹${o.totalAmount?.toFixed(2)}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
}
