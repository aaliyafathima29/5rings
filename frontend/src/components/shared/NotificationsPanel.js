import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Notifications as BellIcon,
  DoneAll as MarkReadIcon,
  DeleteSweep as ClearIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';

const SEV_COLOR = {
  warning: '#F97316',
  success: '#10B981',
  info:    '#3B82F6',
  error:   '#EF4444',
};

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

/**
 * Shared real-time notifications panel.
 * Drop this anywhere — it reads from NotificationContext (no props needed).
 */
const NotificationsPanel = ({ sx = {} }) => {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();

  return (
    <Box sx={{ p: 2, ...sx }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <BellIcon color="warning" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} unread`} color="warning" size="small" />
          )}
        </Stack>
        {notifications.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Mark all read">
              <Button size="small" startIcon={<MarkReadIcon />} onClick={markAllRead} variant="outlined">
                Mark read
              </Button>
            </Tooltip>
            <Tooltip title="Clear all">
              <Button size="small" startIcon={<ClearIcon />} onClick={clearAll} variant="outlined" color="error">
                Clear
              </Button>
            </Tooltip>
          </Stack>
        )}
      </Box>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
          <BellIcon sx={{ fontSize: 64, mb: 2, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">No notifications yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time updates will appear here automatically
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <Paper
              key={n.id}
              elevation={0}
              onClick={() => markRead(n.id)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: n.read ? 'divider' : 'warning.main',
                borderLeft: '4px solid',
                borderLeftColor: n.read
                  ? 'divider'
                  : (SEV_COLOR[n.severity] || '#F97316'),
                bgcolor: n.read
                  ? 'transparent'
                  : alpha(SEV_COLOR[n.severity] || '#F97316', 0.05),
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ fontSize: 28, lineHeight: 1.2, mt: 0.2 }}>
                    {n.emoji || '🔔'}
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: n.read ? 500 : 800,
                        color: n.read ? 'text.primary' : 'warning.dark',
                      }}
                    >
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                      {n.message}
                    </Typography>
                    {n.data?.deliveryLocation?.seatNumber && (
                      <Chip
                        label={`🪑 Seat ${n.data.deliveryLocation.seatNumber}${
                          n.data.deliveryLocation.section
                            ? ` · Section ${n.data.deliveryLocation.section}`
                            : ''
                        }`}
                        size="small"
                        sx={{ mt: 0.5 }}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 70, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(n.timestamp)}
                  </Typography>
                  {!n.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        ml: 'auto',
                        mt: 0.5,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default NotificationsPanel;
