import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import Layout from '../components/Layout.js';
import api from '../../../utils/api';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state;

  const handleDownloadTicket = async () => {
    if (!booking?.bookingRef) return;
    const response = await api.get(`/tickets/${booking.bookingRef}/pdf`, {
      responseType: 'blob'
    });

    const contentDisposition = response.headers?.['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    const filename = filenameMatch?.[1] || `ticket-${booking.bookingRef}.pdf`;
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!booking) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: { xs: 12, md: 16 } }}>
          <Paper sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              No booking details found
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3 }}>
              Please complete a booking from the events page.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/events')}>
              Go To Events
            </Button>
          </Paper>
        </Container>
      </Layout>
    );
  }

  const seats = booking.selectedSeats || [];

  return (
    <Layout>
      <Box
        sx={{
          minHeight: '100vh',
          pt: { xs: 10, md: 12 },
          pb: { xs: 8, md: 10 },
          background: 'radial-gradient(circle at 20% 10%, rgba(37,99,235,0.22), transparent 45%), radial-gradient(circle at 80% 90%, rgba(16,185,129,0.16), transparent 40%)'
        }}
      >
        <Container maxWidth="md">
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              border: '1px solid rgba(148,163,184,0.2)',
              background: 'linear-gradient(180deg, rgba(2,6,23,0.8), rgba(15,23,42,0.9))'
            }}
          >
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleRoundedIcon sx={{ color: '#22c55e', fontSize: 36 }} />
                <Box>
                  <Typography sx={{ color: '#22c55e', letterSpacing: 1.2, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    Booking Confirmed
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 900 }}>
                    {booking.eventTitle}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography sx={{ color: '#94a3b8', mb: 1.5, fontWeight: 700 }}>
                  Selected Seats
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {seats.map((seat) => (
                    <Chip
                      key={seat.seatNumber}
                      icon={<ConfirmationNumberIcon />}
                      label={`${seat.seatNumber} • ${seat.category}`}
                      sx={{
                        bgcolor: seat.category === 'VIP' ? '#7c3aed' : '#2563eb',
                        color: '#fff',
                        fontWeight: 700
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ borderTop: '1px solid rgba(148,163,184,0.2)', pt: 2 }}>
                <Typography sx={{ color: '#94a3b8', mb: 0.8 }}>Payment Method</Typography>
                <Typography sx={{ color: '#e2e8f0', fontWeight: 700, mb: 2 }}>{booking.paymentMethod}</Typography>

                {booking.bookingRef && (
                  <>
                    <Typography sx={{ color: '#94a3b8', mb: 0.8 }}>Booking Reference</Typography>
                    <Typography sx={{ color: '#e2e8f0', fontWeight: 700, mb: 2 }}>{booking.bookingRef}</Typography>
                  </>
                )}

                <Typography sx={{ color: '#94a3b8', mb: 0.8 }}>Total Amount</Typography>
                <Typography variant="h4" sx={{ color: '#22c55e', fontWeight: 900 }}>
                  Rs {Number(booking.totalAmount || 0).toLocaleString()}
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" size="large" onClick={() => navigate('/events')} sx={{ fontWeight: 700 }}>
                  Book More Seats
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleDownloadTicket}
                  disabled={!booking.bookingRef}
                  sx={{ fontWeight: 700 }}
                >
                  Download Ticket
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')} sx={{ fontWeight: 700 }}>
                  Go To Dashboard
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default BookingConfirmation;
