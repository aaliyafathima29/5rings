import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

const teamMembers = [
  { name: "Ashok Kumar H", role: "Founder & CEO", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face", description: "Visionary leader with 15+ years in sports management" },
  { name: "Suriyaraaj K", role: "Technical Director", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face", description: "Sports technology expert and former national athlete" },
  { name: "Rishi Kumar", role: "Operations Manager", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face", description: "Ensuring seamless operations and athlete satisfaction" }
];

const Team = () => {
  return (
    <Box sx={{ bgcolor: '#0B1120', py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
          <Typography
            variant="h2"
            className="text-gradient"
            sx={{ fontWeight: 900, mb: 1.2, fontSize: { xs: '2.1rem', md: '3rem' }, lineHeight: 1.1 }}
          >
            The Visionaries
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: '#94A3B8', maxWidth: 680, mx: 'auto', fontWeight: 500, fontSize: { xs: '1rem', md: '1.08rem' } }}
          >
            The passionate leaders driving the future of multi-sports technology and athletic excellence.
          </Typography>
        </Box>

        <Grid container spacing={2.5} sx={{ maxWidth: 1080, mx: 'auto' }}>
          {teamMembers.map((member) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.name}>
              <Box
                className="glass-panel"
                sx={{
                  borderRadius: 5,
                  overflow: 'hidden',
                  textAlign: 'left',
                  height: '100%',
                  minHeight: 450,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-10px)', '& .member-img': { transform: 'scale(1.08)' } }
                }}
              >
                <Box sx={{ overflow: 'hidden', height: 270, position: 'relative' }}>
                  <img src={member.avatar} alt={member.name} className="member-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0B1120 0%, transparent 70%)' }} />
                </Box>
                <Box sx={{ p: 3, pt: 2.2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#F8FAFC', mb: 0.7, fontSize: '1.25rem' }}>
                    {member.name}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      display: 'inline-flex',
                      alignSelf: 'flex-start',
                      fontWeight: 700,
                      color: '#93C5FD',
                      mb: 1.6,
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 10,
                      letterSpacing: 0.6,
                      fontSize: '0.72rem',
                      border: '1px solid rgba(59,130,246,0.35)',
                      bgcolor: 'rgba(59,130,246,0.12)'
                    }}
                  >
                    {member.role}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.75, fontSize: '0.92rem' }}>
                    {member.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Team;
