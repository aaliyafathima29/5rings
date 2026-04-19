import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  LinearProgress,
} from '@mui/material';
import {
  VerifiedUser,
  Email,
  Timer,
  CheckCircle,
} from '@mui/icons-material';
import Logo from './Logo';

const VerifyOTP = ({ email, name, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyOTP({ email, otp });

      if (response.data.success) {
        login(response.data.user);
        setSuccess(true);
        
        if (onVerified) {
          onVerified();
        }
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const response = await authAPI.resendOTP({ email });

      if (response.data.success) {
        setTimeLeft(600); // Reset timer
        setOtp('');
        setError('');
        alert('New OTP sent to your email!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10, px: 0 }}>
        <Card 
          elevation={0} 
          className="glass-panel"
          sx={{ 
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            ...(success ? { border: '2px solid rgba(76, 175, 80, 0.4)' } : {}),
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: success 
                ? 'linear-gradient(90deg, #4CAF50, #81C784)' 
                : 'linear-gradient(90deg, #1E40AF, #3B82F6, #60A5FA)',
              borderRadius: '16px 16px 0 0'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
            {success ? (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircle
                  sx={{
                    fontSize: 100,
                    color: 'success.main',
                    mb: 3,
                    animation: 'scaleIn 0.5s ease-out',
                    '@keyframes scaleIn': {
                      '0%': { transform: 'scale(0)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  }}
                />
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
                  Verification Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Redirecting you to dashboard...
                </Typography>
                <LinearProgress 
                  sx={{ 
                    borderRadius: 2,
                    height: 6,
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                    },
                  }} 
                />
              </Box>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Logo size="medium" />
                  
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <VerifiedUser
                      sx={{
                        fontSize: 70,
                        color: 'primary.main',
                        mb: 2,
                      }}
                    />
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        mb: 1.5,
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                      }}
                    >
                      Verify Your Account
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                      We've sent a 6-digit code to
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 1,
                        background: 'rgba(255, 215, 0, 0.1)',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                      }}
                    >
                      <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
                required
                autoFocus
                placeholder="000000"
                InputLabelProps={{ sx: { color: '#94A3B8' } }}
                inputProps={{
                  maxLength: 6,
                  style: { 
                    textAlign: 'center', 
                    fontSize: '28px', 
                    letterSpacing: '12px',
                    fontWeight: 800,
                    color: '#F8FAFC',
                  }
                }}
                sx={{ 
                  mb: 4,
                  '& input': {
                    fontFamily: 'monospace',
                  },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                    transition: 'all 0.3s ease',
                  },
                }}
              />

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1.5,
                mb: 3,
                p: 2.5,
                borderRadius: 3,
                background: timeLeft <= 60 
                  ? 'rgba(255, 82, 82, 0.1)' 
                  : 'rgba(76, 175, 80, 0.1)',
                border: `2px solid ${timeLeft <= 60 ? 'rgba(255, 82, 82, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
              }}>
                <Timer 
                  sx={{ 
                    color: timeLeft <= 60 ? 'error.main' : 'success.main',
                    fontSize: 28,
                  }} 
                />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: timeLeft <= 60 ? 'error.main' : 'success.main',
                  }}
                >
                  {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Code Expired'}
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || timeLeft <= 0}
                sx={{ 
                  mb: 2, 
                  py: 1.8,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
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
                {loading ? <CircularProgress size={26} sx={{ color: '#fff' }} /> : 'Verify OTP'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Didn't receive the code?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resending}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: 'primary.light',
                      },
                    }}
                  >
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </Link>
                </Typography>
              </Box>
            </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default VerifyOTP;
