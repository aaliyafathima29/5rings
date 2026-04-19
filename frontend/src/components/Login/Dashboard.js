import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Logout,
  Home,
  Notifications as BellIcon,
  NotificationsNone as BellEmptyIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as ClearIcon,
  Circle as DotIcon,
} from '@mui/icons-material';
import { resetSocket } from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import EventOrganizerDashboard from '../dashboards/EventOrganizerDashboard';
import VendorDashboard from '../dashboards/VendorDashboard';
import KitchenDashboard from '../dashboards/KitchenDashboard';
import CoachDashboard from '../dashboards/CoachDashboard';
import AdminDashboard from '../dashboards/AdminDashboard';
import UserDashboard from '../dashboards/UserDashboard';
import DeliveryDashboard from '../dashboards/DeliveryDashboard';

// ── Role → dashboard config map ─────────────────────────────────────────────
const ROLE_CONFIG = {
  admin:           { label: 'Admin',           Component: AdminDashboard },
  event_organizer: { label: 'Event Organizer',  Component: EventOrganizerDashboard },
  vendor:          { label: 'Vendor',           Component: VendorDashboard },
  kitchen:         { label: 'Kitchen',          Component: KitchenDashboard },
  coach:           { label: 'Coach',            Component: CoachDashboard },
  delivery:        { label: 'Delivery',         Component: DeliveryDashboard },
};

// ── SEVERITY → colour map ────────────────────────────────────────────────────
const SEVERITY_COLOR = {
  warning: '#F97316',
  success: '#10B981',
  info:    '#3B82F6',
  error:   '#EF4444',
};

// ── Notification Bell (uses NotificationContext) ─────────────────────────────
const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead, clearAll, markRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    markAllRead();
  };
  const handleClose = () => setAnchorEl(null);

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpen} sx={{ mr: 1, color: 'white' }}>
          <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
            {unreadCount > 0 ? <BellIcon /> : <BellEmptyIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 8,
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 2, py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            🔔 Notifications
            {notifications.length > 0 && (
              <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontWeight: 400, fontSize: '0.85rem' }}>
                ({notifications.length})
              </Box>
            )}
          </Typography>
          {notifications.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Mark all read">
                <IconButton size="small" onClick={markAllRead}>
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear all">
                <IconButton size="small" onClick={clearAll}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* List */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, opacity: 0.5 }}>
              <BellEmptyIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">No notifications yet</Typography>
              <Typography variant="caption" color="text.secondary">
                Order updates will appear here
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((n, idx) => (
                <React.Fragment key={n.id}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => markRead(n.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: n.read ? 'transparent' : alpha(SEVERITY_COLOR[n.severity] || '#3B82F6', 0.06),
                      '&:hover': { bgcolor: 'action.hover' },
                      py: 1.2,
                      px: 2,
                      borderLeft: n.read
                        ? '3px solid transparent'
                        : `3px solid ${SEVERITY_COLOR[n.severity] || '#3B82F6'}`,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5, fontSize: 20 }}>
                      {n.emoji || '🔔'}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: n.read ? 500 : 700, flex: 1, mr: 1 }}
                          >
                            {n.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {timeAgo(n.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {n.message}
                        </Typography>
                      }
                    />
                    {!n.read && (
                      <DotIcon sx={{ fontSize: 8, color: SEVERITY_COLOR[n.severity] || '#3B82F6', ml: 0.5, mt: 0.8, flexShrink: 0 }} />
                    )}
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

// ── Shared app-bar ───────────────────────────────────────────────────────────
const DashboardAppBar = ({ label, onHome, onLogout }) => (
  <AppBar position="static" elevation={0}>
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
        5Rings Sport Platform{label ? ` — ${label}` : ''}
      </Typography>
      {/* 🔔 Notification Bell */}
      <NotificationBell />
      <Button variant="outlined" startIcon={<Home />} onClick={onHome}
        sx={{ borderColor: 'white', color: 'white', mr: 2 }}>
        Dashboard
      </Button>
      <Button variant="outlined" startIcon={<Logout />} onClick={onLogout}
        sx={{ borderColor: 'white', color: 'white' }}>
        Logout
      </Button>
    </Toolbar>
  </AppBar>
);

// ── Main component ───────────────────────────────────────────────────────────
const Dashboard = () => {
  // Auth state comes from AuthContext — already verified via HttpOnly cookie
  // by the time ProtectedRoute allowed us here.
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    resetSocket();
    await logout(); // clears cookie via POST /auth/logout, clears context + localStorage
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)',
      }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  // Role-specific dashboards (special users — Home button stays in /dashboard)
  if (user && ROLE_CONFIG[user.role]) {
    const { label, Component } = ROLE_CONFIG[user.role];
    return (
      <>
        <DashboardAppBar label={label} onHome={() => navigate('/dashboard')} onLogout={handleLogout} />
        <Component user={user} />
      </>
    );
  }

  // Default: regular user dashboard (Home → public site)
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #F8FAFC 100%)', pb: 4 }}>
      <DashboardAppBar label={null} onHome={() => navigate('/')} onLogout={handleLogout} />
      <UserDashboard user={user} />
    </Box>
  );
};

export default Dashboard;
