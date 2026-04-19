import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * PageLoader
 *
 * Full-viewport centred spinner — the single source of truth for "page is
 * loading" states across the entire app (auth checks, route guards, etc.)
 *
 * Props:
 *   message – optional string shown beneath the spinner
 *   size    – CircularProgress size (default 48)
 *   minHeight – override minimum height (default '100vh')
 */
const PageLoader = ({ message, size = 48, minHeight = '100vh' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight,
      gap: 2,
      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)',
    }}
  >
    <CircularProgress
      size={size}
      thickness={4}
      sx={{
        color: '#1E40AF',
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round',
        },
      }}
    />
    {message && (
      <Typography
        variant="body2"
        sx={{ color: '#64748B', fontWeight: 500, letterSpacing: '0.02em' }}
      >
        {message}
      </Typography>
    )}
  </Box>
);

export default PageLoader;
