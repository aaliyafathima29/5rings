import React from 'react';
import { Box, Container, Typography, Stack, alpha } from '@mui/material';

const milestones = [
  { year: '2018', title: 'Sports Industry Entry', description: 'Started our journey with a vision to transform athletic training.' },
  { year: '2021', title: 'Philosophy Established', description: 'Formulated our core philosophy centered on inclusive sports access.' },
  { year: '2024', title: 'Multi Sports Facility', description: 'Inaugurated our state-of-the-art multi-sports facility.' },
  { year: '2025', title: 'Sports Tech Initiative', description: 'Launched cutting-edge technology solutions for management.' },
];

const Journey = () => {
  return (
    <Box sx={{ bgcolor: '#0B1120', py: 15, position: 'relative' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h2" className="text-gradient" sx={{ fontWeight: 900, mb: 2 }}>
            Our Journey
          </Typography>
          <Typography variant="h6" sx={{ color: '#94A3B8', maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
            The milestones that defined our growth from a local academy to a premier multi-sports organization.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Box sx={{
            display: { xs: 'none', md: 'block' }, position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: 2, bgcolor: 'rgba(255,255,255,0.1)', transform: 'translateX(-50%)'
          }} />

          <Stack spacing={8}>
            {milestones.map((step, i) => (
              <Box key={step.year} sx={{
                position: 'relative', display: 'flex', gap: 4, alignItems: 'center',
                flexDirection: { xs: 'column', md: i % 2 === 0 ? 'row' : 'row-reverse' }
              }}>
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Box className="glass-panel" sx={{ p: 4, borderRadius: 4, ml: { md: i % 2 === 0 ? 0 : 4 }, mr: { md: i % 2 === 0 ? 4 : 0 }, textAlign: i % 2 === 0 ? 'right' : 'left', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: '#3B82F6' } }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#3B82F6', mb: 1 }}>{step.year}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>{step.title}</Typography>
                    <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.8 }}>{step.description}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#F59E0B', border: '4px solid #0B1120', boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2)' }} />
                </Box>
                <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Journey;
