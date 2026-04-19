import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SportsIcon from '@mui/icons-material/Sports';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import api, { paymentAPI } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

export default function Workshops() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedCoachProgram, setSelectedCoachProgram] = useState(null);
  const [coachDialogOpen, setCoachDialogOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [upiRef, setUpiRef] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/programs', { params: { active: 'true' } });
        setPrograms(response.data?.programs || []);
      } catch (err) {
        console.error('Failed to load workshops:', err);
        setError('Unable to load workshops right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  useEffect(() => {
    if (window.Razorpay || document.getElementById('razorpay-checkout-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const filteredPrograms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return programs.filter((program) => {
      const matchesSearch =
        !query ||
        program.title?.toLowerCase().includes(query) ||
        program.description?.toLowerCase().includes(query) ||
        program.sport?.toLowerCase().includes(query);
      const matchesLevel = level === 'all' || program.level === level;
      return matchesSearch && matchesLevel;
    });
  }, [programs, search, level]);

  const openCheckout = (program) => {
    if (!user) {
      navigate('/login', { state: { from: '/workshops' } });
      return;
    }
    setSelectedProgram(program);
    setPaymentMethod('RAZORPAY');
    setUpiRef('');
    setNotice({ type: '', message: '' });
    setCheckoutOpen(true);
  };

  const openCoachDialog = (program) => {
    setSelectedCoachProgram(program);
    setCoachDialogOpen(true);
  };

  const normalizeList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };

  const enrollWithPayment = async (program, payment) => {
    try {
      setBookingLoading(true);
      await api.post('/enrollments', {
        programId: program._id,
        startDate: new Date().toISOString(),
        payment,
      });

      setPrograms((prev) => prev.map((p) => (
        p._id === program._id
          ? { ...p, enrolled: Number(p.enrolled || 0) + 1 }
          : p
      )));

      setCheckoutOpen(false);
      setNotice({ type: 'success', message: 'Workshop booked successfully.' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to book workshop.';
      setNotice({ type: 'error', message });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedProgram) return;

    if (paymentMethod === 'UPI') {
      if (upiRef.trim().length < 6) {
        setNotice({ type: 'error', message: 'Enter a valid UPI reference (min 6 chars).' });
        return;
      }

      await enrollWithPayment(selectedProgram, {
        provider: 'upi',
        method: 'UPI',
        status: 'PENDING_VERIFICATION',
        amount: Number(selectedProgram.price || 0),
        transactionId: upiRef.trim(),
      });
      return;
    }

    try {
      setBookingLoading(true);
      setNotice({ type: '', message: '' });

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout is not available. Refresh and try again.');
      }

      const amount = Number(selectedProgram.price || 0);
      const orderRes = await paymentAPI.createOrder(amount);
      const orderData = orderRes.data || {};

      if (!orderData.order_id) {
        throw new Error(orderData.message || 'Failed to initialize payment.');
      }

      const paymentResult = await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: orderData.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID,
          order_id: orderData.order_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: '5Rings Workshops',
          description: selectedProgram.title,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          notes: {
            module: 'workshops',
            programId: selectedProgram._id,
            programTitle: selectedProgram.title,
          },
          theme: { color: '#0ea5e9' },
          handler: (response) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled.')),
          },
        });

        razorpay.on('payment.failed', (resp) => {
          const reason = resp?.error?.description || 'Payment failed. Please try again.';
          reject(new Error(reason));
        });

        razorpay.open();
      });

      await enrollWithPayment(selectedProgram, {
        provider: 'razorpay',
        method: 'RAZORPAY',
        status: 'PAID',
        amount,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });
    } catch (err) {
      setNotice({ type: 'error', message: err?.message || 'Booking failed. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          pt: { xs: 10, md: 12 },
          pb: { xs: 8, md: 10 },
          minHeight: '100vh',
          background:
            'radial-gradient(1200px 420px at 15% -10%, rgba(14,165,233,0.2), transparent 60%), radial-gradient(900px 420px at 95% 0%, rgba(34,197,94,0.14), transparent 55%), #050B1A',
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid rgba(148,163,184,0.16)',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.68))',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: '#F8FAFC',
                  letterSpacing: -0.8,
                  fontSize: { xs: '2rem', md: '2.7rem' },
                }}
              >
                Coach Workshops
              </Typography>
            </Box>
          </Paper>

          {notice.message ? (
            <Alert severity={notice.type || 'info'} sx={{ mb: 3 }}>
              {notice.message}
            </Alert>
          ) : null}

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.14)',
              background: 'rgba(15, 23, 42, 0.52)',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, sport or description"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    color: '#F8FAFC',
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                select
                size="small"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                SelectProps={{ native: true }}
                sx={{
                  minWidth: { xs: '100%', sm: 200 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    color: '#F8FAFC',
                    borderRadius: 2,
                  },
                }}
              >
                <option value="all">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </TextField>
            </Stack>
          </Paper>

          {loading ? (
            <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredPrograms.length === 0 ? (
            <Alert severity="info">No workshops found for the selected filters.</Alert>
          ) : (
            <Grid container spacing={2.5}>
              {filteredPrograms.map((program) => (
                <Grid item xs={12} md={6} key={program._id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      background: 'linear-gradient(160deg, rgba(15,23,42,0.88), rgba(15,23,42,0.72))',
                      border: '1px solid rgba(148,163,184,0.18)',
                      boxShadow: '0 12px 28px rgba(2,6,23,0.38)',
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'rgba(14,165,233,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FitnessCenterIcon sx={{ color: '#7DD3FC', fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 800, lineHeight: 1.3 }}>
                          {program.title}
                        </Typography>
                      </Stack>

                      <Typography sx={{ color: '#CBD5E1', mb: 2, minHeight: 48 }}>
                        {program.description}
                      </Typography>

                      <Typography sx={{ color: '#93C5FD', fontSize: '0.92rem', fontWeight: 700, mb: 1.3 }}>
                        Coach: {program.coach?.name || 'Coach details unavailable'}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        <Chip icon={<SportsIcon />} label={program.sport || 'Sport'} size="small" sx={{ bgcolor: 'rgba(148,163,184,0.14)', color: '#E2E8F0' }} />
                        <Chip label={program.level || 'Level'} size="small" sx={{ bgcolor: 'rgba(148,163,184,0.14)', color: '#E2E8F0' }} />
                        <Chip icon={<PersonIcon />} label={`${program.enrolled || 0}/${program.maxStudents || 0} seats`} size="small" sx={{ bgcolor: 'rgba(148,163,184,0.14)', color: '#E2E8F0' }} />
                        <Chip icon={<AccessTimeIcon />} label={`${program.duration?.weeks || 0} weeks`} size="small" sx={{ bgcolor: 'rgba(148,163,184,0.14)', color: '#E2E8F0' }} />
                        <Chip icon={<StarIcon />} label={`${Number(program.rating?.average || 0).toFixed(1)} (${Number(program.rating?.count || 0)} reviews)`} size="small" sx={{ bgcolor: 'rgba(245,158,11,0.18)', color: '#FDE68A' }} />
                      </Stack>

                      {program.publicReviews?.[0]?.feedback ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: 'rgba(148,163,184,0.08)',
                            border: '1px solid rgba(148,163,184,0.18)',
                          }}
                        >
                          <Typography sx={{ color: '#CBD5E1', fontSize: '0.82rem', lineHeight: 1.5 }}>
                            "{program.publicReviews[0].feedback}"
                          </Typography>
                          <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', mt: 0.6 }}>
                            - {program.publicReviews[0].studentName}, {Number(program.publicReviews[0].score || 0).toFixed(1)}★
                          </Typography>
                        </Paper>
                      ) : null}

                      <Divider sx={{ my: 1.5, borderColor: 'rgba(148,163,184,0.16)' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 30 }}>
                        <Typography sx={{ color: '#F8FAFC', fontWeight: 800, fontSize: '1.15rem' }}>
                          ₹{Number(program.price || 0).toLocaleString()}
                        </Typography>
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} sx={{ width: '100%' }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => openCoachDialog(program)}
                          sx={{ fontWeight: 700, borderRadius: 2.5, py: 1.1, borderColor: 'rgba(147,197,253,0.4)', color: '#BFDBFE' }}
                        >
                          Coach Details
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={bookingLoading || (program.enrolled || 0) >= (program.maxStudents || 0)}
                          onClick={() => openCheckout(program)}
                          sx={{ fontWeight: 800, borderRadius: 2.5, py: 1.1 }}
                        >
                          {(program.enrolled || 0) >= (program.maxStudents || 0)
                              ? 'Fully Booked'
                              : 'Book Workshop'}
                        </Button>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Dialog
        open={checkoutOpen}
        onClose={() => !bookingLoading && setCheckoutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid rgba(148,163,184,0.2)',
            bgcolor: '#0F172A',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800 }}>
          Confirm Workshop Booking
        </DialogTitle>
        <DialogContent>
          {selectedProgram ? (
            <Stack spacing={1.5}>
              <Typography sx={{ color: '#CBD5E1' }}>
                <b>{selectedProgram.title}</b>
              </Typography>
              <Typography sx={{ color: '#CBD5E1' }}>
                Amount: <b>₹{Number(selectedProgram.price || 0).toLocaleString()}</b>
              </Typography>

              <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)' }} />

              <Typography sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                Select payment method
              </Typography>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <FormControlLabel value="RAZORPAY" control={<Radio />} label="Razorpay (Card/UPI/NetBanking)" sx={{ color: '#CBD5E1' }} />
                <FormControlLabel value="UPI" control={<Radio />} label="Manual UPI Reference" sx={{ color: '#CBD5E1' }} />
              </RadioGroup>

              {paymentMethod === 'UPI' ? (
                <TextField
                  label="UPI Transaction Reference"
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  placeholder="Enter UTR / transaction reference"
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { color: '#F8FAFC' }, '& .MuiInputLabel-root': { color: '#94A3B8' } }}
                />
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCheckoutOpen(false)} disabled={bookingLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmBooking} disabled={bookingLoading}>
            {bookingLoading ? 'Processing...' : 'Pay & Book'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={coachDialogOpen}
        onClose={() => setCoachDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid rgba(148,163,184,0.2)',
            bgcolor: '#0F172A',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800, pb: 1.2 }}>
          Coach Profile
        </DialogTitle>
        <DialogContent>
          {selectedCoachProgram ? (
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid rgba(148,163,184,0.2)',
                  bgcolor: 'rgba(15,23,42,0.7)',
                }}
              >
                <Typography sx={{ color: '#F8FAFC', fontWeight: 800, fontSize: '1.2rem', mb: 0.5 }}>
                  {selectedCoachProgram.coach?.name || 'Coach'}
                </Typography>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.92rem' }}>
                  Workshop Coach
                </Typography>
              </Paper>

              <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)' }} />

              <Typography sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                Specialization
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {normalizeList(selectedCoachProgram.coach?.coachProfile?.specialization).length > 0 ? (
                  normalizeList(selectedCoachProgram.coach?.coachProfile?.specialization).map((item) => (
                    <Chip key={item} label={item} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.18)', color: '#BFDBFE' }} />
                  ))
                ) : (
                  <Typography sx={{ color: '#94A3B8' }}>No specialization details shared yet.</Typography>
                )}
              </Stack>

              <Typography sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                Experience
              </Typography>
              <Typography sx={{ color: '#CBD5E1', fontWeight: 600 }}>
                {Number(selectedCoachProgram.coach?.coachProfile?.experience || 0) > 0
                  ? `${selectedCoachProgram.coach.coachProfile.experience} years`
                  : 'Not specified'}
              </Typography>

              <Typography sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                Certifications
              </Typography>
              <Typography sx={{ color: '#CBD5E1' }}>
                {normalizeList(selectedCoachProgram.coach?.coachProfile?.certifications).length > 0
                  ? normalizeList(selectedCoachProgram.coach?.coachProfile?.certifications).join(', ')
                  : 'Not specified'}
              </Typography>

              <Typography sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                Bio
              </Typography>
              <Typography sx={{ color: '#CBD5E1', lineHeight: 1.7 }}>
                {selectedCoachProgram.coach?.coachProfile?.bio || 'No coach bio available.'}
              </Typography>

              <Typography sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                Student Feedback
              </Typography>
              {selectedCoachProgram.publicReviews?.length > 0 ? (
                <Stack spacing={1}>
                  {selectedCoachProgram.publicReviews.slice(0, 5).map((review, index) => (
                    <Paper
                      key={`${review.studentName}-${index}-${review.ratedAt || ''}`}
                      elevation={0}
                      sx={{
                        p: 1.3,
                        borderRadius: 2,
                        bgcolor: 'rgba(148,163,184,0.08)',
                        border: '1px solid rgba(148,163,184,0.16)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
                        <FormatQuoteIcon sx={{ fontSize: 14, color: '#93C5FD' }} />
                        <Typography sx={{ color: '#FCD34D', fontSize: '0.82rem', fontWeight: 700 }}>
                          {Number(review.score || 0).toFixed(1)}★
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#CBD5E1', fontSize: '0.86rem', lineHeight: 1.5 }}>
                        {review.feedback || 'Student left a rating without text feedback.'}
                      </Typography>
                      <Typography sx={{ color: '#94A3B8', fontSize: '0.76rem', mt: 0.6 }}>
                        - {review.studentName}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ color: '#94A3B8' }}>
                  No student feedback available yet.
                </Typography>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCoachDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
