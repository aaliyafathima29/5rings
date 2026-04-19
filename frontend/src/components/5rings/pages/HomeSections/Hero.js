import React from 'react';
import { Box, Container, Typography, Button, Stack, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Hero = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#0B1120',
        pt: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url(/5rings.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(11, 17, 32, 0.2) 0%, #0B1120 100%)',
          zIndex: 1,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <Box className="glass-panel" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, mb: 4, borderRadius: 8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3B82F6', animation: 'pulseGlow 2s infinite' }} />
            <Typography variant="body2" fontWeight={700} letterSpacing={1.5} color="#60A5FA" sx={{ fontSize: '0.85rem' }}>
              MULTI SPORTS & SPORTS TECHNOLOGY
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.5rem', sm: '5rem', md: '6.5rem' },
              fontWeight: 900,
              lineHeight: 1,
              mb: 3,
              color: '#F8FAFC',
              letterSpacing: -2,
              animation: 'fadeIn 1s ease-out'
            }}
          >
            Welcome to{' '}
            <span className="text-gradient">5RINGS</span>
          </Typography>

          <Typography
            variant="h5"
            sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' }, fontWeight: 400, color: '#E2E8F0', mb: 3 }}
          >
            Everyone is our customer
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 400,
              color: '#94A3B8',
              maxWidth: 700,
              lineHeight: 1.8,
              mb: 6
            }}
          >
            A comprehensive multi-sports ecosystem combining world-class facilities with cutting-edge sports technology to nurture athletic excellence and community wellness.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 10 }}>
            <Button
              component={RouterLink}
              to="/sports"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 5, py: 2, fontSize: '1.1rem', borderRadius: 4 }}
            >
              Explore Sports
            </Button>

            <Button
              href="https://wa.me/919876543210?text=Hello%205RINGS..."
              target="_blank"
              variant="outlined"
              size="large"
              startIcon={<WhatsAppIcon />}
              sx={{
                px: 5, py: 2, fontSize: '1.1rem', borderRadius: 4,
                color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.5)',
                '&:hover': { borderColor: '#25D366', bgcolor: alpha('#25D366', 0.1) }
              }}
            >
              Chat on WhatsApp
            </Button>
          </Stack>

        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
