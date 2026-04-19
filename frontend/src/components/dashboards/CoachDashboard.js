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
  LinearProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Notifications as BellIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import api, { SERVER_BASE } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsPanel from '../shared/NotificationsPanel';

function CoachDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const { unreadCount, markAllRead } = useNotifications();
  useEffect(() => { if (tabValue === 3) markAllRead(); }, [tabValue, markAllRead]);
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [coachProfile, setCoachProfile] = useState({
    name: '',
    phone: '',
    specialization: '',
    experience: '',
    certifications: '',
    bio: '',
    hourlyRate: '',
    profileImage: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    level: 'beginner',
    duration: {
      weeks: '',
      sessionsPerWeek: '',
      hoursPerSession: '',
    },
    price: '',
    maxStudents: '',
    schedule: [],
    venue: '',
  });

  useEffect(() => {
    loadPrograms();
    loadEnrollments();
    loadCoachProfile();
  }, []);

  const loadCoachProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const coach = response.data?.user || {};
      const specialization = Array.isArray(coach.coachProfile?.specialization)
        ? coach.coachProfile.specialization.join(', ')
        : (coach.coachProfile?.specialization || '');
      const certifications = Array.isArray(coach.coachProfile?.certifications)
        ? coach.coachProfile.certifications.join(', ')
        : (coach.coachProfile?.certifications || '');

      setCoachProfile({
        name: coach.name || '',
        phone: coach.phone || '',
        specialization,
        experience: coach.coachProfile?.experience || '',
        certifications,
        bio: coach.coachProfile?.bio || '',
        hourlyRate: coach.coachProfile?.hourlyRate || '',
        profileImage: coach.profileImage || '',
      });
      setProfileImagePreview(coach.profileImage ? `${SERVER_BASE}${coach.profileImage}` : '');
    } catch (error) {
      console.error('Failed to load coach profile:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await api.get('/coach/programs');
      setPrograms(response.data.programs);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const loadEnrollments = async () => {
    try {
      const response = await api.get('/coach/enrollments');
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    }
  };

  const handleSaveProgram = async () => {
    try {
      if (currentProgram) {
        await api.put(`/programs/${currentProgram._id}`, formData);
      } else {
        await api.post('/programs', formData);
      }
      setOpenDialog(false);
      loadPrograms();
      resetForm();
    } catch (error) {
      console.error('Failed to save program:', error);
    }
  };

  const resetForm = () => {
    setCurrentProgram(null);
    setFormData({
      title: '',
      description: '',
      sport: '',
      level: 'beginner',
      duration: {
        weeks: '',
        sessionsPerWeek: '',
        hoursPerSession: '',
      },
      price: '',
      maxStudents: '',
      schedule: [],
      venue: '',
    });
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('name', coachProfile.name || '');
      formDataPayload.append('phone', coachProfile.phone || '');
      formDataPayload.append('specialization', coachProfile.specialization || '');
      formDataPayload.append('experience', coachProfile.experience || '');
      formDataPayload.append('certifications', coachProfile.certifications || '');
      formDataPayload.append('bio', coachProfile.bio || '');
      formDataPayload.append('hourlyRate', coachProfile.hourlyRate || '');
      if (profileImageFile) {
        formDataPayload.append('image', profileImageFile);
      }

      const response = await api.put('/auth/me', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedCoach = response.data?.user;
      if (updatedCoach) {
        localStorage.setItem('user', JSON.stringify(updatedCoach));
      }

      setProfileSuccess('Coach profile updated successfully.');
      setOpenProfileDialog(false);
      setProfileImageFile(null);
      await loadCoachProfile();
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update coach profile.');
    } finally {
      setProfileLoading(false);
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
              }} src={profileImagePreview || undefined}>
                {profileImagePreview ? undefined : '🏋️'}
              </Avatar>
              <Box>
                <Typography variant="h3" className="text-gradient" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Coach Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 400 }}>
                  Manage programs • Track students • Build champions
                </Typography>
              </Box>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => { setProfileError(''); setProfileSuccess(''); setOpenProfileDialog(true); }}
                sx={{
                  borderColor: 'rgba(255,255,255,0.35)',
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.8,
                  py: 1.3,
                  borderRadius: 2.5,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                Edit Coach Profile
              </Button>
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
                New Program
              </Button>
            </Stack>
          </Box>
        </CardContent>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, right: 120, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </Card>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Programs', value: programs.length, icon: <FitnessCenterIcon sx={{ fontSize: 22 }} />, color: '#6366f1' },
          { label: 'Total Students', value: programs.reduce((s, p) => s + p.enrolled, 0), icon: <PeopleIcon sx={{ fontSize: 22 }} />, color: '#10b981' },
          { label: 'Active Enrollments', value: enrollments.filter(e => e.status === 'active').length, icon: <TrendingUpIcon sx={{ fontSize: 22 }} />, color: '#f59e0b' },
          { label: 'Avg Rating', value: programs.length > 0 ? (programs.reduce((s, p) => s + p.rating.average, 0) / programs.length).toFixed(1) + ' ★' : '—', icon: <StarIcon sx={{ fontSize: 22 }} />, color: '#ec4899' },
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
              '&.Mui-selected': { color: '#6366f1' } 
            }, 
            '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3, borderRadius: '3px 3px 0 0' } 
          }}
        >
          <Tab label="Programs" />
          <Tab label="Active Students" />
          <Tab label="Completed" />
          <Tab label={
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1 }}><BellIcon sx={{ fontSize: 18 }} /><span>Notifications</span></Stack>
            </Badge>
          } />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Sport</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program._id} hover sx={{ '&:last-child td': { border: 0 }, '& td': { borderColor: 'rgba(255,255,255,0.05)', color: '#f8fafc' } }}>
                    <TableCell sx={{ fontWeight: 700 }}>{program.title}</TableCell>
                    <TableCell>{program.sport}</TableCell>
                    <TableCell><Chip label={program.level} size="small" variant="outlined" sx={{ color: '#f8fafc', borderColor: 'rgba(255,255,255,0.2)' }} /></TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 100 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#f8fafc' }}>{program.enrolled}/{program.maxStudents}</Typography>
                        <LinearProgress variant="determinate" value={(program.enrolled / program.maxStudents) * 100} sx={{ mt: 0.8, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 3 } }} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#10b981' }}>₹{program.price}</TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{program.rating.average.toFixed(1)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit program">
                        <Button size="small" startIcon={<EditIcon />} onClick={() => { setCurrentProgram(program); setFormData(program); setOpenDialog(true); }} sx={{ textTransform: 'none', fontWeight: 700, color: '#6366f1', borderRadius: 2, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>Edit</Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {programs.length === 0 && (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: '#94a3b8', border: 0 }}>No programs yet — create your first one</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {(tabValue === 1 || tabValue === 2) && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'rgba(255,255,255,0.03)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
                  <TableCell>Student</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.filter(e => tabValue === 1 ? ['active','paused'].includes(e.status) : e.status === 'completed').map((enrollment) => (
                  <TableRow key={enrollment._id} hover sx={{ '&:last-child td': { border: 0 }, '& td': { borderColor: 'rgba(255,255,255,0.05)', color: '#f8fafc' } }}>
                    <TableCell sx={{ fontWeight: 700 }}>{enrollment.user?.name}</TableCell>
                    <TableCell>{enrollment.program?.title}</TableCell>
                    <TableCell>{new Date(enrollment.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {(() => {
                        const start = enrollment.startDate ? new Date(enrollment.startDate) : null;
                        const weeks = Number(enrollment.program?.duration?.weeks || 0);
                        if (!start || Number.isNaN(start.getTime()) || weeks <= 0) return '—';
                        const end = new Date(start.getTime() + (weeks * 7 * 24 * 60 * 60 * 1000));
                        return end.toLocaleDateString();
                      })()}
                    </TableCell>
                    <TableCell>{enrollment.attendedSessions}/{enrollment.totalSessions}</TableCell>
                    <TableCell>
                      <Chip label={enrollment.status} size="small" sx={{ 
                        fontWeight: 700,
                        bgcolor: enrollment.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: enrollment.status === 'active' ? '#10b981' : '#94a3b8',
                        border: '1px solid',
                        borderColor: enrollment.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                      }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<AssessmentIcon />} sx={{ textTransform: 'none', fontWeight: 700, color: '#6366f1', borderRadius: 2, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>Track</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {enrollments.filter(e => tabValue === 1 ? ['active','paused'].includes(e.status) : e.status === 'completed').length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: '#94a3b8', border: 0 }}>No enrollments found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 3 && <NotificationsPanel />}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 2, pt: 4, color: '#f8fafc', px: 4 }}>{currentProgram ? 'Edit Program' : 'New Program'}</DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Program Title"
                variant="outlined"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                SelectProps={{ native: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Duration (weeks)"
                value={formData.duration?.weeks || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: { ...formData.duration, weeks: e.target.value },
                  })
                }
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Sessions/Week"
                value={formData.duration?.sessionsPerWeek || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: { ...formData.duration, sessionsPerWeek: e.target.value },
                  })
                }
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Hours/Session"
                value={formData.duration?.hoursPerSession || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: { ...formData.duration, hoursPerSession: e.target.value },
                  })
                }
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Students"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', color: '#94a3b8', fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProgram} sx={{ bgcolor: '#6366f1', color: 'white', textTransform: 'none', fontWeight: 800, px: 4, py: 1.2, borderRadius: 2.5, '&:hover': { bgcolor: '#4f46e5' } }}>
            {currentProgram ? 'Update Program' : 'Create Program'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 2, pt: 4, color: '#f8fafc', px: 4 }}>
          Edit Coach Profile
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          {profileError ? <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert> : null}
          {profileSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert> : null}
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={profileImagePreview || undefined} sx={{ width: 68, height: 68 }}>
                {profileImagePreview ? undefined : (coachProfile.name?.charAt(0)?.toUpperCase() || 'C')}
              </Avatar>
              <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />} sx={{ textTransform: 'none', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)' }}>
                Upload Profile Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setProfileImageFile(file);
                    setProfileImagePreview(URL.createObjectURL(file));
                  }}
                />
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Name" value={coachProfile.name} onChange={(e) => setCoachProfile({ ...coachProfile, name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" value={coachProfile.phone} onChange={(e) => setCoachProfile({ ...coachProfile, phone: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Specialization (comma separated)" value={coachProfile.specialization} onChange={(e) => setCoachProfile({ ...coachProfile, specialization: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" label="Experience (years)" value={coachProfile.experience} onChange={(e) => setCoachProfile({ ...coachProfile, experience: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" label="Hourly Rate (₹)" value={coachProfile.hourlyRate} onChange={(e) => setCoachProfile({ ...coachProfile, hourlyRate: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Certifications (comma separated)" value={coachProfile.certifications} onChange={(e) => setCoachProfile({ ...coachProfile, certifications: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Bio" value={coachProfile.bio} onChange={(e) => setCoachProfile({ ...coachProfile, bio: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiOutlinedInput-input': { color: '#f8fafc' } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button onClick={() => setOpenProfileDialog(false)} sx={{ textTransform: 'none', color: '#94a3b8', fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleProfileSave} disabled={profileLoading} sx={{ bgcolor: '#6366f1', color: 'white', textTransform: 'none', fontWeight: 800, px: 4, py: 1.2, borderRadius: 2.5, '&:hover': { bgcolor: '#4f46e5' } }}>
            {profileLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </DialogActions>
      </Dialog>
      {tabValue === 3 && <NotificationsPanel sx={{ mt: 2 }} />}
    </Container>
  );
}

export default CoachDashboard;
