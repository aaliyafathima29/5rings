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
  Badge,
  Stack,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as BellIcon,
  Event as EventIcon,
  PublishedWithChanges as PublishedIcon,
  AttachMoney as RevenueIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import api from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsPanel from '../shared/NotificationsPanel';

function EventOrganizerDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const { unreadCount, markAllRead } = useNotifications();
  useEffect(() => { if (tabValue === 4) markAllRead(); }, [tabValue, markAllRead]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    eventType: 'match',
    venue: 'default',
    venueName: '',
    venueAddress: '',
    startDate: '',
    endDate: '',
    ticketCategories: [
      { name: 'General', price: 10, available: 100 },
      { name: 'VIP', price: 50, available: 20 },
    ],
    status: 'draft',
    images: [], // Added for image upload support
  });

  useEffect(() => {
    loadEvents();
    loadVenues();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/organizer/events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadVenues = async () => {
    try {
      // Create a default venue if none exists
      const defaultVenue = {
        _id: 'default',
        name: 'Main Stadium',
        address: { city: 'Default City', country: 'Default Country' },
        capacity: 1000,
      };
      setVenues([defaultVenue]);
    } catch (error) {
      console.error('Failed to load venues:', error);
    }
  };

  const getStartingPrice = (event) => {
    const prices = (event.ticketCategories || [])
      .map((cat) => Number(cat.price))
      .filter((price) => Number.isFinite(price));
    if (!prices.length) return null;
    return Math.min(...prices);
  };

  const formatVenueAddress = (venue) => {
    const address = venue?.address;
    if (!address) return '';
    if (typeof address === 'string') return address;
    return Object.values(address)
      .filter((val) => val && typeof val === 'string')
      .join(', ');
  };

  const handleCreateEvent = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.sport || !formData.startDate || !formData.endDate) {
        alert('Please fill in all required fields');
        return;
      }

      // Ensure venue is set to default if not selected
      const eventData = {
        ...formData,
        venue: formData.venue || 'default',
      };
      
      if (currentEvent) {
        await api.put(`/events/${currentEvent._id}`, eventData);
      } else {
        await api.post('/events', eventData);
      }
      setOpenDialog(false);
      loadEvents();
      resetForm();
      alert('Event saved successfully!');
    } catch (error) {
      console.error('Failed to save event:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save event. Check console for details.');
    }
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setFormData({
      ...event,
      venueName: event.venueName || event.venue?.name || '',
      venueAddress: event.venueAddress || formatVenueAddress(event.venue) || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        loadEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const resetForm = () => {
    setCurrentEvent(null);
    setFormData({
      title: '',
      description: '',
      sport: '',
      eventType: 'match',
      venue: 'default',
      venueName: '',
      venueAddress: '',
      startDate: '',
      endDate: '',
      ticketCategories: [
        { name: 'General', price: 10, available: 100 },
        { name: 'VIP', price: 50, available: 20 },
      ],
      status: 'draft',
      images: [],
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, images: [reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Hero Header */}
      <Card elevation={0} sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', 
        color: 'white', 
        borderRadius: 4, 
        overflow: 'hidden', 
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                fontSize: 32,
                border: '2px solid rgba(255,255,255,0.2)' 
              }}>🏆</Avatar>
              <Box>
                <Typography variant="h3" className="text-gradient" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Event Organizer
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 450 }}>
                  Create events • Manage tickets • Track revenue
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { resetForm(); setOpenDialog(true); }}
              sx={{ 
                bgcolor: 'white', 
                color: '#0f172a', 
                fontWeight: 800, 
                textTransform: 'none', 
                px: 4, 
                py: 1.5, 
                borderRadius: 2.5, 
                boxShadow: '0 4px 14px rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'translateY(-2px)' },
                transition: 'all 0.2s'
              }}
            >
              New Event
            </Button>
          </Box>
        </CardContent>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, right: 120, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </Card>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[ 
          { label: 'Total Events', value: events.length, icon: <EventIcon sx={{ fontSize: 22 }} />, color: '#60A5FA' },
          { label: 'Published', value: events.filter(e => e.status === 'published').length, icon: <PublishedIcon sx={{ fontSize: 22 }} />, color: '#10B981' },
          { label: 'Completed', value: events.filter(e => e.status === 'completed').length, icon: <TrophyIcon sx={{ fontSize: 22 }} />, color: '#F59E0B' },
          { label: 'Total Revenue', value: `₹${events.reduce((s, e) => s + (e.totalRevenue || 0), 0).toLocaleString()}`, icon: <RevenueIcon sx={{ fontSize: 22 }} />, color: '#EC4899' },
        ].map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Card className="glass-panel" elevation={0} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 }}>{stat.label}</Typography>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: `rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, border: '1px solid rgba(255,255,255,0.1)' }}>{stat.icon}</Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#f8fafc' }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Panel */}
      <Paper className="glass-panel" elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, bgcolor: 'transparent' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ 
            px: 2, 
            borderBottom: '1px solid rgba(255,255,255,0.1)', 
            '& .MuiTab-root': { 
              textTransform: 'none', 
              fontWeight: 700, 
              color: '#94a3b8', 
              minHeight: 64, 
              fontSize: '0.95rem',
              '&.Mui-selected': { color: '#60A5FA' } 
            }, 
            '& .MuiTabs-indicator': { bgcolor: '#60A5FA', height: 3, borderRadius: '3px 3px 0 0' } 
          }}
        >
          <Tab label="All Events" />
          <Tab label="Draft" />
          <Tab label="Published" />
          <Tab label="Completed" />
          <Tab label={
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1 }}><BellIcon sx={{ fontSize: 18 }} /><span>Notifications</span></Stack>
            </Badge>
          } />
        </Tabs>

        {tabValue !== 4 && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Sport</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.filter(event => {
                  if (tabValue === 0) return true;
                  if (tabValue === 1) return event.status === 'draft';
                  if (tabValue === 2) return event.status === 'published';
                  if (tabValue === 3) return event.status === 'completed';
                  return true;
                }).map(event => (
                  <TableRow key={event._id} hover sx={{ '&:last-child td': { border: 0 }, '& td': { borderColor: 'rgba(255,255,255,0.05)', color: '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{event.title}</TableCell>
                    <TableCell>{event.sport}</TableCell>
                    <TableCell>{event.startDate ? new Date(event.startDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      <Chip label={event.status} size="small"
                        sx={{ 
                          fontWeight: 700,
                          bgcolor: event.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                          color: event.status === 'published' ? '#10B981' : '#F8FAFC',
                          border: '1px solid',
                          borderColor: event.status === 'published' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#EC4899' }}>
                      {getStartingPrice(event) !== null
                        ? `₹${getStartingPrice(event).toLocaleString()}`
                        : 'Free'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit">
                          <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditEvent(event)} sx={{ textTransform: 'none', fontWeight: 700, color: '#60A5FA', borderRadius: 2, '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.1)' } }}>Edit</Button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={() => handleDeleteEvent(event._id)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Delete</Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {events.filter(event => { if (tabValue === 0) return true; if (tabValue === 1) return event.status === 'draft'; if (tabValue === 2) return event.status === 'published'; if (tabValue === 3) return event.status === 'completed'; return true; }).length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, color: '#94A3B8', border: 0 }}>No events found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tabValue === 4 && <NotificationsPanel />}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{currentEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Event Type"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="match">Match</option>
                <option value="tournament">Tournament</option>
                <option value="workshop">Workshop</option>
                <option value="camp">Camp</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select Venue</option>
                {venues.map((venue) => (
                  <option key={venue._id} value={venue._id}>
                    {venue.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Venue Name (display)"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Venue Address (display)"
                value={formData.venueAddress}
                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, p: 2, background: 'rgba(255,255,255,0.02)' }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>Ticket Categories & Pricing</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="General Ticket Price (₹)"
                      type="number"
                      value={formData.ticketCategories[0]?.price || 0}
                      onChange={(e) => {
                        const newCats = [...formData.ticketCategories];
                        if(!newCats[0]) newCats[0] = { name: 'General', price: 0, available: 100 };
                        newCats[0].price = Number(e.target.value);
                        setFormData({ ...formData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="General Availability"
                      type="number"
                      value={formData.ticketCategories[0]?.available || 0}
                      onChange={(e) => {
                        const newCats = [...formData.ticketCategories];
                        if(!newCats[0]) newCats[0] = { name: 'General', price: 0, available: 100 };
                        newCats[0].available = Number(e.target.value);
                        setFormData({ ...formData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="VIP Ticket Price (₹)"
                      type="number"
                      value={formData.ticketCategories[1]?.price || 0}
                      onChange={(e) => {
                        const newCats = [...formData.ticketCategories];
                        if(!newCats[1]) newCats[1] = { name: 'VIP', price: 0, available: 20 };
                        newCats[1].price = Number(e.target.value);
                        setFormData({ ...formData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="VIP Availability"
                      type="number"
                      value={formData.ticketCategories[1]?.available || 0}
                      onChange={(e) => {
                        const newCats = [...formData.ticketCategories];
                        if(!newCats[1]) newCats[1] = { name: 'VIP', price: 0, available: 20 };
                        newCats[1].available = Number(e.target.value);
                        setFormData({ ...formData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '1px dashed rgba(148,163,184,0.6)', borderRadius: 2, p: 2.5, mt: 1, bgcolor: 'rgba(15,23,42,0.6)' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Event Image Cover</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Upload a banner image to be shown on the events page.
                </Typography>
                <input
                  id="event-cover-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="event-cover-input">
                  <Button
                    variant="outlined"
                    component="span"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                    }}
                  >
                    Choose file
                  </Button>
                </label>
                {formData.images && formData.images.length > 0 && (
                  <Box mt={2}>
                    <img
                      src={formData.images[0]}
                      alt="Event cover"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEvent} sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700, px: 3, borderRadius: 2, '&:hover': { bgcolor: '#1e293b' } }}>
            {currentEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EventOrganizerDashboard;
