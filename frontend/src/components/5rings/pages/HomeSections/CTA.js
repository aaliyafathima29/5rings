import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import VisibilityIcon from '@mui/icons-material/Visibility';

const CTA = () => {
  return (
    <Box sx={{ bgcolor: 'transparent', py: { xs: 8, md: 10 }, position: 'relative' }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        
        {/* Vision & Mission Row */}
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 12 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="glass-panel" sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, height: '100%', borderTop: '4px solid #3B82F6', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: '#60A5FA', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' } }}>
              <VisibilityIcon sx={{ fontSize: 40, color: '#3B82F6', mb: 3 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>Our Vision</Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '1.1rem' }}>
                To become India's most trusted multi-sports organization, creating a holistic ecosystem that nurtures athletic talent, promotes wellness, and leverages technology to revolutionize the sports and fitness industry.
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="glass-panel" sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, height: '100%', borderTop: '4px solid #F59E0B', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: '#fbbf24', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.1)' } }}>
              <TrackChangesIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 3 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>Our Mission</Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '1.1rem' }}>
                To provide world-class sports facilities and technology-driven solutions that make quality athletic training accessible to everyone, fostering a dedicated community of champions and promoting a profoundly healthy lifestyle.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Call To Action Banner */}
        <Box className="glass-panel" sx={{ 
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          p: { xs: 5, md: 8 },
          textAlign: 'center',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 58, 138, 0.1) 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Decorative background elements */}
          <Box sx={{ position: 'absolute', top: -150, right: -50, width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -150, left: -50, width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, letterSpacing: -1, fontSize: { xs: '2.5rem', md: '3.5rem' }, color: '#FFFFFF' }}>
              Build Your <span style={{ color: '#60A5FA' }}>Athletic Legacy</span>
            </Typography>
            <Typography variant="h6" sx={{ color: '#94A3B8', maxWidth: 700, mx: 'auto', mb: 5, fontWeight: 400, lineHeight: 1.6 }}>
              Join thousands of elite athletes who are already training, competing, and growing at our world-class facilities.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/sports" 
              variant="contained" 
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                px: { xs: 4, md: 6 }, 
                py: { xs: 1.5, md: 2 }, 
                fontSize: '1.1rem', 
                borderRadius: 50, 
                bgcolor: '#3B82F6', 
                color: '#ffffff',
                fontWeight: 700, 
                textTransform: 'none',
                transition: 'all 0.3s ease', 
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                '&:hover': { 
                  bgcolor: '#2563EB', 
                  transform: 'translateY(-3px)', 
                  boxShadow: '0 20px 35px -5px rgba(59, 130, 246, 0.6)' 
                } 
              }}
            >
              Get Started Today
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CTA;
