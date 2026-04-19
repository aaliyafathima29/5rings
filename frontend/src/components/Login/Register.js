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
  IconButton,
  CircularProgress,
  Grid,
  Dialog,
  Divider,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  CalendarToday,
  School,
} from '@mui/icons-material';
import VerifyOTP from './VerifyOTP';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    dob: '',
    qualification: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, age, dob, qualification } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        age: age ? Number(age) : undefined,
        dob: dob || undefined,
        qualification: qualification || undefined,
        role: 'user',
      });

      if (response.data.success) {
        setRegisteredEmail(email);
        setShowOTPDialog(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setShowOTPDialog(false);
  };

  const inputStyles = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
      '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
      transition: 'all 0.3s ease',
    },
  };


  return (
    <>
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
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, px: { xs: 0, sm: 2 } }}>
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
                borderRadius: '16px 16px 0 0'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 6 } }}>
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
                    Join 5Rings Sport
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                    Begin your journey to excellence
                  </Typography>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box sx={{ maxWidth: 520, mx: 'auto' }}>
                  <Grid
                    container
                    direction="column"
                    rowSpacing={2.5}
                    alignItems="stretch"
                    sx={{ '& .MuiGrid-item': { width: '100%' } }}
                  >
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={name}
                        onChange={handleChange}
                        required
                        autoFocus
                        InputLabelProps={{ sx: { color: '#94A3B8' } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#60A5FA' }} />
                            </InputAdornment>
                          ),
                          sx: { color: '#F8FAFC' }
                        }}
                        sx={inputStyles}
                      />
                    </Grid>

                    <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      InputLabelProps={{ sx: { color: '#94A3B8' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#60A5FA' }} />
                          </InputAdornment>
                        ),
                        sx: { color: '#F8FAFC' }
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                    <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handleChange}
                      required
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
                      sx={inputStyles}
                    />
                  </Grid>

                    <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleChange}
                      required
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: '#94A3B8' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { color: '#F8FAFC' }
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                    <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Age (Optional)"
                      name="age"
                      type="number"
                      value={age}
                      onChange={handleChange}
                      InputLabelProps={{ sx: { color: '#94A3B8' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#60A5FA' }} />
                          </InputAdornment>
                        ),
                        sx: { color: '#F8FAFC' }
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                    <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date of Birth (Optional)"
                      name="dob"
                      type="date"
                      value={dob}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true, sx: { color: '#94A3B8' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: '#60A5FA' }} />
                          </InputAdornment>
                        ),
                        sx: { color: '#F8FAFC', colorScheme: 'dark' }
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                    <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Qualification (Optional)"
                      name="qualification"
                      value={qualification}
                      onChange={handleChange}
                      InputLabelProps={{ sx: { color: '#94A3B8' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <School sx={{ color: '#60A5FA' }} />
                          </InputAdornment>
                        ),
                        sx: { color: '#F8FAFC' }
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                </Grid>
                </Box>

                <Box sx={{ maxWidth: 520, mx: 'auto' }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      mt: 4,
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
                        <Typography variant="button">Creating...</Typography>
                      </Box>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                      OR
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Already a member?{' '}
                      <Link
                        component={RouterLink}
                        to="/login"
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
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
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
          email={registeredEmail} 
          name={name} 
          onVerified={handleOTPVerified} 
        />
      </Dialog>
    </>
  );
};

export default Register;
