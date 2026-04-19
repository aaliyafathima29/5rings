import React from 'react';
import { Box, Container, Typography, Grid, Stack, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupsIcon from '@mui/icons-material/Groups';
import ShieldIcon from '@mui/icons-material/Shield';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WifiIcon from '@mui/icons-material/Wifi';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const facilities = [
  { icon: <FitnessCenterIcon sx={{ fontSize: 32 }} />, title: 'World-Class Equipment', description: 'Professional-grade sports equipment and premium training facilities.' },
  { icon: <GroupsIcon sx={{ fontSize: 32 }} />, title: 'Expert Coaching', description: 'Certified coaches and trainers providing personalized athletic guidance.' },
  { icon: <ShieldIcon sx={{ fontSize: 32 }} />, title: 'Safety First', description: 'Comprehensive safety measures, secure infrastructure, and first-aid.' },
  { icon: <ScheduleIcon sx={{ fontSize: 32 }} />, title: 'Flexible Hours', description: 'Extended operating schedules to seamlessly fit your busy lifestyle.' },
  { icon: <WifiIcon sx={{ fontSize: 32 }} />, title: 'Smart Facilities', description: 'Tech-enabled booking, modern analytics, and training tracking systems.' },
  { icon: <LocalParkingIcon sx={{ fontSize: 32 }} />, title: 'Ample Parking', description: 'Safe, convenient, and spacious parking infrastructure for all visitors.' }
];

const Facilities = () => {
  return (
    <Box sx={{ bgcolor: '#0B1120', py: { xs: 8, md: 10 }, position: 'relative', overflow: 'hidden' }}>
      {/* Background Ambience */}
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography variant="h2" className="text-gradient" sx={{ fontWeight: 900, mb: 2 }}>
            Elite Facilities
          </Typography>
          <Typography variant="h6" sx={{ color: '#94A3B8', maxWidth: 700, mx: 'auto', fontWeight: 500 }}>
            World-class infrastructure designed for professional training and peak performance.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {facilities.map((fac) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fac.title}>
              <Box className="glass-panel" sx={{ p: 4, minHeight: 240, height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', transition: 'all 0.4s ease', '&:hover': { transform: 'translateY(-8px)', borderColor: 'rgba(59, 130, 246, 0.5)', '& .icon-box': { bgcolor: '#3B82F6', color: '#fff', transform: 'scale(1.1) rotate(5deg)' } } }}>
                <Box className="icon-box" sx={{ width: 64, height: 64, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', mb: 3, transition: 'all 0.4s ease' }}>
                  {fac.icon}
                </Box>
                <Typography variant="h5" fontWeight={800} color="#F8FAFC" sx={{ mb: 1.5 }}>{fac.title}</Typography>
                <Typography variant="body1" color="#94A3B8" lineHeight={1.8}>{fac.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: { xs: 5, md: 7 }, justifyContent: 'center' }}>
          <Button
            component={RouterLink}
            to="/sports"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              px: 5, py: 2, fontSize: '1.1rem', borderRadius: 4, 
              bgcolor: '#3B82F6', fontWeight: 800,
              transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#2563EB', transform: 'translateY(-3px)', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }
            }}
          >
            Explore Sports
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default Facilities;
