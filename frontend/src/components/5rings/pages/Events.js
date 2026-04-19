import React, { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Stack,
  Paper,
  Tab,
  Tabs,
  Rating,
  Divider,
  alpha,
  styled,
  Switch
} from '@mui/material';
import Layout from '../components/Layout.js';
import {
  CalendarToday,
  LocationOn,
  EmojiEvents,
  Search,
  ConfirmationNumber,
  Stadium,
  ViewModule as ViewModuleIcon,
  CalendarMonth as CalendarIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  Map as MapIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import api from '../../../utils/api';
import { paymentAPI } from '../../../utils/api';

// Styled components
const StyledEventCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.06)',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s, transform 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.2)',
    '& .event-image': {
      transform: 'scale(1.05)'
    }
  }
}));

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openBooking, setOpenBooking] = useState(false);
  const [openQuickView, setOpenQuickView] = useState(false);
  const [savedEvents, setSavedEvents] = useState([]);
  const [bookingData, setBookingData] = useState({
    category: '',
    seatNumber: '',
    mealCombo: false
  });
  const [seatLayout, setSeatLayout] = useState({ vipSeats: [], regularSeats: [] });
  const [bookedSeatIds, setBookedSeatIds] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isPaying, setIsPaying] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingErrors, setBookingErrors] = useState({});
  const [bookingContact, setBookingContact] = useState({
    fullName: '',
    phone: '',
    email: '',
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [upiRef, setUpiRef] = useState('');
  const [upiQrError, setUpiQrError] = useState(false);
  const upiId = process.env.REACT_APP_EVENT_UPI_ID || 'fiveringevents@upi';
  const upiQrImage = process.env.REACT_APP_UPI_QR_IMAGE || '/qrcode.jpeg';
  const navigate = useNavigate();

  const parseSeatCount = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const buildSeatIds = (prefix, count) => Array.from({ length: count }, (_, idx) => `${prefix}${idx + 1}`);

  const getSeatLayout = (event) => {
    const vipCount = parseSeatCount(
      event?.vipSeatCount ?? event?.seatConfig?.vipSeatCount ?? event?.seatConfig?.vip,
      20
    );
    const regularCount = parseSeatCount(
      event?.regularSeatCount ?? event?.seatConfig?.regularSeatCount ?? event?.seatConfig?.normal,
      100
    );

    return {
      vipSeats: buildSeatIds('A', vipCount).map((id) => ({ id, category: 'VIP' })),
      regularSeats: buildSeatIds('B', regularCount).map((id) => ({ id, category: 'Normal' }))
    };
  };

  const getPriceMap = (event) => {
    const categories = event?.ticketCategories || [];
    const byName = (needleList) => categories.find((cat) => needleList.some((needle) => (cat.name || '').toLowerCase().includes(needle)))?.price;

    const minPrice = categories.length
      ? Math.min(...categories.map((cat) => Number(cat.price) || 0).filter((n) => n > 0))
      : 0;

    const maxPrice = categories.length
      ? Math.max(...categories.map((cat) => Number(cat.price) || 0).filter((n) => n > 0))
      : 0;

    const regularPrice = Number(byName(['regular', 'normal', 'general'])) || minPrice || 499;
    const vipPrice = Number(byName(['vip', 'diamond', 'premium'])) || maxPrice || Math.round(regularPrice * 1.8);

    return {
      VIP: vipPrice,
      Normal: regularPrice
    };
  };

  const getSeatStorageKey = (eventId) => `event-booked-seats:${eventId}`;

  const downloadTicketPdf = async (ticketId) => {
    if (!ticketId) return;

    const response = await api.get(`/tickets/${ticketId}/pdf`, {
      responseType: 'blob'
    });

    const contentDisposition = response.headers?.['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    const filename = filenameMatch?.[1] || `ticket-${ticketId}.pdf`;
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

  const getLocalBookedSeats = (eventId) => {
    if (!eventId) return [];
    try {
      const raw = localStorage.getItem(getSeatStorageKey(eventId));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const saveLocalBookedSeats = (eventId, seatIds) => {
    if (!eventId) return;
    localStorage.setItem(getSeatStorageKey(eventId), JSON.stringify(seatIds));
  };

  const getBookedSeats = (event, layout) => {
    const allIds = [...layout.vipSeats, ...layout.regularSeats].map((seat) => seat.id);
    const backendBooked = Array.isArray(event?.bookedSeats)
      ? event.bookedSeats
      : Array.isArray(event?.seatMap?.booked)
        ? event.seatMap.booked
        : [];

    const localBooked = getLocalBookedSeats(event?._id);
    const merged = [...backendBooked, ...localBooked];
    const uniqueBooked = [...new Set(merged)];

    return uniqueBooked.filter((seatId) => allIds.includes(seatId));
  };

  const allSeats = useMemo(() => [...seatLayout.vipSeats, ...seatLayout.regularSeats], [seatLayout]);

  const selectedSeatDetails = useMemo(
    () => selectedSeats.map((seatId) => allSeats.find((seat) => seat.id === seatId)).filter(Boolean),
    [selectedSeats, allSeats]
  );

  const priceMap = useMemo(() => getPriceMap(selectedEvent), [selectedEvent]);

  const ticketSubtotal = useMemo(
    () => selectedSeatDetails.reduce((sum, seat) => sum + (priceMap[seat.category] || 0), 0),
    [selectedSeatDetails, priceMap]
  );

  const mealComboTotal = useMemo(
    () => (bookingData.mealCombo ? selectedSeatDetails.length * 200 : 0),
    [bookingData.mealCombo, selectedSeatDetails]
  );

  const grandTotal = ticketSubtotal + mealComboTotal;

  const eventTypes = ['All', 'match', 'tournament', 'workshop', 'camp', 'training'];
  const sports = ['All', 'Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Athletics', 'Boxing', 'Wrestling'];

  useEffect(() => {
    fetchEvents();
    loadSavedEvents();
  }, [statusFilter]);

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

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, sportFilter, typeFilter, dateFilter]);

  const loadSavedEvents = () => {
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      setSavedEvents(JSON.parse(saved));
    }
  };

  const toggleSaveEvent = (eventId) => {
    const newSaved = savedEvents.includes(eventId)
      ? savedEvents.filter(id => id !== eventId)
      : [...savedEvents, eventId];
    
    setSavedEvents(newSaved);
    localStorage.setItem('savedEvents', JSON.stringify(newSaved));
  };

  const shareEvent = async (event) => {
    if (navigator.share) {
      await navigator.share({
        title: event.title || event.name,
        text: `Join this exciting event: ${event.title || event.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `Check out this event: ${event.title || event.name} - ${window.location.href}`
      );
      alert('Event link copied to clipboard!');
    }
  };

  const openQuickViewDialog = (event) => {
    setSelectedEvent(event);
    setOpenQuickView(true);
  };

  const fetchEvents = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const response = await api.get('/events', { params });
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    const normalizeToken = (value) =>
      (value || '')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    if (searchTerm) {
      filtered = filtered.filter(e =>
        (e.title || e.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sportFilter && sportFilter !== 'All') {
      const selectedSport = normalizeToken(sportFilter);
      filtered = filtered.filter(e => normalizeToken(e.sport).includes(selectedSport));
    }

    if (typeFilter && typeFilter !== 'All') {
      const selectedType = normalizeToken(typeFilter);
      filtered = filtered.filter(e =>
        normalizeToken(e.eventType || e.type).includes(selectedType)
      );
    }

    // Date range filtering
    if (dateFilter.from) {
      filtered = filtered.filter(e => new Date(e.startDate) >= new Date(dateFilter.from));
    }
    if (dateFilter.to) {
      filtered = filtered.filter(e => new Date(e.startDate) <= new Date(dateFilter.to));
    }

    // Keep active/upcoming events on top and move ended/completed events down.
    filtered.sort((a, b) => {
      const aEnded = isEventEnded(a);
      const bEnded = isEventEnded(b);

      if (aEnded !== bEnded) {
        return aEnded ? 1 : -1;
      }

      const aStart = new Date(a.startDate || 0).getTime() || 0;
      const bStart = new Date(b.startDate || 0).getTime() || 0;

      // Upcoming first by nearest date; ended section by latest first.
      return aEnded ? bStart - aStart : aStart - bStart;
    });

    setFilteredEvents(filtered);
  };

  const handleBookTicket = (event) => {
    if (isEventEnded(event)) {
      return;
    }

    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userRaw || '{}');
    const layout = getSeatLayout(event);
    setSeatLayout(layout);
    setBookedSeatIds(getBookedSeats(event, layout));
    setSelectedSeats([]);
    setUpiRef('');
    setUpiQrError(false);
    setBookingStep(1);
    setBookingErrors({});
    setBookingContact((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName || '',
      phone: user?.phone || prev.phone || '',
      email: user?.email || prev.email || '',
    }));
    setSelectedEvent(event);
    setOpenBooking(true);
  };

  const toggleSeatSelection = (seatId) => {
    if (bookedSeatIds.includes(seatId)) return;

    setSelectedSeats((prev) => (
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    ));
  };

  const postBooking = async (paymentPayload = null, paymentMethodLabel = 'Standard Booking', autoDownload = false) => {
    const selectedCategories = [...new Set(selectedSeatDetails.map((seat) => seat.category))];
    const seatSummary = selectedSeatDetails
      .map((seat) => `${seat.id} (${seat.category})`)
      .join(', ');

    const defaultCategory = selectedCategories[0] || bookingData.category || 'Normal';

    const payload = {
      eventId: selectedEvent._id,
      ...bookingData,
      category: defaultCategory,
      seatNumber: seatSummary,
      userDetails: {
        fullName: bookingContact.fullName.trim(),
        phone: bookingContact.phone.trim(),
        email: bookingContact.email.trim(),
      },
      address: {
        houseNo: bookingContact.houseNo.trim(),
        street: bookingContact.street.trim(),
        area: bookingContact.area.trim(),
        city: bookingContact.city.trim(),
        state: bookingContact.state.trim(),
        pincode: bookingContact.pincode.trim(),
      },
      selectedSeats: selectedSeatDetails.map((seat) => ({
        seatNumber: seat.id,
        category: seat.category,
        price: priceMap[seat.category] || 0
      })),
      totalAmount: grandTotal
    };

    if (paymentPayload) {
      payload.payment = paymentPayload;
    }

    const response = await api.post('/tickets', payload);
    const ticketId = response?.data?.ticket?._id || response?.data?.tickets?.[0]?._id || null;
    const newlyBookedSeats = selectedSeatDetails.map((seat) => seat.id);
    const updatedBookedSeats = [...new Set([...bookedSeatIds, ...newlyBookedSeats])];

    saveLocalBookedSeats(selectedEvent?._id, updatedBookedSeats);
    setBookedSeatIds(updatedBookedSeats);
    setEvents((prev) => prev.map((event) => (
      event._id === selectedEvent?._id
        ? { ...event, bookedSeats: updatedBookedSeats }
        : event
    )));

    setOpenBooking(false);
    setBookingData({ category: '', seatNumber: '', mealCombo: false });
    setSelectedSeats([]);
    setBookingStep(1);

    if (autoDownload && ticketId) {
      try {
        await downloadTicketPdf(ticketId);
      } catch (error) {
        console.error('Ticket download failed:', error);
      }
    }

    navigate('/events/booking-confirmation', {
      state: {
        eventTitle: selectedEvent?.title || selectedEvent?.name,
        selectedSeats: selectedSeatDetails.map((seat) => ({
          seatNumber: seat.id,
          category: seat.category,
          price: priceMap[seat.category] || 0
        })),
        totalAmount: grandTotal,
        mealCombo: bookingData.mealCombo,
        bookingRef: ticketId,
        paymentMethod: paymentMethodLabel
      }
    });
  };

  const launchRazorpay = async () => {
    if (!window.Razorpay) {
      throw new Error('Razorpay checkout is not available. Please refresh and try again.');
    }

    const orderRes = await paymentAPI.createOrder(grandTotal);
    const orderData = orderRes.data || {};

    if (!orderData.order_id) {
      throw new Error(orderData.message || 'Failed to initialize payment order.');
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const description = `Seats: ${selectedSeatDetails.map((seat) => seat.id).join(', ')}`;

    const options = {
      key: orderData.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID,
      order_id: orderData.order_id,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: '5Rings Events',
      description: `${selectedEvent?.title || 'Event'} | ${description}`,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      notes: {
        eventId: selectedEvent?._id,
        seats: selectedSeatDetails.map((seat) => seat.id).join(', ')
      },
      theme: { color: '#2563EB' },
      handler: async (paymentResponse) => {
        try {
          await postBooking({
            provider: 'razorpay',
            method: 'RAZORPAY',
            status: 'PAID',
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_signature: paymentResponse.razorpay_signature
          }, 'Razorpay');
        } catch (error) {
          alert(error.response?.data?.message || 'Booking failed after payment');
        } finally {
          setIsPaying(false);
        }
      },
      modal: {
        ondismiss: () => setIsPaying(false)
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (resp) => {
      const reason = resp?.error?.description || resp?.error?.reason || 'Payment failed in Razorpay checkout.';
      alert(reason);
      setIsPaying(false);
    });
    razorpay.open();
  };

  const validateBookingStepOne = () => {
    const nextErrors = {};

    if (!selectedSeatDetails.length) {
      nextErrors.seats = 'Please select at least one seat.';
    }

    setBookingErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateBookingStepTwo = () => {
    const nextErrors = {};

    const requiredFields = {
      fullName: 'Full Name is required',
      phone: 'Phone Number is required',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!bookingContact[field]?.trim()) {
        nextErrors[field] = message;
      }
    });

    if (bookingContact.phone && !/^\d{10}$/.test(bookingContact.phone.trim())) {
      nextErrors.phone = 'Enter a valid 10-digit phone number';
    }
    if (bookingContact.email && !/^\S+@\S+\.\S+$/.test(bookingContact.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    setBookingErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateBookingStepOne()) {
      setBookingStep(2);
    }
  };

  const handleContinueToPaymentOptions = () => {
    if (validateBookingStepTwo()) {
      setBookingStep(3);
    }
  };

  const handleConfirmBooking = async () => {
    if (!validateBookingStepOne() || !validateBookingStepTwo()) {
      alert('Please complete required details before payment.');
      return;
    }

    setIsPaying(true);
    try {
      await launchRazorpay();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Booking failed');
      setIsPaying(false);
    } finally {
      // Intentionally do not force setIsPaying(false) here because
      // success path is finished in Razorpay handler -> postBooking.
    }
  };

  const handleUpiQrConfirm = async () => {
    if (!validateBookingStepOne() || !validateBookingStepTwo()) {
      alert('Please complete required details before payment.');
      return;
    }

    setIsPaying(true);
    try {
      await postBooking({
        provider: 'upi-qr',
        method: 'UPI',
        status: 'PAID',
        upiReference: upiRef.trim().replace(/\s+/g, '') || 'QR_CONFIRMED'
      }, 'UPI QR (Confirmed)', true);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'UPI QR booking failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handleWhatsAppInquiry = (event) => {
    const message = `Hi, I'm interested in the event: ${event.title || event.name}`;
    window.open(`https://wa.me/919361301119?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusColor = (status) => {
    const normalized = (status || '').toString().toLowerCase();
    switch (normalized) {
      case 'upcoming':
        return '#2e7d32';
      case 'ongoing':
      case 'live':
        return '#ef6c00';
      case 'completed':
        return '#455a64';
      case 'published':
        return '#1e88e5';
      default:
        return '#1e88e5';
    }
  };

  const getEventEndTime = (event) => {
    const endValue = event?.endDate || event?.endTime || event?.endAt;
    if (endValue) {
      const parsedEnd = new Date(endValue);
      if (!Number.isNaN(parsedEnd.getTime())) {
        return parsedEnd.getTime();
      }
    }

    const startValue = event?.startDate || event?.date;
    if (startValue) {
      const parsedStart = new Date(startValue);
      if (!Number.isNaN(parsedStart.getTime())) {
        return parsedStart.getTime();
      }
    }

    return null;
  };

  const isEventEnded = (event) => {
    const lifecycleStatus = (event?.status || '').toString().toLowerCase();
    if (['completed', 'ended', 'cancelled'].includes(lifecycleStatus)) {
      return true;
    }

    const endTime = getEventEndTime(event);
    return endTime ? endTime < Date.now() : false;
  };

  const getDisplayStatus = (event) => {
    if (isEventEnded(event)) {
      return 'completed';
    }
    return event?.status || 'upcoming';
  };

  const getVenueAddressText = (event) => {
    const override = (event?.venueAddress || '').trim();
    if (override) return override;
    const address = event?.venue?.address;
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      return Object.values(address)
        .filter((val) => val && typeof val === 'string')
        .join(', ');
    }
    return '';
  };

  const filterFieldSx = {
    minWidth: 200,
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: 'rgba(15, 23, 42, 0.6)',
      color: '#E2E8F0',
      border: '1px solid rgba(148, 163, 184, 0.12)',
      minHeight: 52,
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.3)' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1' }
    },
    '& .MuiInputLabel-root': { color: '#94A3B8' },
    '& .MuiInputBase-input::placeholder': { color: '#94A3B8', opacity: 1 },
    '& .MuiSelect-select': { display: 'flex', alignItems: 'center' },
    '& .MuiSvgIcon-root': { color: '#94A3B8' }
  };

  return (
    <Layout>
      <Box sx={{ pt: { xs: 10, md: 12 }, bgcolor: 'transparent', minHeight: '100vh' }}>
        {/* Hero Section */}
        <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 10 } }}>
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', mb: 8 }}>
            <Typography variant="h1" className="text-gradient" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '5rem' }, mb: 2 }}>
              Major Events
            </Typography>
            <Typography variant="h5" sx={{ color: '#94A3B8', fontSize: '1.25rem', fontWeight: 500, letterSpacing: 0.5 }}>
              Join exciting sports events, tournaments, and workshops at our elite facilities.
            </Typography>
          </Box>

          {/* Enhanced Filters */}
          <Card
            elevation={0}
            className="glass-panel"
            sx={{
              p: { xs: 3, md: 4 },
              mb: 6,
              borderRadius: 4,
              overflow: 'visible',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              background: 'linear-gradient(180deg, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.4) 100%)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <FilterListIcon sx={{ color: '#A5B4FC', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#F8FAFC' }}>
                  Filter Arenas
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setViewMode(viewMode === 'grid' ? 'calendar' : 'grid')}
                startIcon={viewMode === 'grid' ? <CalendarIcon /> : <ViewModuleIcon />}
                sx={{
                  borderRadius: 999,
                  borderColor: 'rgba(148, 163, 184, 0.35)',
                  color: '#E2E8F0',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.75,
                  '&:hover': { borderColor: '#A5B4FC', bgcolor: 'rgba(99, 102, 241, 0.12)' }
                }}
              >
                {viewMode === 'grid' ? 'Calendar view' : 'Grid view'}
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={filterFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Sport"
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  sx={filterFieldSx}
                >
                  {sports.map((sport) => (
                    <MenuItem key={sport} value={sport}>{sport}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={filterFieldSx}
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  type="date"
                  fullWidth
                  label="From Date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={filterFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  type="date"
                  fullWidth
                  label="To Date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={filterFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={filterFieldSx}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="ongoing">Live</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={filteredEvents.length} color="primary">
                  <EmojiEvents color="action" />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Events Found
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={savedEvents.length} color="secondary">
                  <BookmarkIcon color="action" />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Saved Events
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge 
                  badgeContent={filteredEvents.filter(e => e.status === 'upcoming').length} 
                  color="success"
                >
                  <CalendarToday color="action" />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Upcoming
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Events Grid */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <TrendingUpIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Loading events...</Typography>
            </Box>
          ) : filteredEvents.length === 0 ? (
            <Paper className="glass-panel" sx={{ p: 10, textAlign: 'center', borderRadius: 4 }}>
              <EmojiEvents sx={{ fontSize: 80, color: '#475569', mb: 3, opacity: 0.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#F8FAFC', mb: 2 }}>No events found</Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', mb: 5, maxWidth: 500, mx: 'auto' }}>
                We couldn't find any events matching your current filters. Try broadening your search or check back soon for updates.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<Search />}
                onClick={() => {
                  setSearchTerm('');
                  setSportFilter('');
                  setTypeFilter('');
                  setDateFilter({ from: '', to: '' });
                }}
                sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : viewMode === 'calendar' ? (
            <Stack spacing={2.5}>
              {filteredEvents.map((event) => (
                <Paper
                  key={event._id}
                  className="glass-panel"
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2
                  }}
                >
                  <Box
                    sx={{
                      minWidth: { xs: '100%', md: 120 },
                      display: 'flex',
                      flexDirection: { xs: 'row', md: 'column' },
                      alignItems: { xs: 'center', md: 'flex-start' },
                      gap: { xs: 2, md: 0.5 },
                      pb: { xs: 1, md: 0 },
                      borderBottom: { xs: '1px solid rgba(148, 163, 184, 0.12)', md: 'none' },
                      borderRight: { xs: 'none', md: '1px solid rgba(148, 163, 184, 0.12)' },
                      pr: { xs: 0, md: 2 }
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#F8FAFC' }}>
                      {new Date(event.startDate).getDate().toString().padStart(2, '0')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 0.5 }}>
                      {event.title || event.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }} noWrap>
                      {event.venue?.name || 'TBA'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {event.sport && (
                        <Chip
                          label={event.sport}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: '#0f172a',
                            fontWeight: 700,
                            border: '1px solid rgba(15, 23, 42, 0.12)'
                          }}
                        />
                      )}
                      <Chip
                        label={getDisplayStatus(event)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(getDisplayStatus(event)),
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          border: '1px solid rgba(255,255,255,0.25)'
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openQuickViewDialog(event)}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.12)',
                        color: '#CBD5E1',
                        borderRadius: 2,
                        fontWeight: 600,
                        '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: 'transparent' }
                      }}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ConfirmationNumber sx={{ fontSize: 18 }} />}
                      onClick={() => handleBookTicket(event)}
                      disabled={isEventEnded(event)}
                      sx={{
                        bgcolor: '#3B82F6',
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 2,
                        '&:hover': { bgcolor: '#2563EB' },
                        '&:disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#64748b' }
                      }}
                    >
                      {isEventEnded(event) ? 'Ended' : 'Book Now'}
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Grid container spacing={4}>
              {filteredEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <StyledEventCard className="glass-panel">
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: 280, flexShrink: 0 }}>
                      {event.images && event.images[0] ? (
                        <CardMedia
                          component="img"
                          image={event.images[0]}
                          alt={event.title || event.name}
                          className="event-image"
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                          <EmojiEvents sx={{ fontSize: 80, color: 'rgba(255,255,255,0.05)' }} />
                        </Box>
                      )}

                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(2,6,23,0.45) 0%, rgba(2,6,23,0.05) 45%, rgba(2,6,23,0.7) 100%)',
                          pointerEvents: 'none'
                        }}
                      />
                      
                      {/* Status Badge */}
                      <Chip
                        label={getDisplayStatus(event)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: getStatusColor(getDisplayStatus(event)),
                          color: 'white',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          border: '1px solid rgba(255,255,255,0.25)',
                          boxShadow: '0 8px 18px rgba(2,6,23,0.35)',
                          textShadow: '0 1px 2px rgba(2,6,23,0.6)',
                          zIndex: 2
                        }}
                      />
                      
                      {/* Sport Badge */}
                      {event.sport && (
                        <Chip
                          label={event.sport}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: '#0f172a',
                            fontWeight: 700,
                            letterSpacing: 0.2,
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(15, 23, 42, 0.12)',
                            boxShadow: '0 6px 16px rgba(2,6,23,0.25)',
                            zIndex: 2
                          }}
                        />
                      )}
                      
                      {/* Action Buttons */}
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 12,
                          bottom: 12,
                          display: 'flex',
                          gap: 0.5,
                          zIndex: 2
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveEvent(event._id);
                          }}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: '#0f172a',
                            border: '1px solid rgba(15, 23, 42, 0.12)',
                            backdropFilter: 'blur(8px)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          {savedEvents.includes(event._id) ? 
                            <BookmarkFilledIcon fontSize="small" color="primary" /> : 
                            <BookmarkIcon fontSize="small" />
                          }
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareEvent(event);
                          }}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: '#0f172a',
                            border: '1px solid rgba(15, 23, 42, 0.12)',
                            backdropFilter: 'blur(8px)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, sm: 3.5 } }}>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5, minHeight: 48, lineHeight: 1.3, color: '#F8FAFC' }}>
                        {event.title || event.name}
                      </Typography>
                      
                      {/* Event Details */}
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(event.startDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {event.venue?.name || 'TBA'}
                          </Typography>
                        </Box>
                        
                        {event.type && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Stadium sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                              {event.type}
                            </Typography>
                          </Box>
                        )}
                        
                        {event.maxParticipants && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Max: {event.maxParticipants} participants
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981' }}>
                          {event.ticketCategories?.length > 0 ? `₹${Math.min(...event.ticketCategories.map(c => c.price)).toLocaleString()}` : 'Free'}
                        </Typography>
                        {event.registrationCount && (
                          <Chip 
                            label={`${event.registrationCount} registered`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, display: 'flex', gap: 1.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openQuickViewDialog(event)}
                        sx={{
                          display: { xs: 'none', sm: 'flex' },
                          borderColor: 'rgba(255,255,255,0.1)',
                          color: '#CBD5E1',
                          borderRadius: 2,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          px: 2,
                          whiteSpace: 'nowrap',
                          '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: 'transparent' },
                        }}
                      >
                        Details
                      </Button>
                      
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ConfirmationNumber sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                        onClick={() => handleBookTicket(event)}
                        disabled={isEventEnded(event)}
                        sx={{
                          flexGrow: 1,
                          bgcolor: '#3B82F6',
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: 2,
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          px: { xs: 2.5, sm: 3 },
                          py: { xs: 0.8, sm: 1 },
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                          '&:hover': { bgcolor: '#2563EB', transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.6)' },
                          '&:disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#64748b' }
                        }}
                      >
                        {isEventEnded(event) ? 'Ended' : 'Book Now'}
                      </Button>
                      
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleWhatsAppInquiry(event)}
                        sx={{
                          minWidth: 44,
                          borderColor: 'rgba(37,211,102,0.3)',
                          color: '#25D366',
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: '#25D366',
                            bgcolor: 'rgba(37, 211, 102, 0.1)'
                          }
                        }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </Button>
                    </CardActions>
                  </StyledEventCard>
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
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, overflow: 'hidden', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' }
        }}
      >
        {selectedEvent && (
          <Box sx={{ bgcolor: '#0B1120' }}>
            {/* Header Image */}
            <Box sx={{ position: 'relative', height: 240, overflow: 'hidden' }}>
              {selectedEvent.images?.[0] ? (
                <img
                  src={selectedEvent.images[0]}
                  alt={selectedEvent.title || selectedEvent.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ width: '100%', height: '100%', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 80, color: '#475569' }} />
                </Box>
              )}
              
              <IconButton
                onClick={() => setOpenQuickView(false)}
                size="small"
                sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }}
              >
                ✕
              </IconButton>
            </Box>
            
            <DialogContent sx={{ pt: 3, bgcolor: '#0B1120', px: { xs: 2.5, sm: 4 } }}>
              {/* Header Row */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 }, mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.4rem' }, color: '#F8FAFC', pr: { xs: 0, sm: 2 }, lineHeight: 1.3 }}>
                  {selectedEvent.title || selectedEvent.name}
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#F8FAFC', whiteSpace: 'nowrap' }}>
                  {selectedEvent.ticketCategories?.length > 0 ? `₹${Math.min(...selectedEvent.ticketCategories.map(c => c.price)).toLocaleString()}` : 'Free'}
                </Typography>
              </Box>

              {/* Chips */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2.5 }}>
                <Chip
                  label={getDisplayStatus(selectedEvent)}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(getDisplayStatus(selectedEvent)),
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 18px rgba(2,6,23,0.35)',
                    textShadow: '0 1px 2px rgba(2,6,23,0.6)'
                  }}
                />
                {selectedEvent.sport && (
                  <Chip label={selectedEvent.sport} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700 }} />
                )}
                {selectedEvent.type && (
                  <Chip label={selectedEvent.type} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#CBD5E1', fontWeight: 600, textTransform: 'capitalize' }} />
                )}
              </Box>

              {/* Description */}
              <Typography sx={{ color: '#94A3B8', lineHeight: 1.7, mb: 3, fontSize: '0.95rem' }}>
                {selectedEvent.description || 'No description available for this event.'}
              </Typography>

              {/* Details Box */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}><CalendarToday sx={{ fontSize: 20, color: '#3B82F6' }} /></Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>
                      {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                      {new Date(selectedEvent.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}><LocationOn sx={{ fontSize: 20, color: '#ef4444' }} /></Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>
                      {(selectedEvent.venueName || '').trim() || selectedEvent.venue?.name || 'TBA'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                      {getVenueAddressText(selectedEvent) || 'Address will be provided'}
                    </Typography>
                  </Box>
                </Box>
                
                {selectedEvent.maxParticipants && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ mt: 0.5 }}><GroupIcon sx={{ fontSize: 20, color: '#f59e0b' }} /></Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>
                        {selectedEvent.maxParticipants} Max Capacity
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                        {selectedEvent.registrationCount || 0} already registered
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Features */}
              {selectedEvent.features && (
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', mb: 1.5 }}>Features</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedEvent.features.split(',').map((f, i) => (
                      <Chip key={i} label={f.trim()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#CBD5E1' }} />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, pb: 4, pt: 1, bgcolor: '#0B1120', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ConfirmationNumber />}
                onClick={() => {
                  setOpenQuickView(false);
                  handleBookTicket(selectedEvent);
                }}
                disabled={isEventEnded(selectedEvent)}
                sx={{
                  bgcolor: '#3B82F6',
                  color: '#fff',
                  borderRadius: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  m: '0 !important',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  '&:hover': { bgcolor: '#2563EB', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.5)' },
                  '&:disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#64748b', boxShadow: 'none' }
                }}
              >
                {isEventEnded(selectedEvent) ? 'Event Ended' : 'Book Tickets'}
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1.5, width: '100%', m: '0 !important' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => toggleSaveEvent(selectedEvent._id)}
                  startIcon={savedEvents.includes(selectedEvent._id) ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                  sx={{ borderColor: 'rgba(255,255,255,0.1)', color: savedEvents.includes(selectedEvent._id) ? '#3B82F6' : '#94A3B8', borderRadius: 3, py: 1, fontSize: '0.9rem', fontWeight: 600, '&:hover': { borderColor: 'rgba(255,255,255,0.25)', bgcolor: 'rgba(255,255,255,0.05)', color: '#F8FAFC' } }}
                >
                  Save
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => shareEvent(selectedEvent)}
                  startIcon={<ShareIcon />}
                  sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: 3, py: 1, fontSize: '0.9rem', fontWeight: 600, '&:hover': { borderColor: 'rgba(255,255,255,0.25)', bgcolor: 'rgba(255,255,255,0.05)', color: '#F8FAFC' } }}
                >
                  Share
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => handleWhatsAppInquiry(selectedEvent)}
                  sx={{ borderColor: 'rgba(37,211,102,0.3)', color: '#25D366', borderRadius: 3, py: 1, fontSize: '0.9rem', fontWeight: 600, '&:hover': { borderColor: '#25D366', bgcolor: 'rgba(37,211,102,0.1)' } }}
                >
                  WhatsApp
                </Button>
              </Box>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* Enhanced Booking Dialog */}
      <Dialog 
        open={openBooking} 
        onClose={() => setOpenBooking(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, overflow: 'hidden' }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            px: 3,
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
            color: '#E2E8F0'
          }}
       >
          <Typography variant="overline" sx={{ letterSpacing: 2, color: '#38bdf8' }}>
            Booking Summary
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            Book Your Tickets
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            {selectedEvent?.title || selectedEvent?.name}
          </Typography>
          <Stack direction="row" spacing={1.25} sx={{ mt: 1.5 }}>
            <Chip
              size="small"
              label="Step 1: Select Seats"
              sx={{
                bgcolor: bookingStep === 1 ? 'rgba(56,189,248,0.22)' : 'rgba(148,163,184,0.14)',
                color: bookingStep === 1 ? '#38bdf8' : '#94a3b8',
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label="Step 2: Contact"
              sx={{
                bgcolor: bookingStep === 2 ? 'rgba(56,189,248,0.22)' : 'rgba(148,163,184,0.14)',
                color: bookingStep === 2 ? '#38bdf8' : '#94a3b8',
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label="Step 3: Payment"
              sx={{
                bgcolor: bookingStep === 3 ? 'rgba(56,189,248,0.22)' : 'rgba(148,163,184,0.14)',
                color: bookingStep === 3 ? '#38bdf8' : '#94a3b8',
                fontWeight: 700,
              }}
            />
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ pb: 3, pt: 3, px: 3 }}>
          {selectedEvent && (
            <Box sx={{ mb: 3 }}>
              <Paper
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  bgcolor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.35)'
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Event Date
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#E5E7EB' }}>
                      {new Date(selectedEvent.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Venue
                    </Typography>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#E5E7EB' }}>
                      {selectedEvent.venue?.name || 'TBA'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
          
          <Box sx={{ pt: 1 }}>
            {bookingStep === 2 && (
              <Paper
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.35)'
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#E5E7EB', fontWeight: 700, mb: 1.5 }}>
                  Contact Details
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={bookingContact.fullName}
                      onChange={(e) => setBookingContact((prev) => ({ ...prev, fullName: e.target.value }))}
                      error={!!bookingErrors.fullName}
                      helperText={bookingErrors.fullName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={bookingContact.phone}
                      onChange={(e) => setBookingContact((prev) => ({ ...prev, phone: e.target.value }))}
                      error={!!bookingErrors.phone}
                      helperText={bookingErrors.phone}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email (optional)"
                      value={bookingContact.email}
                      onChange={(e) => setBookingContact((prev) => ({ ...prev, email: e.target.value }))}
                      error={!!bookingErrors.email}
                      helperText={bookingErrors.email}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {bookingStep === 1 && (
              <>
                <Paper
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(148, 163, 184, 0.35)'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#E5E7EB', fontWeight: 700, mb: 1.5 }}>
                    Seat Legend
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    <Chip label={`VIP / Diamond • ₹${(priceMap.VIP || 0).toLocaleString()}`} sx={{ bgcolor: '#7c3aed', color: '#fff', fontWeight: 700 }} />
                    <Chip label={`Normal • ₹${(priceMap.Normal || 0).toLocaleString()}`} sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 700 }} />
                    <Chip label="Selected" sx={{ bgcolor: '#10b981', color: '#042f2e', fontWeight: 700 }} />
                    <Chip label="Booked" sx={{ bgcolor: '#334155', color: '#94a3b8', fontWeight: 700 }} />
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(15,23,42,0.85)',
                    border: '1px dashed rgba(148, 163, 184, 0.45)'
                  }}
                >
              <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 1.5 }}>
                VIP Section (A1 - A{seatLayout.vipSeats.length})
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                  gap: 1,
                  mb: 2
                }}
              >
                {seatLayout.vipSeats.map((seat) => {
                  const isBooked = bookedSeatIds.includes(seat.id);
                  const isSelected = selectedSeats.includes(seat.id);

                  return (
                    <Button
                      key={seat.id}
                      size="small"
                      disabled={isBooked}
                      onClick={() => toggleSeatSelection(seat.id)}
                      sx={{
                        minWidth: 0,
                        p: 0.8,
                        borderRadius: 1.5,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: isBooked ? '#64748b' : '#fff',
                        bgcolor: isBooked ? '#334155' : isSelected ? '#10b981' : '#7c3aed',
                        '&:hover': {
                          bgcolor: isBooked ? '#334155' : isSelected ? '#059669' : '#6d28d9'
                        }
                      }}
                    >
                      {seat.id}
                    </Button>
                  );
                })}
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 1.5 }}>
                Normal Section (B1 - B{seatLayout.regularSeats.length})
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                  gap: 1
                }}
              >
                {seatLayout.regularSeats.map((seat) => {
                  const isBooked = bookedSeatIds.includes(seat.id);
                  const isSelected = selectedSeats.includes(seat.id);

                  return (
                    <Button
                      key={seat.id}
                      size="small"
                      disabled={isBooked}
                      onClick={() => toggleSeatSelection(seat.id)}
                      sx={{
                        minWidth: 0,
                        p: 0.8,
                        borderRadius: 1.5,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: isBooked ? '#64748b' : '#fff',
                        bgcolor: isBooked ? '#334155' : isSelected ? '#10b981' : '#2563eb',
                        '&:hover': {
                          bgcolor: isBooked ? '#334155' : isSelected ? '#059669' : '#1d4ed8'
                        }
                      }}
                    >
                      {seat.id}
                    </Button>
                  );
                })}
              </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(15,23,42,0.9)',
                    border: '1px dashed rgba(56,189,248,0.5)'
                  }}
                >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#E5E7EB' }}>
                    Meal Combo Add-on
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Includes snacks and beverages
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#22C55E', fontWeight: 600, display: 'block' }}>
                    +₹200 per selected seat
                  </Typography>
                </Box>
                <Switch
                  checked={bookingData.mealCombo}
                  onChange={(e) => setBookingData({ ...bookingData, mealCombo: e.target.checked })}
                  color="primary"
                />
              </Box>
                </Paper>
              </>
            )}

            <Box
              sx={{
                mt: 3,
                p: 2.25,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(148, 163, 184, 0.35)'
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: '#E5E7EB' }}>
                Booking Summary
              </Typography>
              <Stack spacing={1.25}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#CBD5F5' }}>
                    Seats Selected
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#E5E7EB' }}>
                    {selectedSeatDetails.length}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  {selectedSeatDetails.length ? selectedSeatDetails.map((seat) => `${seat.id} (${seat.category})`).join(', ') : 'No seats selected yet'}
                </Typography>
                {bookingErrors.seats && (
                  <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700 }}>
                    {bookingErrors.seats}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#CBD5F5' }}>
                    Seat Total
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#E5E7EB' }}>
                    ₹{ticketSubtotal.toLocaleString()}
                  </Typography>
                </Box>
                {bookingData.mealCombo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#A5B4FC' }}>Meal Combo</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#E5E7EB' }}>₹{mealComboTotal.toLocaleString()}</Typography>
                  </Box>
                )}
                <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.4)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight={700} sx={{ color: '#F9FAFB' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#22C55E' }}>
                    ₹{grandTotal.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {bookingStep === 3 && (
              <Stack spacing={1.5} sx={{ mt: 2.5 }}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(37,99,235,0.4)'
                  }}
                >
                  <Typography sx={{ color: '#E5E7EB', fontWeight: 700, mb: 0.5 }}>
                    Pay Online (Razorpay)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5 }}>
                    Complete payment now and confirm your booking instantly.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleConfirmBooking}
                    disabled={isPaying}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  >
                    {isPaying ? 'Processing...' : 'Pay Now'}
                  </Button>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(16,185,129,0.35)'
                  }}
                >
                  <Typography sx={{ color: '#E5E7EB', fontWeight: 700, mb: 0.5 }}>
                    UPI QR Payment
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1 }}>
                    Scan the QR using any UPI app and confirm to download your ticket.
                  </Typography>
                  {!upiQrError ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                      <Box
                        component="img"
                        src={upiQrImage}
                        alt="UPI QR"
                        sx={{ width: 180, height: 180, borderRadius: 2, bgcolor: '#fff', p: 1 }}
                        onError={() => setUpiQrError(true)}
                      />
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5 }}>
                      QR image not found. Add it to the public folder and set `REACT_APP_UPI_QR_IMAGE` if the name differs.
                    </Typography>
                  )}
                  <TextField
                    fullWidth
                    size="small"
                    label="Optional UPI UTR / Transaction Reference"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    helperText="Optional: you may enter a UTR/reference for records."
                    sx={{ mb: 1.25 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleUpiQrConfirm}
                    disabled={isPaying}
                    sx={{ fontWeight: 700, borderRadius: 2, borderColor: 'rgba(16,185,129,0.45)', color: '#34d399' }}
                  >
                    {isPaying ? 'Confirming...' : 'Confirm Payment & Download Ticket'}
                  </Button>
                </Paper>
              </Stack>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            gap: 1.5
          }}
        >
          <Button 
            onClick={() => {
              if (bookingStep > 1 && !isPaying) {
                setBookingStep((prev) => Math.max(1, prev - 1));
                return;
              }
              if (bookingStep === 1 && !isPaying) {
                setOpenBooking(false);
                setBookingStep(1);
                return;
              }
            }} 
            size="large"
            fullWidth
            sx={{ color: '#94A3B8', fontWeight: 600, borderRadius: 2 }}
          >
            {bookingStep > 1 ? 'Back' : 'Cancel'}
          </Button>
          {bookingStep === 1 && (
            <Button
              variant="contained"
              onClick={handleContinueToPayment}
              disabled={isPaying}
              size="large"
              fullWidth
              sx={{
                bgcolor: '#2563EB',
                minWidth: 160,
                fontWeight: 700,
                borderRadius: 2,
                color: '#F9FAFB',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.45)',
                '&:hover': {
                  bgcolor: '#1D4ED8',
                  boxShadow: '0 14px 30px rgba(37, 99, 235, 0.6)'
                },
                '&.Mui-disabled': {
                  boxShadow: 'none'
                }
              }}
            >
              Continue to Payment
            </Button>
          )}
          {bookingStep === 2 && (
            <Button
              variant="contained"
              onClick={handleContinueToPaymentOptions}
              disabled={isPaying}
              size="large"
              fullWidth
              sx={{
                bgcolor: '#2563EB',
                minWidth: 160,
                fontWeight: 700,
                borderRadius: 2,
                color: '#F9FAFB',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.45)',
                '&:hover': {
                  bgcolor: '#1D4ED8',
                  boxShadow: '0 14px 30px rgba(37, 99, 235, 0.6)'
                },
                '&.Mui-disabled': {
                  boxShadow: 'none'
                }
              }}
            >
              Continue to Payment Options
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Events;
