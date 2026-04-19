import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  alpha,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
} from '@mui/icons-material';

/**
 * ErrorBoundary
 *
 * Catches any uncaught render/lifecycle exception in its subtree and replaces
 * the crashed tree with a styled recovery screen instead of a white screen.
 *
 * Usage (wrapping an entire route group):
 *   <ErrorBoundary>
 *     <SomePage />
 *   </ErrorBoundary>
 *
 * Props:
 *   children   – subtree to protect
 *   fallback   – optional custom ReactNode to render on error (overrides default UI)
 *   onError    – optional callback(error, info) for external logging
 *   resetKeys  – optional array; when any value changes the boundary auto-resets
 *                (useful for wrapping route-level components — changing route resets it)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info);
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  // Allow parent to reset via a key change (e.g. route change)
  componentDidUpdate(prevProps) {
    const { resetKeys } = this.props;
    if (
      this.state.hasError &&
      resetKeys &&
      resetKeys.some((k, i) => k !== (prevProps.resetKeys || [])[i])
    ) {
      this.reset();
    }
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    // Custom fallback takes full control
    if (this.props.fallback) return this.props.fallback;

    const isDev = process.env.NODE_ENV === 'development';
    const message = this.state.error?.message || 'An unexpected error occurred.';

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 50%, #FECACA 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid #FECACA',
              boxShadow: '0 20px 25px -5px rgba(220,38,38,0.1), 0 10px 10px -5px rgba(220,38,38,0.04)',
              background: 'linear-gradient(145deg, #ffffff 0%, #fff8f8 100%)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #DC2626, #EF4444, #DC2626)',
                borderRadius: '16px 16px 0 0',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
              {/* Icon */}
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: alpha('#DC2626', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: `2px solid ${alpha('#DC2626', 0.2)}`,
                }}
              >
                <ErrorOutline sx={{ fontSize: 48, color: '#DC2626' }} />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#DC2626',
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                An unexpected error occurred in this part of the app.
              </Typography>

              {/* Show error details only in development */}
              {isDev && (
                <Box
                  sx={{
                    my: 2,
                    p: 2,
                    borderRadius: 2,
                    background: '#1E293B',
                    textAlign: 'left',
                    maxHeight: 120,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: '#F87171', wordBreak: 'break-all' }}
                  >
                    {message}
                  </Typography>
                </Box>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.reset}
                  sx={{
                    py: 1.4,
                    px: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(220,38,38,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Try Again
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={() => { this.reset(); window.location.href = '/'; }}
                  sx={{
                    py: 1.4,
                    px: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: '#DC2626',
                    color: '#DC2626',
                    '&:hover': {
                      borderColor: '#B91C1C',
                      background: alpha('#DC2626', 0.05),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Go Home
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }
}

export default ErrorBoundary;
