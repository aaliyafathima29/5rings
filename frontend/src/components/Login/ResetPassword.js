import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
  Fade,
  Zoom,
  LinearProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  LockReset,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted] = useState(true);

  const { email, otp, newPassword, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError('Reset code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { resetSuccess: true } }), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderRadius: 2.5,
      border: '1px solid rgba(148,163,184,0.25)',
      transition: 'all 0.25s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 18px rgba(2,6,23,0.45)',
        borderColor: 'rgba(96,165,250,0.6)'
      },
      '&.Mui-focused': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 22px rgba(2,6,23,0.55)',
        borderColor: '#60A5FA'
      },
    },
    '& .MuiInputBase-input': { color: '#E2E8F0' },
    '& .MuiInputLabel-root': { color: '#94A3B8', fontWeight: 600 },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 15% 20%, rgba(59,130,246,0.12), transparent 45%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.08), transparent 40%), linear-gradient(180deg, #0b1120 0%, #0f172a 60%, #0b1120 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-15%',
          left: '-8%',
          width: '440px',
          height: '440px',
          background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Fade in={mounted} timeout={800}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(148,163,184,0.2)',
              boxShadow: '0 30px 60px rgba(2,6,23,0.55)',
              background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.95) 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #60A5FA, #22D3EE, #60A5FA)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
              {success ? (
                <Fade in timeout={600}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle
                      sx={{
                        fontSize: 90,
                        color: 'success.main',
                        mb: 2,
                        animation: 'scaleIn 0.5s ease-out',
                        '@keyframes scaleIn': {
                          '0%': { transform: 'scale(0)' },
                          '50%': { transform: 'scale(1.2)' },
                          '100%': { transform: 'scale(1)' },
                        },
                      }}
                    />
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#E2E8F0' }}>
                      Password Reset!
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3 }}>
                      Your password has been updated. Redirecting to sign in…
                    </Typography>
                    <LinearProgress
                      sx={{
                        borderRadius: 2,
                        height: 6,
                        backgroundColor: 'rgba(76,175,80,0.2)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                        },
                      }}
                    />
                  </Box>
                </Fade>
              ) : (
                <>
                  <Zoom in={mounted} style={{ transitionDelay: '300ms' }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                        }}
                      >
                        <LockReset sx={{ fontSize: 40, color: '#fff' }} />
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          color: '#F8FAFC',
                          mb: 1,
                        }}
                      >
                        Reset Password
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                        Enter the code from your email and your new password.
                      </Typography>
                    </Box>
                  </Zoom>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.12)', color: '#FCA5A5' }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    {/* Email */}
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#60A5FA' }} />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={inputSx}
                    />

                    {/* OTP */}
                    <TextField
                      fullWidth
                      label="6-Digit Reset Code"
                      name="otp"
                      value={otp}
                      onChange={(e) => {
                        // Allow digits only, max 6
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setFormData({ ...formData, otp: val });
                      }}
                      required
                      inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
                      autoFocus={!!email}
                      sx={{
                        ...inputSx,
                        '& input': { letterSpacing: '0.4em', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center' },
                      }}
                    />

                    {/* New Password */}
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#60A5FA' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94A3B8' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputSx}
                    />

                    {/* Confirm Password */}
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      error={!!confirmPassword && confirmPassword !== newPassword}
                      helperText={confirmPassword && confirmPassword !== newPassword ? 'Passwords do not match' : ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#60A5FA' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={{ color: '#94A3B8' }}>
                              {showConfirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ ...inputSx, mb: 3 }}
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
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 28px rgba(37,99,235,0.45)',
                        },
                        '&.Mui-disabled': { background: 'rgba(59,130,246,0.4)' },
                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} sx={{ color: '#fff' }} />
                          <Typography variant="button">Resetting...</Typography>
                        </Box>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                      <Link
                        component={RouterLink}
                        to="/forgot-password"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: '#94A3B8',
                          fontWeight: 600,
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          '&:hover': { color: '#60A5FA' },
                          transition: 'color 0.2s',
                        }}
                      >
                        <ArrowBack fontSize="small" />
                        Request a new code
                      </Link>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default ResetPassword;
