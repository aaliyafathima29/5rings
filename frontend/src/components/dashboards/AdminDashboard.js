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
  alpha,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  EmojiEvents as EmojiEventsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as BellIcon,
} from '@mui/icons-material';
import api from '../../utils/api';
import CreateSpecialUser from '../Admin/CreateSpecialUser';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsPanel from '../shared/NotificationsPanel';

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const { unreadCount, markAllRead } = useNotifications();
  useEffect(() => { if (tabValue === 6) markAllRead(); }, [tabValue, markAllRead]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [events, setEvents] = useState([]);
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState('');
  const [deleteUserSuccess, setDeleteUserSuccess] = useState(false);
  const [openEditEvent, setOpenEditEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    sport: '',
    eventType: 'match',
    startDate: '',
    endDate: '',
    status: 'draft',
    ticketCategories: [
      { name: 'General', price: 0, available: 100 },
      { name: 'VIP', price: 0, available: 20 },
    ],
    images: [],
  });

  useEffect(() => {
    loadStats();
    loadUsers();
    loadPendingApprovals();
    loadEvents();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const response = await api.get('/admin/users?isApproved=false');
      setPendingApprovals(response.data.users);
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleApproval = async (userId, isApproved) => {
    try {
      await api.put('/admin/users/approve', { userId, isApproved });
      loadPendingApprovals();
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Failed to update approval:', error);
    }
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      sport: event.sport,
      eventType: event.eventType,
      startDate: event.startDate ? event.startDate.slice(0, 16) : '',
      endDate: event.endDate ? event.endDate.slice(0, 16) : '',
      status: event.status,
    });
    setOpenEditEvent(true);
  };

  const handleUpdateEvent = async () => {
    try {
      await api.put(`/events/${currentEvent._id}`, eventFormData);
      setOpenEditEvent(false);
      loadEvents();
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Failed to update event:', error);
      alert(error.response?.data?.message || 'Failed to update event');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventFormData({ ...eventFormData, images: [reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        loadEvents();
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const openDeleteUserConfirm = (user) => {
    setSelectedUserForDelete(user);
    setDeleteUserError('');
    setOpenDeleteUserDialog(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!selectedUserForDelete?._id) return;

    try {
      setDeleteUserLoading(true);
      setDeleteUserError('');
      await api.delete(`/admin/users/${selectedUserForDelete._id}`);
      setOpenDeleteUserDialog(false);
      setSelectedUserForDelete(null);
      setDeleteUserSuccess(true);
      loadUsers();
      loadPendingApprovals();
      loadStats();
    } catch (error) {
      setDeleteUserError(error.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteUserLoading(false);
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
              }}>⚙️</Avatar>
              <Box>
                <Typography variant="h3" className="text-gradient" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 450 }}>
                  Manage users • Monitor events • Control the platform
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenCreateUser(true)}
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
              Create Special User
            </Button>
          </Box>
        </CardContent>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, right: 120, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </Card>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Total Users',       value: stats.totalUsers || 0,       icon: <PeopleIcon sx={{ fontSize: 22 }} />,       color: '#60A5FA' },
          { label: 'Total Events',      value: stats.totalEvents || 0,      icon: <EventIcon sx={{ fontSize: 22 }} />,         color: '#10B981' },
          { label: 'Programs',          value: stats.totalPrograms || 0,    icon: <EmojiEventsIcon sx={{ fontSize: 22 }} />,   color: '#3B82F6' },
          { label: 'Pending Approvals', value: stats.pendingApprovals || 0, icon: <PeopleIcon sx={{ fontSize: 22 }} />,        color: '#F59E0B' },
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

      <Paper className="glass-panel" elevation={0} sx={{ width: '100%', mb: 4, borderRadius: 4, overflow: 'hidden', bgcolor: 'transparent' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            px: 2,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              color: '#94A3B8',
              minHeight: 64,
              fontSize: '0.95rem',
              '&.Mui-selected': {
                color: '#60A5FA',
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#60A5FA',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label="Pending Approvals" />
          <Tab label="All Users" />
          <Tab label="Event Organizers" />
          <Tab label="Vendors" />
          <Tab label="Coaches" />
          <Tab label="All Events" />
          <Tab
            label={
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1 }}>
                  <BellIcon sx={{ fontSize: 18 }} />
                  <span>Notifications</span>
                </Stack>
              </Badge>
            }
          />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingApprovals.map((user) => (
                  <TableRow key={user._id} hover sx={{ '&:last-child td': { border: 0 }, '& td': { borderColor: 'rgba(255,255,255,0.05)', color: '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Chip label={user.role} size="small" variant="outlined" sx={{ color: '#F8FAFC', borderColor: 'rgba(255,255,255,0.2)' }} /></TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleApproval(user._id, true)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, boxShadow: 'none' }}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleApproval(user._id, false)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>Reject</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingApprovals.length === 0 && (<TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94A3B8', border: 0 }}>✅ No pending approvals</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue >= 1 && tabValue <= 4 && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.filter(user => {
                  if (tabValue === 1) return true;
                  if (tabValue === 2) return user.role === 'event_organizer';
                  if (tabValue === 3) return user.role === 'vendor';
                  if (tabValue === 4) return user.role === 'coach';
                  return true;
                }).map(user => (
                  <TableRow key={user._id} hover sx={{ '&:last-child td': { border: 0 }, '& td': { borderColor: 'rgba(255,255,255,0.05)', color: '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Chip label={user.role} size="small" variant="outlined" sx={{ color: '#F8FAFC', borderColor: 'rgba(255,255,255,0.2)' }} /></TableCell>
                    <TableCell><Chip label={user.isApproved ? 'Approved' : 'Pending'} sx={{ bgcolor: user.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: user.isApproved ? '#10B981' : '#F59E0B' }} size="small" /></TableCell>
                    <TableCell><Chip label={user.isVerified ? 'Verified' : 'No'} sx={{ bgcolor: user.isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.1)', color: user.isVerified ? '#10B981' : '#F8FAFC' }} size="small" /></TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => openDeleteUserConfirm(user)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.filter(user => { if (tabValue === 1) return true; if (tabValue === 2) return user.role === 'event_organizer'; if (tabValue === 3) return user.role === 'vendor'; if (tabValue === 4) return user.role === 'coach'; return true; }).length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8', border: 0 }}>No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 5 && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Sport</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id} hover sx={{ '&:last-child td': { border: 0 }, '& td': { borderColor: 'rgba(255,255,255,0.05)', color: '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{event.title}</TableCell>
                    <TableCell>{event.sport}</TableCell>
                    <TableCell><Chip label={event.eventType} size="small" variant="outlined" sx={{ color: '#F8FAFC', borderColor: 'rgba(255,255,255,0.2)' }} /></TableCell>
                    <TableCell>{event.startDate ? new Date(event.startDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell><Chip label={event.status} sx={{ bgcolor: event.status === 'published' ? 'rgba(16,185,129,0.1)' : event.status === 'draft' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.1)', color: event.status === 'published' ? '#10B981' : event.status === 'draft' ? '#F59E0B' : '#F8FAFC' }} size="small" /></TableCell>
                    <TableCell>{event.organizer?.name || '—'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditEvent(event)} sx={{ textTransform: 'none', fontWeight: 600, color: '#60A5FA', borderRadius: 1.5 }}>Edit</Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteEvent(event._id)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8', border: 0 }}>No events found</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      {tabValue === 6 && <NotificationsPanel />}
      </Paper>

      <CreateSpecialUser
        open={openCreateUser}
        onClose={() => setOpenCreateUser(false)}
        onUserCreated={() => {
          loadUsers();
          loadStats();
        }}
      />

      <Dialog open={openDeleteUserDialog} onClose={() => !deleteUserLoading && setOpenDeleteUserDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm User Deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#334155', mb: 1.5 }}>
            Are you sure you want to delete <b>{selectedUserForDelete?.name || 'this user'}</b>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            This action cannot be undone.
          </Typography>
          {deleteUserError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteUserError}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteUserDialog(false)} disabled={deleteUserLoading}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDeleteUser} disabled={deleteUserLoading}>
            {deleteUserLoading ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={deleteUserSuccess}
        autoHideDuration={3000}
        onClose={() => setDeleteUserSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setDeleteUserSuccess(false)} severity="success" sx={{ width: '100%' }}>
          User is now deleted.
        </Alert>
      </Snackbar>

      {/* Edit Event Dialog */}
      <Dialog open={openEditEvent} onClose={() => setOpenEditEvent(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Edit Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sport"
                value={eventFormData.sport}
                onChange={(e) => setEventFormData({ ...eventFormData, sport: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Event Type"
                value={eventFormData.eventType}
                onChange={(e) => setEventFormData({ ...eventFormData, eventType: e.target.value })}
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
                value={eventFormData.startDate}
                onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="End Date"
                value={eventFormData.endDate}
                onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={eventFormData.status}
                onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value })}
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
                      value={eventFormData.ticketCategories?.[0]?.price || 0}
                      onChange={(e) => {
                        const newCats = [...(eventFormData.ticketCategories || [])];
                        if(!newCats[0]) newCats[0] = { name: 'General', price: 0, available: 100 };
                        newCats[0].price = Number(e.target.value);
                        setEventFormData({ ...eventFormData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="General Availability"
                      type="number"
                      value={eventFormData.ticketCategories?.[0]?.available || 0}
                      onChange={(e) => {
                        const newCats = [...(eventFormData.ticketCategories || [])];
                        if(!newCats[0]) newCats[0] = { name: 'General', price: 0, available: 100 };
                        newCats[0].available = Number(e.target.value);
                        setEventFormData({ ...eventFormData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="VIP Ticket Price (₹)"
                      type="number"
                      value={eventFormData.ticketCategories?.[1]?.price || 0}
                      onChange={(e) => {
                        const newCats = [...(eventFormData.ticketCategories || [])];
                        if(!newCats[1]) newCats[1] = { name: 'VIP', price: 0, available: 20 };
                        newCats[1].price = Number(e.target.value);
                        setEventFormData({ ...eventFormData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="VIP Availability"
                      type="number"
                      value={eventFormData.ticketCategories?.[1]?.available || 0}
                      onChange={(e) => {
                        const newCats = [...(eventFormData.ticketCategories || [])];
                        if(!newCats[1]) newCats[1] = { name: 'VIP', price: 0, available: 20 };
                        newCats[1].available = Number(e.target.value);
                        setEventFormData({ ...eventFormData, ticketCategories: newCats });
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 2, p: 2, mt: 1 }}>
                 <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Event Image Cover</Typography>
                 <input 
                   type="file" 
                   accept="image/*" 
                   onChange={handleImageUpload} 
                   style={{ width: '100%', padding: '10px' }} 
                 />
                 {eventFormData.images && eventFormData.images.length > 0 && (
                   <Box mt={2}>
                     <img src={eventFormData.images[0]} alt="Event cover" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '8px' }} />
                   </Box>
                 )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenEditEvent(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateEvent} sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700, px: 3, borderRadius: 2, '&:hover': { bgcolor: '#1e293b' } }}>Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard;
