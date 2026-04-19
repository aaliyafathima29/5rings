import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import Layout from '../components/Layout.js';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 10 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '6rem', md: '10rem' }, fontWeight: 900, background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, mb: 2 }}>
            404
          </Typography>
          <Typography variant="h3" fontWeight={900} sx={{ mb: 2 }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 500 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained" size="large" startIcon={<HomeIcon />} sx={{ bgcolor: '#FFC107', color: 'white', px: 4, py: 1.5, textTransform: 'none', fontSize: '1.1rem', '&:hover': { bgcolor: '#FFB300' } }}>
            Back to Home
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

export default NotFound;
