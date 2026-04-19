import React from 'react';
import { Box, Container, Typography, Grid, Avatar } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';

const testimonials = [
  { name: "Rajesh Kumar", role: "Football Coach", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", text: "The facilities at 5RINGS are world-class. My students have improved tremendously with the professional equipment." },
  { name: "Priya Sharma", role: "Tennis Player", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face", text: "As a professional player, I've trained at many facilities. 5RINGS stands out for its dedication to excellence and athlete approach." },
  { name: "Vikram Singh", role: "Cricket Academy", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", text: "The cricket facilities here are exceptional. The infrastructure and coaching quality have helped produce outstanding talents." }
];

const Testimonials = () => {
  return (
    <Box sx={{ bgcolor: '#0B1120', py: { xs: 12, md: 16 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800, color: '#f8fafc', mb: 1 }}>
            What Our <span style={{ color: '#10B981' }}>Athletes Say</span>
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', maxWidth: 500, mx: 'auto' }}>
            Hear from the champions who train at 5RINGS Sports.
          </Typography>
        </Box>

        <Grid container sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, maxWidth: 1100, mx: 'auto' }}>
          {testimonials.map((t) => (
            <Grid item xs={12} md={4} key={t.name}>
              <Box className="glass-panel" sx={{ p: 5, borderRadius: 4, height: '100%', position: 'relative', borderLeft: '4px solid #f59e0b' }}>
                <Box sx={{ position: 'absolute', top: -20, left: 32, width: 44, height: 44, borderRadius: '50%', bgcolor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4)' }}>
                  <FormatQuoteIcon sx={{ color: '#fff' }} />
                </Box>
                <Box sx={{ display: 'flex', mb: 3, pt: 1 }}>
                  {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} sx={{ color: '#F59E0B', fontSize: 20 }} />)}
                </Box>
                <Typography variant="body1" sx={{ color: '#E2E8F0', fontSize: '1.05rem', fontStyle: 'italic', mb: 4, lineHeight: 1.8 }}>
                  "{t.text}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3 }}>
                  <Avatar src={t.avatar} sx={{ width: 56, height: 56, mr: 2, border: '2px solid rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#F8FAFC">{t.name}</Typography>
                    <Typography variant="body2" color="#94A3B8">{t.role}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
