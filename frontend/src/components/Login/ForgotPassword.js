import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  CircularProgress,
  Fade,
  Zoom,
} from '@mui/material';
import { Email, LockReset, ArrowBack } from '@mui/icons-material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [mounted] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      // Backend always returns success (prevents user enumeration)
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent', // Falls back to body background #0B1120 from index.css
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, sm: 6 },
        px: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(30,64,175,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10, px: { xs: 0, sm: 2 } }}>
        <Fade in={mounted} timeout={800}>
          <Card
            elevation={0}
            className="glass-panel"
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              width: '100%',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #1E40AF, #3B82F6, #60A5FA)',
                borderRadius: '16px 16px 0 0',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 6 } }}>
              <Zoom in={mounted} style={{ transitionDelay: '300ms' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <LockReset sx={{ fontSize: 40, color: '#60A5FA' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    className="text-gradient"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '1.75rem', sm: '2.25rem' }
                    }}
                  >
                    Forgot Password?
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                    {sent
                      ? 'Check your inbox for the reset code.'
                      : "Enter your email and we'll send you a reset code."}
                  </Typography>
                </Box>
              </Zoom>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {error}
                </Alert>
              )}

              {sent ? (
                <Fade in timeout={600}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2, textAlign: 'left', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      A 6-digit reset code has been sent to <strong style={{color: '#fff'}}>{email}</strong> if it's registered.
                      The code expires in <strong style={{color: '#fff'}}>10 minutes</strong>.
                    </Alert>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/reset-password', { state: { email } })}
                      sx={{
                        mb: 2,
                        py: 1.8,
                        fontSize: '1rem',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                        color: '#ffffff',
                        '&:hover': {
                          background: 'linear-gradient(to right, #2563EB, #1D4ED8)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Enter Reset Code
                    </Button>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Didn't receive it?{' '}
                      <Link
                        component="button"
                        onClick={() => setSent(false)}
                        sx={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: '#93C5FD' } }}
                      >
                        Try again
                      </Link>
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    margin="normal"
                    InputLabelProps={{ sx: { color: '#94A3B8' } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#60A5FA' }} />
                        </InputAdornment>
                      ),
                      sx: { color: '#F8FAFC' }
                    }}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                        transition: 'all 0.3s ease',
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mb: 2,
                      py: 1.8,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                      color: '#ffffff',
                      '&:hover': {
                        background: 'linear-gradient(to right, #2563EB, #1D4ED8)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
                      },
                      '&.Mui-disabled': { background: 'rgba(59, 130, 246, 0.3)', color: 'rgba(255, 255, 255, 0.3)' },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                        <Typography variant="button">Sending...</Typography>
                      </Box>
                    ) : (
                      'Send Reset Code'
                    )}
                  </Button>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#94A3B8',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': { color: '#F8FAFC' },
                    transition: 'color 0.2s',
                  }}
                >
                  <ArrowBack fontSize="small" />
                  Back to Sign In
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
