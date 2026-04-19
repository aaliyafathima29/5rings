import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Room as LocationIcon,
  MyLocation as MyLocationIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { foodAPI } from '../../utils/api';
import { connectSocket } from '../../utils/socket';

const statusChip = (status) => {
  if (status === 'assigned') return { label: 'Assigned', color: 'warning' };
  if (status === 'accepted') return { label: 'Accepted', color: 'info' };
  if (status === 'delivered') return { label: 'Delivered', color: 'success' };
  return { label: 'Pending', color: 'default' };
};

const formatTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

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

const cardSx = {
  mb: 2,
  borderRadius: 4,
  background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(2,6,23,0.92))',
  border: '1px solid rgba(148,163,184,0.1)',
  boxShadow: '0 12px 28px rgba(2,6,23,0.35)',
};

const sectionTitleSx = {
  color: '#E2E8F0',
  fontWeight: 800,
  mb: 1.5,
  letterSpacing: 0.4,
};

export default function DeliveryDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationDrafts, setLocationDrafts] = useState({});
  const [locationStatus, setLocationStatus] = useState({});
  const [chatDrafts, setChatDrafts] = useState({});
  const [liveTracking, setLiveTracking] = useState({});
  const [trackingMenu, setTrackingMenu] = useState({ anchorEl: null, orderId: null });
  const liveTrackers = useRef({});
  const liveLastSent = useRef({});

  const loadOrders = async () => {
    setError('');
    try {
      const res = await foodAPI.getDeliveryOrders({ status: 'out_for_delivery' });
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load delivery orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const socket = connectSocket(user?.role, user?.id || user?._id);
    socket.on('delivery_assignment', (order) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id);
        if (exists) return prev.map((o) => (o._id === order._id ? order : o));
        return [order, ...prev];
      });
    });

    socket.on('delivery_chat_message', (payload) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === payload.orderId
            ? { ...o, deliveryChat: [...(o.deliveryChat || []), payload] }
            : o
        )
      );
    });

    return () => {
      socket.off('delivery_assignment');
      socket.off('delivery_chat_message');
    };
  }, [user]);

  useEffect(() => {
    return () => {
      if (!navigator?.geolocation) return;
      Object.values(liveTrackers.current).forEach((watchId) => {
        navigator.geolocation.clearWatch(watchId);
      });
    };
  }, []);

  const setStatus = (orderId, next) => {
    setLocationStatus((prev) => ({ ...prev, [orderId]: next }));
  };

  const applyLocalLocation = (orderId, payload) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;
        const lastLocation = {
          ...(order.deliveryTracking?.lastLocation || {}),
          ...payload,
          updatedAt: payload.updatedAt || new Date().toISOString(),
        };
        return {
          ...order,
          deliveryTracking: {
            ...(order.deliveryTracking || {}),
            lastLocation,
          },
        };
      })
    );
  };

  const handleAccept = async (orderId) => {
    await foodAPI.acceptDeliveryOrder(orderId);
    handleStartLiveTracking(orderId);
    await loadOrders();
  };

  const handleLocationChange = (orderId, field, value) => {
    setLocationDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [field]: value,
      },
    }));
  };

  const handleUpdateLocation = async (orderId) => {
    const draft = locationDrafts[orderId] || {};
    const sendUpdate = async (payload) => {
      try {
        await foodAPI.updateDeliveryLocation(orderId, payload);
        applyLocalLocation(orderId, payload);
        setStatus(orderId, { type: 'success', message: 'Location updated.' });
        await loadOrders();
      } catch (err) {
        setStatus(orderId, { type: 'error', message: err.response?.data?.message || 'Location update failed.' });
      }
    };

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendUpdate({
            ...draft,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => sendUpdate(draft),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      return;
    }

    await sendUpdate(draft);
  };

  const handleUseLiveLocation = (orderId) => {
    if (!navigator?.geolocation) {
      setStatus(orderId, { type: 'error', message: 'Geolocation is not supported on this device.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ...(locationDrafts[orderId] || {}),
        };
        try {
          await foodAPI.updateDeliveryLocation(orderId, payload);
          applyLocalLocation(orderId, payload);
          setStatus(orderId, { type: 'success', message: 'Live location shared.' });
        } catch (err) {
          setStatus(orderId, { type: 'error', message: err.response?.data?.message || 'Live location failed.' });
        }
      },
      () => setStatus(orderId, { type: 'error', message: 'Location permission denied.' }),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  };

  const handleStartLiveTracking = (orderId) => {
    if (!navigator?.geolocation) {
      setStatus(orderId, { type: 'error', message: 'Geolocation is not supported on this device.' });
      return;
    }
    if (liveTrackers.current[orderId]) {
      setStatus(orderId, { type: 'info', message: 'Live tracking is already active.' });
      return;
    }
    handleUseLiveLocation(orderId);
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lastSent = liveLastSent.current[orderId] || 0;
        const now = Date.now();
        if (now - lastSent < 15000) return;
        liveLastSent.current[orderId] = now;
        const payload = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ...(locationDrafts[orderId] || {}),
        };
        try {
          await foodAPI.updateDeliveryLocation(orderId, payload);
          applyLocalLocation(orderId, payload);
          setStatus(orderId, { type: 'success', message: 'Live tracking update sent.' });
        } catch (err) {
          setStatus(orderId, { type: 'error', message: err.response?.data?.message || 'Live tracking failed.' });
        }
      },
      () => setStatus(orderId, { type: 'error', message: 'Location permission denied.' }),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    liveTrackers.current[orderId] = watchId;
    setLiveTracking((prev) => ({ ...prev, [orderId]: true }));
    setStatus(orderId, { type: 'info', message: 'Live tracking enabled.' });
  };

  const handleStopLiveTracking = (orderId) => {
    if (!navigator?.geolocation) return;
    const watchId = liveTrackers.current[orderId];
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      delete liveTrackers.current[orderId];
      delete liveLastSent.current[orderId];
      setLiveTracking((prev) => ({ ...prev, [orderId]: false }));
      setStatus(orderId, { type: 'info', message: 'Live tracking paused.' });
    }
  };

  const handleOpenTrackingMenu = (event, orderId) => {
    setTrackingMenu({ anchorEl: event.currentTarget, orderId });
  };

  const handleCloseTrackingMenu = () => {
    setTrackingMenu({ anchorEl: null, orderId: null });
  };

  const handleComplete = async (orderId) => {
    await foodAPI.completeDelivery(orderId);
    await loadOrders();
  };

  const handleChatChange = (orderId, value) => {
    setChatDrafts((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleSendChat = async (orderId) => {
    const message = (chatDrafts[orderId] || '').trim();
    if (!message) return;
    await foodAPI.postDeliveryChat(orderId, { message });
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? {
            ...o,
            deliveryChat: [
              ...(o.deliveryChat || []),
              {
                senderRole: 'delivery',
                senderId: user?.id || user?._id,
                message,
                sentAt: new Date().toISOString(),
              },
            ],
          }
          : o
      )
    );
    setChatDrafts((prev) => ({ ...prev, [orderId]: '' }));
  };

  const assignedOrders = useMemo(
    () => orders.filter((o) => o.deliveryStatus === 'assigned'),
    [orders]
  );
  const activeOrders = useMemo(
    () => orders.filter((o) => o.deliveryStatus === 'accepted'),
    [orders]
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ShippingIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#F8FAFC' }}>
              Delivery Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Manage assignments and provide live tracking updates
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.2}>
          <Chip
            label={`New assignments: ${assignedOrders.length}`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`Active deliveries: ${activeOrders.length}`}
            color="info"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Alert severity="info">Loading delivery orders...</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={sectionTitleSx}>
              New Assignments
            </Typography>
            {assignedOrders.length === 0 ? (
              <Alert severity="info">No new assignments.</Alert>
            ) : (
              assignedOrders.map((order) => {
                const chip = statusChip(order.deliveryStatus);
                return (
                  <Card key={order._id} elevation={0} sx={cardSx}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                          Order #{String(order._id).slice(-6).toUpperCase()}
                        </Typography>
                        <Chip label={chip.label} color={chip.color} size="small" />
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                        {order.items?.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                          ₹{order.totalAmount?.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          ETA: {order.deliveryEtaMinutes ? `${order.deliveryEtaMinutes} min` : 'Estimating'}
                        </Typography>
                      </Stack>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleAccept(order._id)}
                        sx={{ fontWeight: 700, py: 1.1, borderRadius: 2 }}
                      >
                        Accept Assignment
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={sectionTitleSx}>
              Active Deliveries
            </Typography>
            {activeOrders.length === 0 ? (
              <Alert severity="info">No active deliveries.</Alert>
            ) : (
              activeOrders.map((order) => {
                const chip = statusChip(order.deliveryStatus);
                const draft = locationDrafts[order._id] || {};
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
                const mapEmbedUrl = deliveryMapUrl
                  ? `${deliveryMapUrl}&output=embed`
                  : customerMapUrl
                  ? `${customerMapUrl}&output=embed`
                  : '';
                const isLive = Boolean(liveTracking[order._id]);
                const status = locationStatus[order._id];
                const canUseGeo = typeof navigator !== 'undefined' && !!navigator.geolocation;
                return (
                  <Card key={order._id} elevation={0} sx={cardSx}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                            Order #{String(order._id).slice(-6).toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {order.user?.name || '—'} · ETA {order.deliveryEtaMinutes ? `${order.deliveryEtaMinutes} min` : 'Estimating'}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={chip.label} color={chip.color} size="small" />
                          <IconButton size="small" onClick={(event) => handleOpenTrackingMenu(event, order._id)}>
                            <MoreIcon sx={{ color: '#94A3B8' }} />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Box
                        sx={{
                          borderRadius: 3,
                          border: '1px solid rgba(148,163,184,0.12)',
                          overflow: 'hidden',
                          bgcolor: 'rgba(2,6,23,0.6)',
                          mb: 1.5,
                        }}
                      >
                        <Box sx={{ position: 'relative', height: { xs: 180, md: 240 } }}>
                          {mapEmbedUrl ? (
                            <iframe
                              title={`order-${order._id}-map`}
                              src={mapEmbedUrl}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                            />
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(15,23,42,0.6)',
                                color: '#94A3B8',
                                fontWeight: 700,
                              }}
                            >
                              Map preview not available
                            </Box>
                          )}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              px: 1.2,
                              py: 0.5,
                              borderRadius: 999,
                              bgcolor: 'rgba(15,23,42,0.9)',
                              border: '1px solid rgba(148,163,184,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.8,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isLive ? '#22c55e' : '#475569',
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#E2E8F0' }}>
                              Live {isLive ? 'on' : 'off'}
                            </Typography>
                          </Box>
                        </Box>
                        <Grid container spacing={1.5} sx={{ p: 1.5 }}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                              Partner location
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                              {lastLocation?.city || '—'}, {lastLocation?.area || '—'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                              GPS: {formatCoordinates(lastLocation?.lat, lastLocation?.lng)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                              Destination
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                              {customerAddress || '—'}
                            </Typography>
                            {customerVenue && (
                              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                                {customerVenue}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                              Last ping
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                              {formatTime(lastLocation?.updatedAt)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                              Accuracy: {typeof lastLocation?.accuracy === 'number' ? `${Math.round(lastLocation.accuracy)} m` : '—'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
                        <Button
                          variant="contained"
                          onClick={(event) => handleOpenTrackingMenu(event, order._id)}
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                          Tracking actions
                        </Button>
                      </Stack>

                      {status?.message && (
                        <Alert severity={status.type || 'info'} sx={{ mb: 1.5 }}>
                          {status.message}
                        </Alert>
                      )}

                      <Menu
                        anchorEl={trackingMenu.anchorEl}
                        open={Boolean(trackingMenu.anchorEl) && trackingMenu.orderId === order._id}
                        onClose={handleCloseTrackingMenu}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleCloseTrackingMenu();
                            if (isLive) {
                              handleStopLiveTracking(order._id);
                            } else {
                              handleStartLiveTracking(order._id);
                            }
                          }}
                        >
                          {isLive ? 'Pause live tracking' : 'Start live tracking'}
                        </MenuItem>
                        <MenuItem
                          disabled={!deliveryMapUrl}
                          onClick={() => {
                            handleCloseTrackingMenu();
                            if (deliveryMapUrl) window.open(deliveryMapUrl);
                          }}
                        >
                          Open live map
                        </MenuItem>
                        <MenuItem
                          disabled={!customerMapUrl}
                          onClick={() => {
                            handleCloseTrackingMenu();
                            if (customerMapUrl) window.open(customerMapUrl);
                          }}
                        >
                          View destination
                        </MenuItem>
                        <MenuItem
                          disabled={!canUseGeo}
                          onClick={() => {
                            handleCloseTrackingMenu();
                            handleUseLiveLocation(order._id);
                          }}
                        >
                          Share location now
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleCloseTrackingMenu();
                            handleUpdateLocation(order._id);
                          }}
                        >
                          Update with draft
                        </MenuItem>
                      </Menu>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(148,163,184,0.12)' }} />
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="City (optional)"
                            value={draft.city || ''}
                            onChange={(e) => handleLocationChange(order._id, 'city', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Area (optional)"
                            value={draft.area || ''}
                            onChange={(e) => handleLocationChange(order._id, 'area', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleComplete(order._id)}
                            sx={{ fontWeight: 700, py: 1.1, borderRadius: 2 }}
                          >
                            Mark Delivered
                          </Button>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1.5, borderColor: 'rgba(148,163,184,0.12)' }} />
                          <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 1 }}>
                            Customer Chat
                          </Typography>
                          <Box sx={{ maxHeight: 140, overflowY: 'auto', pr: 1, mb: 1 }}>
                            {(order.deliveryChat || []).map((msg, idx) => (
                              <Box key={`${msg.sentAt}-${idx}`} sx={{ mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                  {msg.senderRole === 'delivery' ? 'You' : 'Customer'}
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
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Type a message"
                              value={chatDrafts[order._id] || ''}
                              onChange={(e) => handleChatChange(order._id, e.target.value)}
                            />
                            <Button
                              variant="contained"
                              onClick={() => handleSendChat(order._id)}
                              sx={{ fontWeight: 700, minWidth: 120, borderRadius: 2 }}
                            >
                              Send
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
