import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  TextField,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Paper,
  Stack,
} from '@mui/material';
import Layout from '../components/Layout.js';
import { useCart } from '../../../context/CartContext';
import { foodAPI, paymentAPI, SERVER_BASE } from '../../../utils/api';
import { useNotifications } from '../../../context/NotificationContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  // Checkout dialog state
  const [dialogOpen, setDialogOpen]             = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Request state
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (window.Razorpay || document.getElementById('razorpay-checkout-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // ── Open dialog (after auth check) ───────────────────────────────────────
  const handleCheckoutClick = () => {
    if (!localStorage.getItem('user')) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setDeliveryDetails((prev) => ({
      ...prev,
      fullName: prev.fullName || user?.name || '',
      phone: prev.phone || user?.phone || '',
      email: prev.email || user?.email || '',
    }));

    setError('');
    setFormErrors({});
    setCheckoutStep(1);
    setDialogOpen(true);
  };

  const validateStepOne = () => {
    const nextErrors = {};
    const requiredFields = {
      fullName: 'Full name is required',
      phone: 'Phone number is required',
      houseNo: 'House No is required',
      street: 'Street is required',
      area: 'Area is required',
      city: 'City is required',
      state: 'State is required',
      pincode: 'Pincode is required',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!deliveryDetails[field]?.trim()) {
        nextErrors[field] = message;
      }
    });

    if (deliveryDetails.phone && !/^\d{10}$/.test(deliveryDetails.phone.trim())) {
      nextErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (deliveryDetails.pincode && !/^\d{6}$/.test(deliveryDetails.pincode.trim())) {
      nextErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    if (deliveryDetails.email && !/^\S+@\S+\.\S+$/.test(deliveryDetails.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildOrderPayload = (paymentData) => ({
    vendorId: cartItems[0]?.vendorId || cartItems[0]?.vendor,
    items: cartItems.map((item) => ({
      menuItemId: item._id,
      quantity: item.quantity,
    })),
    specialInstructions: specialInstructions.trim(),
    userDetails: {
      fullName: deliveryDetails.fullName.trim(),
      phone: deliveryDetails.phone.trim(),
      email: deliveryDetails.email.trim(),
    },
    address: {
      houseNo: deliveryDetails.houseNo.trim(),
      street: deliveryDetails.street.trim(),
      area: deliveryDetails.area.trim(),
      city: deliveryDetails.city.trim(),
      state: deliveryDetails.state.trim(),
      pincode: deliveryDetails.pincode.trim(),
    },
    deliveryLocation: {
      venue: [
        deliveryDetails.houseNo,
        deliveryDetails.street,
        deliveryDetails.area,
        deliveryDetails.city,
        deliveryDetails.state,
        deliveryDetails.pincode,
      ].filter(Boolean).join(', '),
    },
    payment: paymentData,
  });

  const handlePlaceCodOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = buildOrderPayload({
        provider: 'cod',
        method: 'COD',
        amount: Number(getCartTotal().toFixed(2)),
        status: 'COD',
      });

      const res = await foodAPI.createOrder(payload);
      if (res.data.success) {
        const order = res.data.order;
        const orderRef = `#${String(order._id).slice(-6).toUpperCase()}`;
        const itemSummary = order.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ') || '';

        addNotification({
          type: 'order_placed',
          title: `Order Placed ${orderRef} 🧾`,
          message: `${itemSummary} · ₹${order.totalAmount?.toFixed(2)} — Cash on Delivery`,
          severity: 'success',
          emoji: '🧾',
          data: order,
        });

        setSuccessMessage('Order placed successfully with Cash on Delivery');
        setSuccess(true);
        setDialogOpen(false);
        clearCart();
        setTimeout(() => navigate('/dashboard'), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place COD order.');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit order to backend ───────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay checkout is not available. Please refresh and try again.');
      }

      const totalAmount = Number(getCartTotal().toFixed(2));
      const orderRes = await paymentAPI.createOrder(totalAmount);
      const orderData = orderRes.data || {};

      if (!orderData.order_id) {
        throw new Error(orderData.message || 'Failed to initialize payment order.');
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const paymentResult = await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: orderData.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID,
          order_id: orderData.order_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: '5Rings Kitchen',
          description: 'Food Order Payment',
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          notes: {
            module: 'food',
            items: cartItems.map((item) => `${item.name}x${item.quantity}`).join(', '),
          },
          theme: { color: '#2563EB' },
          handler: (response) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error('Payment was cancelled.')),
          },
        });

        razorpay.on('payment.failed', (resp) => {
          const reason = resp?.error?.description || resp?.error?.reason || 'Payment failed in Razorpay checkout.';
          reject(new Error(reason));
        });

        razorpay.open();
      });

      const payload = buildOrderPayload({
        provider: 'razorpay',
        method: 'RAZORPAY',
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_signature: paymentResult.razorpay_signature,
        amount: totalAmount,
        status: 'PAID',
      });

      const res = await foodAPI.createOrder(payload);

      if (res.data.success) {
        const order = res.data.order;
        const orderRef = `#${String(order._id).slice(-6).toUpperCase()}`;
        const itemSummary = order.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ') || '';

        addNotification({
          type: 'order_placed',
          title: `Order Placed ${orderRef} ✅`,
          message: `${itemSummary} · ₹${order.totalAmount?.toFixed(2)} — Paid Online`,
          severity: 'success',
          emoji: '✅',
          data: order,
        });

        setSuccessMessage('Payment successful, order confirmed');
        setSuccess(true);
        setDialogOpen(false);
        clearCart();
        setTimeout(() => navigate('/dashboard'), 2500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      {/* Hero */}
      <Box
        sx={{
          color: '#F8FAFC',
          py: { xs: 5, md: 8 },
          textAlign: 'center',
          background:
            'radial-gradient(1000px 420px at 15% -10%, rgba(59,130,246,0.24), transparent 60%), radial-gradient(900px 420px at 85% 0%, rgba(16,185,129,0.18), transparent 55%), #0B1120',
        }}
      >
        <Container maxWidth="md">
          <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 800, letterSpacing: 6, textTransform: 'uppercase', color: '#FBBF24', mb: 2.5, mt: 0.5, opacity: 0.95 }}>
            5Rings Kitchen
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', md: '4rem' }, letterSpacing: -2, lineHeight: 1 }}>
            Shopping Cart
          </Typography>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#0B1120', minHeight: '60vh', py: 5 }}>
        <Container maxWidth="lg">
          {success && (
            <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
              {successMessage || 'Order placed successfully! Redirecting to your dashboard...'}
            </Alert>
          )}

          {cartItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <ShoppingCartIcon sx={{ fontSize: 72, color: '#cbd5e1', mb: 3 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#E2E8F0', mb: 1 }}>
                Your cart is empty
              </Typography>
              <Typography sx={{ color: '#94A3B8', mb: 4 }}>
                Add some delicious items from our menu.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/food')}
                sx={{ bgcolor: '#2563EB', borderRadius: 2, px: 4, py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#1D4ED8' } }}
              >
                Browse Menu
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>

              {/* ── Cart Items ── */}
              <Box sx={{ flex: 2 }}>
                <Box sx={{ bgcolor: 'rgba(15,23,42,0.85)', borderRadius: 3, border: '1px solid rgba(148,163,184,0.18)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(2,6,23,0.45)' }}>
                  {cartItems.map((item, index) => (
                    <React.Fragment key={item._id || item.id}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, p: { xs: 2.5, sm: 3 }, gap: { xs: 2, sm: 2.5 } }}>
                        
                        {/* Upper Row: Image + Details */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, minWidth: 0 }}>
                          {/* Image */}
                          {item.image ? (
                            <Box
                              component="img"
                              src={`${SERVER_BASE}${item.image}`}
                              alt={item.name}
                              sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <Box sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: 'rgba(148,163,184,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <RestaurantMenuIcon sx={{ fontSize: 32, color: '#94A3B8' }} />
                            </Box>
                          )}

                          {/* Name + Price */}
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#F8FAFC', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#F8FAFC' }}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                              ₹{item.price.toFixed(2)} each
                            </Typography>
                          </Box>
                        </Box>

                        {/* Lower Row / Right Side: Qty controls + Delete */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                          {/* Qty controls */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: '1px solid rgba(148,163,184,0.25)', borderRadius: 2, px: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              sx={{ color: '#CBD5E1' }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem', minWidth: 24, textAlign: 'center', color: '#F8FAFC' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                              sx={{ color: '#CBD5E1' }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* Delete */}
                          <IconButton
                            onClick={() => removeFromCart(item._id || item.id)}
                            sx={{ color: '#F87171', bgcolor: { xs: 'rgba(248,113,113,0.12)', sm: 'transparent' }, p: { xs: 1.5, sm: 1 }, borderRadius: 2, '&:hover': { bgcolor: 'rgba(248,113,113,0.2)' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                      </Box>
                      {index < cartItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>

              {/* ── Order Summary ── */}
              <Box sx={{ flex: 1, position: { md: 'sticky' }, top: 24 }}>
                <Box sx={{ bgcolor: 'rgba(15,23,42,0.9)', borderRadius: 3, border: '1px solid rgba(148,163,184,0.18)', p: 3.5, boxShadow: '0 20px 60px rgba(2,6,23,0.45)' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#F8FAFC', mb: 2.5 }}>
                    Order Summary
                  </Typography>
                  <Divider sx={{ mb: 2.5, borderColor: 'rgba(148,163,184,0.2)' }} />

                  <Box sx={{ mb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {cartItems.map((item) => (
                      <Box key={item._id || item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.9rem', color: '#CBD5E1' }}>
                          {item.name} <span style={{ color: '#94a3b8' }}>× {item.quantity}</span>
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#E2E8F0' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ mb: 2.5, borderColor: 'rgba(148,163,184,0.2)' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '1.1rem' }, color: '#E2E8F0' }}>Total</Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.2rem', sm: '1.4rem' }, color: '#F8FAFC' }}>
                      ₹{getCartTotal().toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartCheckoutIcon />}
                    onClick={handleCheckoutClick}
                    disabled={success}
                    sx={{ bgcolor: '#2563EB', borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1rem', mb: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}
                  >
                    Checkout
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/food')}
                    sx={{ borderColor: 'rgba(148,163,184,0.4)', color: '#CBD5E1', borderRadius: 2, py: 1.5, fontWeight: 600, '&:hover': { borderColor: '#93C5FD', color: '#E2E8F0', bgcolor: 'transparent' } }}
                  >
                    Continue Shopping
                  </Button>
                </Box>
              </Box>

            </Box>
          )}
        </Container>
      </Box>

      {/* ── Checkout Dialog ──────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => !loading && setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>Checkout</Typography>
          <Stack direction="row" spacing={1.5}>
            <Paper sx={{ px: 1.5, py: 0.75, borderRadius: 2, bgcolor: checkoutStep === 1 ? '#DBEAFE' : 'rgba(148,163,184,0.12)' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: checkoutStep === 1 ? '#1D4ED8' : '#64748B' }}>
                Step 1: Delivery Details
              </Typography>
            </Paper>
            <Paper sx={{ px: 1.5, py: 0.75, borderRadius: 2, bgcolor: checkoutStep === 2 ? '#DBEAFE' : 'rgba(148,163,184,0.12)' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: checkoutStep === 2 ? '#1D4ED8' : '#64748B' }}>
                Step 2: Payment
              </Typography>
            </Paper>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {checkoutStep === 1 ? (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={deliveryDetails.fullName}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, fullName: e.target.value }))}
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, phone: e.target.value }))}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email (optional)"
                    fullWidth
                    value={deliveryDetails.email}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, email: e.target.value }))}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="House No"
                    fullWidth
                    value={deliveryDetails.houseNo}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, houseNo: e.target.value }))}
                    error={!!formErrors.houseNo}
                    helperText={formErrors.houseNo}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Street"
                    fullWidth
                    value={deliveryDetails.street}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, street: e.target.value }))}
                    error={!!formErrors.street}
                    helperText={formErrors.street}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Area"
                    fullWidth
                    value={deliveryDetails.area}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, area: e.target.value }))}
                    error={!!formErrors.area}
                    helperText={formErrors.area}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    fullWidth
                    value={deliveryDetails.city}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, city: e.target.value }))}
                    error={!!formErrors.city}
                    helperText={formErrors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State"
                    fullWidth
                    value={deliveryDetails.state}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, state: e.target.value }))}
                    error={!!formErrors.state}
                    helperText={formErrors.state}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Pincode"
                    fullWidth
                    value={deliveryDetails.pincode}
                    onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, pincode: e.target.value }))}
                    error={!!formErrors.pincode}
                    helperText={formErrors.pincode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Special Instructions (optional)"
                    fullWidth
                    multiline
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Allergies, no spice, extra sauce..."
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(37,99,235,0.18)', mb: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Delivery Summary</Typography>
                <Typography sx={{ color: '#475569', fontSize: '0.92rem' }}>
                  {deliveryDetails.fullName} • {deliveryDetails.phone}
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: '0.9rem', mt: 0.5 }}>
                  {[deliveryDetails.houseNo, deliveryDetails.street, deliveryDetails.area, deliveryDetails.city, deliveryDetails.state, deliveryDetails.pincode].filter(Boolean).join(', ')}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(16,185,129,0.2)', mb: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Pay Online using Razorpay</Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 2 }}>
                  Secure test payment. On success, order will be marked as PAID.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  {loading ? 'Processing...' : `Pay Now — ₹${getCartTotal().toFixed(2)}`}
                </Button>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(245,158,11,0.25)' }}>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>Cash on Delivery</Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 2 }}>
                  Place order directly. Payment status will be COD.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handlePlaceCodOrder}
                  disabled={loading}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  {loading ? 'Placing...' : `Place Order — ₹${getCartTotal().toFixed(2)}`}
                </Button>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          {checkoutStep === 1 ? (
            <Button
              variant="contained"
              onClick={() => {
                if (validateStepOne()) {
                  setCheckoutStep(2);
                }
              }}
              disabled={loading}
            >
              Continue to Payment
            </Button>
          ) : (
            <Button variant="outlined" onClick={() => setCheckoutStep(1)} disabled={loading}>
              Back to Details
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Cart;
