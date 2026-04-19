import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';

const Sports = () => {
  const sports = [
    { name: 'Football', icon: <SportsSoccerIcon sx={{ fontSize: 64 }} />, color: '#3B82F6', description: 'Professional-grade pitches for competitive matches.', status: 'Open' },
    { name: 'Cricket', icon: <SportsCricketIcon sx={{ fontSize: 64 }} />, color: '#F59E0B', description: 'State-of-the-art nets and turf for all levels.', status: 'Open' },
    { name: 'Tennis', icon: <SportsTennisIcon sx={{ fontSize: 64 }} />, color: '#10B981', description: 'Hard and clay courts maintained to perfection.', status: 'Open' },
    { name: 'Kickboxing', icon: <SportsKabaddiIcon sx={{ fontSize: 64 }} />, color: '#EF4444', description: 'High-intensity training zones for combat sports.', status: 'Open' },
    { name: 'Table Tennis', icon: <SportsBaseballIcon sx={{ fontSize: 64 }} />, color: '#EC4899', description: 'Precision tables in climate-controlled arenas.', status: 'Open' },
    { name: 'Basketball', icon: <SportsBasketballIcon sx={{ fontSize: 64 }} />, color: '#F97316', description: 'Full-court facilities with premium flooring.', status: 'Upcoming' },
    { name: 'Volleyball', icon: <SportsVolleyballIcon sx={{ fontSize: 64 }} />, color: '#06B6D4', description: 'Indoor courts designed for optimal performance.', status: 'Upcoming' },
  ];

  return (
    <Box sx={{ bgcolor: '#0B1120', py: 15, position: 'relative' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h2" className="text-gradient" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3.5rem' } }}>
            Featured Sports
          </Typography>
          <Typography variant="h6" sx={{ color: '#94A3B8', maxWidth: 700, mx: 'auto', fontWeight: 500 }}>
            Discover our range of professional sporting disciplines available for training and competition.
          </Typography>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: 'repeat(1, 1fr)', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          },
          gap: 4
        }}>
          {sports.map((sport) => (
            <Box
              key={sport.name}
              className="glass-panel"
              sx={{
                position: 'relative',
                borderRadius: 6,
                overflow: 'hidden',
                cursor: 'pointer',
                p: 4,
                minHeight: 230,
                height: '100%',
                display: 'flex',
                alignItems: 'stretch',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  borderColor: sport.color,
                  background: 'rgba(255,255,255,0.06)',
                  '& .sport-icon': { transform: 'scale(1.1) rotate(5deg)', opacity: 0.3 }
                }
              }}
            >
              <Box
                className="sport-icon"
                sx={{
                  position: 'absolute', right: -20, bottom: -20, opacity: 0.1,
                  color: sport.color, transition: 'all 0.5s ease',
                  svg: { width: 140, height: 140 }
                }}
              >
                {sport.icon}
              </Box>
              <Box sx={{ p: { xs: 2, md: 4 }, zIndex: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-flex',
                    px: 1.2,
                    py: 0.4,
                    mb: 2,
                    borderRadius: 10,
                    letterSpacing: 0.4,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: sport.status === 'Upcoming' ? '#FDE68A' : '#BBF7D0',
                    backgroundColor: sport.status === 'Upcoming' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    border: sport.status === 'Upcoming' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {sport.status}
                </Typography>
                <Box sx={{
                  width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: `${sport.color}22`, color: sport.color, mb: 3
                }}>
                  {React.cloneElement(sport.icon, { sx: { fontSize: { xs: 20, md: 24 } } })}
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#F8FAFC', fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  {sport.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1.5, lineHeight: 1.6 }}>
                  {sport.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Sports;
