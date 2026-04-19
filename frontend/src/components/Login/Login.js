import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
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
  Dialog,
  Divider,
  Fade,
  Zoom,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  SportsSoccer,
  EmojiEvents,
  SecurityUpdate,
} from '@mui/icons-material';
import Logo from './Logo';
import VerifyOTP from './VerifyOTP';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { email, password } = formData;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleFirebaseLogin = async (user) => {
    const idToken = await user.getIdToken();
    const response = await authAPI.firebaseLogin({ idToken });
    if (response.data.success) {
      login(response.data.user);
      navigate('/dashboard');
    }
  };

  React.useEffect(() => {
    const handleRedirectLogin = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setLoading(true);
          await handleFirebaseLogin(result.user);
        }
      } catch (err) {
        setError(err.message || 'Google login failed.');
      } finally {
        setLoading(false);
      }
    };

    handleRedirectLogin();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      if (response.data.success) {
        login(response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setUnverifiedEmail(email);
        setShowOTPDialog(true);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setShowOTPDialog(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      await handleFirebaseLogin(result.user);
    } catch (err) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // removing light gradient. Replaced with dark gradient matching the theme
          background: 'transparent', // Falls back to body background #0B1120 from index.css
          position: 'relative',
          overflow: 'hidden',
          p: 2, // padding for mobile
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(30, 64, 175, 0.15) 0%, transparent 70%)',
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
                overflow: 'visible',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                backdropFilter: 'blur(16px)',
                width: '100%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #1E40AF, #3B82F6, #60A5FA)',
                  borderRadius: '16px 16px 0 0'
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 6 } }}>
                <Zoom in={mounted} style={{ transitionDelay: '300ms' }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Box
                        component="img"
                        src="/5rings.jpg"
                        alt="5Rings Logo"
                        sx={{
                          width: 90,
                          height: 90,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                          border: '2px solid rgba(59, 130, 246, 0.3)',
                        }}
                      />
                    </Box>

                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Typography 
                        variant="h3" 
                        className="text-gradient"
                        sx={{ 
                          mb: 1,
                          fontWeight: 800,
                          fontSize: { xs: '1.75rem', sm: '2.25rem' },
                        }}
                      >
                        Welcome Back
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                        Sign in to your 5RINGS account
                      </Typography>
                    </Box>

                    {/* Feature highlights */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, sm: 3 }, mt: 3, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SportsSoccer sx={{ fontSize: 20, color: '#3B82F6' }} />
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>Sports</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents sx={{ fontSize: 20, color: '#3B82F6' }} />
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>Events</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityUpdate sx={{ fontSize: 20, color: '#3B82F6' }} />
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>Secure</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Zoom>

                {location.state?.resetSuccess && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    Password reset successfully! You can now sign in with your new password.
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Fade in={mounted} style={{ transitionDelay: '600ms' }}>
                    <Box>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        autoFocus
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
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                            '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                            transition: 'all 0.3s ease',
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        margin="normal"
                        InputLabelProps={{ sx: { color: '#94A3B8' } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#60A5FA' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: '#94A3B8' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: { color: '#F8FAFC' }
                        }}
                        sx={{ 
                          mb: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                            '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                            transition: 'all 0.3s ease',
                          }
                        }}
                      />

                      {/* Forgot Password link */}
                      <Box sx={{ textAlign: 'right', mb: 3 }}>
                        <Link
                          component={RouterLink}
                          to="/forgot-password"
                          sx={{
                            color: '#60A5FA',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline', color: '#93C5FD' },
                          }}
                        >
                          Forgot password?
                        </Link>
                      </Box>

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
                            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)'
                          },
                          '&.Mui-disabled': {
                            background: 'rgba(59, 130, 246, 0.3)',
                            color: 'rgba(255, 255, 255, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                            <Typography variant="button">Signing in...</Typography>
                          </Box>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </Box>
                  </Fade>

                  <Fade in={mounted} style={{ transitionDelay: '800ms' }}>
                    <Box>
                      <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                          OR CONTINUE WITH
                        </Typography>
                      </Divider>

                      {/* Social Login Buttons */}
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Google />}
                          onClick={handleGoogleLogin}
                          sx={{
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#F8FAFC',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Google
                        </Button>
                      </Box>

                      <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          New to 5RINGS?{' '}
                          <Link
                            component={RouterLink}
                            to="/register"
                            sx={{
                              color: '#60A5FA',
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              '&:hover': {
                                textDecoration: 'underline',
                                color: '#93C5FD',
                              },
                            }}
                          >
                            Create Account
                          </Link>
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>

      <Dialog 
        open={showOTPDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { background: 'transparent', boxShadow: 'none' }
        }}
      >
        <VerifyOTP 
          email={unverifiedEmail} 
          name={formData.name || 'User'} 
          onVerified={handleOTPVerified} 
        />
      </Dialog>
    </>
  );
};

export default Login;
