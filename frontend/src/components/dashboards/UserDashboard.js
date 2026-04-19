import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  LinearProgress,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Rating,
} from '@mui/material';
import {
  ConfirmationNumber,
  EmojiEvents,
  Notifications,
  Visibility,
  ArrowForward,
  Star,
  CalendarToday,
  TrendingUp,
  AccessTime,
} from '@mui/icons-material';
import api from '../../utils/api';
import MyFoodOrders from './MyFoodOrders';
import { useNotifications } from '../../context/NotificationContext';

// ── Severity colour map ───────────────────────────────────────────────────────
const SEV_COLOR = { warning: '#F97316', success: '#10B981', info: '#3B82F6', error: '#EF4444' };
const SEV_BG = {
  warning: 'rgba(249, 115, 22, 0.06)',
  success: 'rgba(16, 185, 129, 0.06)',
  info: 'rgba(59, 130, 246, 0.06)',
  error: 'rgba(239, 68, 68, 0.06)',
};
const SURFACE = '#111827';
const SURFACE_ALT = '#0F172A';
const BORDER_SUBTLE = 'rgba(148, 163, 184, 0.12)';
const SHADOW_SOFT = '0 8px 18px rgba(2, 6, 23, 0.5)';
const PANEL_SX = {
  bgcolor: SURFACE,
  border: `1px solid ${BORDER_SUBTLE}`,
  borderRadius: 2,
  boxShadow: SHADOW_SOFT,
};
const PANEL_SX_ALT = {
  bgcolor: SURFACE_ALT,
  border: `1px solid ${BORDER_SUBTLE}`,
  borderRadius: 2,
  boxShadow: SHADOW_SOFT,
};
const SUBCARD_SX = {
  p: 2,
  background: '#0E1628',
  border: `1px solid ${BORDER_SUBTLE}`,
  borderRadius: 1.5,
  transition: 'all 0.25s ease',
  '&:hover': {
    boxShadow: '0 12px 22px rgba(2, 6, 23, 0.55)',
    borderColor: 'rgba(148, 163, 184, 0.22)',
  },
};

function UserDashboard({ user }) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalTickets: 0,
    upcomingEvents: 0,
    pendingPayments: 0,
    recentProducts: 0,
  });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [coachRatingValue, setCoachRatingValue] = useState(0);
  const [coachRatingFeedback, setCoachRatingFeedback] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load tickets
      const ticketsRes = await api.get('/tickets');
      const tickets = ticketsRes.data.tickets || [];
      setMyTickets(tickets.slice(0, 5));
      
      // Load recommended events
      const eventsRes = await api.get('/events', {
        params: { status: 'published' }
      });
      setRecommendedEvents((eventsRes.data.events || []).slice(0, 4));

      // Load enrolled workshops/programs
      const enrollmentsRes = await api.get('/enrollments');
      const enrollments = enrollmentsRes.data?.enrollments || [];
      setMyEnrollments(enrollments.slice(0, 4));

      // Load recently viewed products from localStorage
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(viewed.slice(0, 6));

      // Generate activity feed
      const activities = [];
      const now = new Date();
      const pendingTickets = tickets.filter((ticket) => ticket.paymentStatus === 'PENDING_VERIFICATION');
      const upcomingPaidTickets = tickets.filter((ticket) => {
        const eventDate = ticket.event?.startDate ? new Date(ticket.event.startDate) : null;
        if (!eventDate || Number.isNaN(eventDate.getTime())) return false;
        const paidOrLegacy = !ticket.paymentStatus || ticket.paymentStatus === 'PAID';
        return paidOrLegacy && eventDate > now;
      });
      
      tickets.slice(0, 3).forEach(ticket => {
        activities.push({
          type: 'ticket',
          title: `Booked ticket for ${ticket.event?.title || 'Event'}`,
          subtitle: ticket.paymentStatus === 'PENDING_VERIFICATION' ? `${ticket.category} • Payment Pending` : ticket.category,
          time: ticket.bookingDate,
          icon: <ConfirmationNumber />,
          color: ticket.paymentStatus === 'PENDING_VERIFICATION' ? '#F59E0B' : '#10B981',
        });
      });

      if (pendingTickets.length > 0) {
        activities.unshift({
          type: 'payment',
          title: `${pendingTickets.length} booking payment${pendingTickets.length > 1 ? 's' : ''} pending`,
          subtitle: 'Submit UTR / await verification',
          time: pendingTickets[0].bookingDate || new Date().toISOString(),
          icon: <Notifications />,
          color: '#F59E0B',
        });
      }

      if (viewed.length > 0) {
        activities.push({
          type: 'view',
          title: `Viewed ${viewed[0].name}`,
          subtitle: 'Product',
          time: viewed[0].viewedAt || new Date().toISOString(),
          icon: <Visibility />,
          color: '#6366F1',
        });
      }

      setActivityFeed(activities.slice(0, 5));

      // Set stats
      setStats({
        totalOrders: 0,
        totalTickets: tickets.length,
        upcomingEvents: upcomingPaidTickets.length,
        pendingPayments: pendingTickets.length,
        recentProducts: viewed.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products#${productId}`);
  };

  const handleEventClick = (eventId) => {
    navigate('/events');
  };

  const openRateDialog = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setCoachRatingValue(Number(enrollment.coachRating?.score || 0));
    setCoachRatingFeedback(enrollment.coachRating?.feedback || '');
    setRatingError('');
    setRateDialogOpen(true);
  };

  const submitCoachRating = async () => {
    if (!selectedEnrollment) return;
    if (coachRatingValue < 1 || coachRatingValue > 5) {
      setRatingError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setRatingLoading(true);
      setRatingError('');

      await api.post(`/enrollments/${selectedEnrollment._id}/rate`, {
        score: coachRatingValue,
        feedback: coachRatingFeedback,
      });

      setRateDialogOpen(false);
      await loadDashboardData();
    } catch (error) {
      setRatingError(error.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 2, md: 4 },
        background: '#0B1120',
        backgroundImage: 'linear-gradient(180deg, #0B1120 0%, #0F172A 100%)',
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          mt: { xs: 2, md: 3 },
          mb: { xs: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
        }}
      >
      {/* Welcome Board */}
      <Fade in={mounted} timeout={800}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #0f172a 0%, #111827 55%, #0f172a 100%)',
            color: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${BORDER_SUBTLE}`,
            boxShadow: SHADOW_SOFT,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, position: 'relative', zIndex: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 2, md: 4 },
                flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h3"
                  className="text-gradient"
                  sx={{
                    fontWeight: 800,
                    mb: 0.6,
                    fontSize: { xs: '1.55rem', md: '2.1rem' },
                  }}
                >
                  Welcome back, {user?.name?.split(' ')[0]}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 400,
                    fontSize: { xs: '0.95rem', md: '1.02rem' },
                  }}
                >
                  Here's what's happening with your account today
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 2, md: 3 },
                    mt: 2,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ minWidth: 90, textAlign: 'left' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', lineHeight: 1, fontSize: '1.7rem' }}>
                        {stats.totalTickets}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', letterSpacing: 0.4 }}>
                        Tickets
                      </Typography>
                    </Box>
                  <Box sx={{ minWidth: 90, textAlign: 'left' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B', lineHeight: 1, fontSize: '1.7rem' }}>
                        {stats.upcomingEvents}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', letterSpacing: 0.4 }}>
                        Upcoming
                      </Typography>
                    </Box>
                  <Box sx={{ minWidth: 90, textAlign: 'left' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#EF4444', lineHeight: 1, fontSize: '1.7rem' }}>
                        {stats.pendingPayments}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', letterSpacing: 0.4 }}>
                        Payment Pending
                      </Typography>
                    </Box>
                </Box>
                </Box>

              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  gap: 2,
                  width: { xs: '100%', md: 'auto' },
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 56, md: 72 },
                    height: { xs: 56, md: 72 },
                    bgcolor: 'rgba(148, 163, 184, 0.12)',
                    border: '1px solid rgba(148, 163, 184, 0.28)',
                    fontSize: { xs: '1.4rem', md: '1.8rem' },
                    fontWeight: 800,
                    boxShadow: '0 10px 18px rgba(2,6,23,0.45)',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Chip
                  icon={<Star sx={{ fontSize: 16 }} />}
                  label="ATHLETE"
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.85)',
                    color: '#E2E8F0',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    px: 2,
                    py: 2.5,
                    border: '1px solid rgba(148, 163, 184, 0.28)',
                    letterSpacing: 0.4,
                    '& .MuiChip-icon': {
                      color: '#F59E0B',
                    },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: 80, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </Card>
      </Fade>

      {/* Enhanced Stats Cards */}
      <Zoom in={mounted} style={{ transitionDelay: '400ms' }}>
        <Grid
          container
          spacing={{ xs: 2, md: 2.5 }}
          sx={{ mb: 3, alignItems: 'stretch', justifyContent: 'flex-start' }}
        >
          {[
            {
              title: 'My Tickets',
              value: stats.totalTickets,
              subtitle: `${stats.upcomingEvents} upcoming`,
              icon: <ConfirmationNumber sx={{ fontSize: 28 }} />,
              color: '#10B981',
              bgColor: 'rgba(16, 185, 129, 0.1)'
            },
            {
              title: 'Events Attended',
              value: stats.totalTickets - stats.upcomingEvents,
              subtitle: 'Completed events',
              icon: <EmojiEvents sx={{ fontSize: 28 }} />,
              color: '#F59E0B',
              bgColor: 'rgba(245, 158, 11, 0.1)'
            },
            {
              title: 'Payment Pending',
              value: stats.pendingPayments,
              subtitle: 'Need verification',
              icon: <Notifications sx={{ fontSize: 28 }} />,
              color: '#F59E0B',
              bgColor: 'rgba(245, 158, 11, 0.1)'
            },
            {
              title: 'Activity Score',
              value: Math.min(100, (stats.totalTickets * 20) + (stats.recentProducts * 5)),
              subtitle: 'Engagement level',
              icon: <TrendingUp sx={{ fontSize: 28 }} />,
              color: '#8B5CF6',
              bgColor: 'rgba(139, 92, 246, 0.1)'
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Card
                elevation={0}
                sx={{
                  ...PANEL_SX,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 150,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 14px 26px rgba(2, 6, 23, 0.55)',
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#94A3B8',
                          mb: 0.8,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 900,
                          mb: 0.6,
                          color: '#F8FAFC',
                          fontSize: { xs: '1.7rem', md: '1.95rem' },
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700 }}>
                        {stat.subtitle}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(148, 163, 184, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                        border: '1px solid rgba(148, 163, 184, 0.28)',
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>

                  {stat.title === 'Activity Score' && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, stat.value)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: stat.bgColor,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: stat.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${stat.color}, ${stat.color}99)`,
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Zoom>

      {/* ── Live Food Orders ────────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          ...PANEL_SX,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <MyFoodOrders user={user} />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 2.25, md: 2.75 }} alignItems="stretch" justifyContent="flex-start">
        <Grid item xs={12} lg={8} sx={{ minWidth: 0 }}>
          {/* My Tickets Section */}
          <Card
            elevation={0}
            sx={{
              mb: 2.75,
              ...PANEL_SX_ALT,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumber sx={{ fontSize: 20, color: '#60A5FA' }} />
                  My Tickets
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/events')}
                  sx={{
                    textTransform: 'none',
                    color: '#60A5FA',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.1)' },
                  }}
                >
                  View All
                </Button>
              </Box>

              {myTickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ConfirmationNumber sx={{ fontSize: 60, color: '#475569', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#94A3B8' }} gutterBottom>
                    No tickets yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {myTickets.map((ticket) => (
                    <Grid item xs={12} key={ticket._id}>
                      <Paper
                        elevation={0}
                        sx={{ ...SUBCARD_SX, width: '100%' }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#F8FAFC' }}>
                              {ticket.event?.title || 'Event'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                              <Chip
                                label={ticket.category}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  color: '#F8FAFC',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                }}
                              />
                              <Chip
                                label={ticket.paymentStatus === 'PENDING_VERIFICATION' ? 'Payment Pending' : 'Paid'}
                                size="small"
                                sx={{
                                  bgcolor: ticket.paymentStatus === 'PENDING_VERIFICATION' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                                  color: ticket.paymentStatus === 'PENDING_VERIFICATION' ? '#FCD34D' : '#6EE7B7',
                                  fontWeight: 700,
                                  borderRadius: 2,
                                }}
                              />
                              {ticket.event?.startDate && new Date(ticket.event.startDate) > new Date() && (!ticket.paymentStatus || ticket.paymentStatus === 'PAID') && (
                                <Chip
                                  label="Upcoming Booked"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(59, 130, 246, 0.2)',
                                    color: '#93C5FD',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              {ticket.event?.startDate ? `Event Date: ${new Date(ticket.event.startDate).toLocaleDateString()}` : 'Event date pending'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* My Workshops Section */}
          <Card
            elevation={0}
            sx={{
              ...PANEL_SX_ALT,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 20, color: '#38BDF8' }} />
                  My Workshops
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/workshops')}
                  sx={{
                    textTransform: 'none',
                    color: '#38BDF8',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' },
                  }}
                >
                  Explore
                </Button>
              </Box>

              {myEnrollments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3.5 }}>
                  <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                    No workshop enrollments yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {myEnrollments.map((enrollment) => {
                    const startDate = enrollment.startDate ? new Date(enrollment.startDate) : null;
                    const durationWeeks = Number(enrollment.program?.duration?.weeks || 0);
                    const endDate = startDate && durationWeeks > 0
                      ? new Date(startDate.getTime() + (durationWeeks * 7 * 24 * 60 * 60 * 1000))
                      : null;
                    const rating = Number(enrollment.program?.rating?.average || 0);

                    return (
                      <Grid item xs={12} key={enrollment._id}>
                        <Paper elevation={0} sx={{ ...SUBCARD_SX, width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 1, minWidth: 220 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#F8FAFC' }}>
                                {enrollment.program?.title || 'Workshop'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                                {enrollment.program?.sport || 'Sport'} • {enrollment.program?.level || 'Level'}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.2 }}>
                                <Chip
                                  icon={<Star sx={{ fontSize: 14 }} />}
                                  label={`Rating ${rating.toFixed(1)}`}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(245, 158, 11, 0.18)', color: '#FDE68A', fontWeight: 700 }}
                                />
                                {enrollment.coachRating?.score ? (
                                  <Chip
                                    label={`Your Rating ${Number(enrollment.coachRating.score).toFixed(1)}★`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(16,185,129,0.18)', color: '#6EE7B7', fontWeight: 700 }}
                                  />
                                ) : null}
                                <Chip
                                  label={`Status: ${enrollment.status}`}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(59,130,246,0.18)', color: '#93C5FD', fontWeight: 700, textTransform: 'capitalize' }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block' }}>
                                Starts: {startDate ? startDate.toLocaleDateString() : 'Not set'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block' }}>
                                Ends: {endDate ? endDate.toLocaleDateString() : 'Depends on schedule'}
                              </Typography>
                              <Box sx={{ mt: 1.2 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => openRateDialog(enrollment)}
                                  sx={{
                                    textTransform: 'none',
                                    borderColor: 'rgba(251,191,36,0.45)',
                                    color: '#FDE68A',
                                    fontWeight: 700,
                                    '&:hover': { borderColor: '#FCD34D', bgcolor: 'rgba(245,158,11,0.1)' },
                                  }}
                                >
                                  {enrollment.coachRating?.score ? 'Edit Coach Rating' : 'Rate Coach'}
                                </Button>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid
          item
          xs={12}
          lg={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.75,
            alignSelf: 'stretch',
            width: '100%',
            minWidth: 0,
          }}
        >
          {/* 🔔 Order Notifications card */}
          <Card
            elevation={0}
            sx={{ ...PANEL_SX_ALT, width: '100%' }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip label={unreadCount} color="error" size="small" />
                  )}
                </Box>
                {notifications.length > 0 && (
                  <Button size="small" onClick={markAllRead} sx={{ textTransform: 'none', color: '#94A3B8', fontSize: '0.75rem' }}>
                    Mark all read
                  </Button>
                )}
              </Box>

              {notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Notifications sx={{ fontSize: 40, color: '#475569', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    No notifications yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                    Order status updates will appear here
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {notifications.slice(0, 6).map((n) => (
                    <Paper
                      key={n.id}
                      elevation={0}
                      onClick={() => markRead(n.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: n.read ? BORDER_SUBTLE : (SEV_COLOR[n.severity] || '#3B82F6'),
                        bgcolor: n.read ? 'transparent' : (SEV_BG[n.severity] || SEV_BG.info),
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.3)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ fontSize: 18, lineHeight: 1.4, flexShrink: 0 }}>{n.emoji || '🔔'}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700, mb: 0.2 }} noWrap>
                            {n.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                            {n.message}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                  {notifications.length > 6 && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', pt: 0.5 }}>
                      +{notifications.length - 6} more — tap the bell icon above for full list
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card
            elevation={0}
            sx={{
              ...PANEL_SX_ALT,
              width: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ fontSize: 20, color: '#A78BFA' }} />
                Recent Activity
              </Typography>

              {activityFeed.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    No recent activity
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {activityFeed.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.08)', width: 40, height: 40, color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.12)' }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              {activity.subtitle} • {new Date(activity.time).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < activityFeed.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Recommended Events */}
          <Card
            elevation={0}
            sx={{
              ...PANEL_SX_ALT,
              width: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ fontSize: 20, color: '#F59E0B' }} />
                  Recommended Events
                </Typography>
                <IconButton size="small" sx={{ color: '#94A3B8' }}>
                  <Notifications />
                </IconButton>
              </Box>

              {recommendedEvents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    No events available
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {recommendedEvents.slice(0, 3).map((event) => (
                    <Paper
                      key={event._id}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        cursor: 'pointer',
                        ...SUBCARD_SX,
                        '&:hover': {
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.34)',
                          borderColor: 'rgba(96, 165, 250, 0.5)',
                        },
                      }}
                      onClick={() => handleEventClick(event._id)}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#F8FAFC' }}>
                        {event.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={event.sport}
                          size="small"
                          sx={{ bgcolor: 'rgba(96, 165, 250, 0.2)', color: '#BFDBFE', fontWeight: 600, borderRadius: 2 }}
                        />
                        <Chip
                          label={event.eventType}
                          size="small"
                          sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#E2E8F0', fontWeight: 600, borderRadius: 2 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: '#94A3B8' }} />
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {new Date(event.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/events')}
                    sx={{
                      mt: 1,
                      borderColor: 'rgba(148, 163, 184, 0.35)',
                      borderWidth: 1,
                      color: '#E2E8F0',
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        borderWidth: 1,
                        borderColor: '#60A5FA',
                        bgcolor: 'rgba(59, 130, 246, 0.12)',
                      },
                    }}
                  >
                    View All Events
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={rateDialogOpen}
        onClose={() => !ratingLoading && setRateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: SURFACE_ALT, border: `1px solid ${BORDER_SUBTLE}` } }}
      >
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 800 }}>
          Rate Coach
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ color: '#CBD5E1', mb: 1 }}>
              {selectedEnrollment?.coach?.name ? `Coach: ${selectedEnrollment.coach.name}` : 'Submit your coach rating'}
            </Typography>
            <Rating
              value={coachRatingValue}
              precision={1}
              onChange={(_, v) => setCoachRatingValue(Number(v || 0))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Feedback (optional)"
              value={coachRatingFeedback}
              onChange={(e) => setCoachRatingFeedback(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#F8FAFC' },
                '& .MuiInputLabel-root': { color: '#94A3B8' },
              }}
            />
            {ratingError ? (
              <Alert severity="error" sx={{ mt: 2 }}>{ratingError}</Alert>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateDialogOpen(false)} disabled={ratingLoading}>Cancel</Button>
          <Button variant="contained" onClick={submitCoachRating} disabled={ratingLoading}>
            {ratingLoading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
}

export default UserDashboard;
