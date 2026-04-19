import React from 'react';
import { Box, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import TerrainIcon from '@mui/icons-material/Terrain';
import UpcomingIcon from '@mui/icons-material/Upcoming';

const serviceGroups = [
  {
    id: 'indoor',
    title: 'Indoor Services',
    subtitle: 'Climate-controlled arenas for all-weather training.',
    icon: <SportsSoccerIcon sx={{ fontSize: 26 }} />,
    accent: '#3B82F6',
    items: ['Football', 'Box Cricket', 'Kickboxing', 'Mini Gym', 'Table Tennis', 'Tennis'],
  },
  {
    id: 'outdoor',
    title: 'Outdoor Services',
    subtitle: 'Open-field and tactical practice environments.',
    icon: <TerrainIcon sx={{ fontSize: 26 }} />,
    accent: '#10B981',
    items: ['Cricket', 'Silambam', 'Archery'],
  },
  {
    id: 'upcoming',
    title: 'Upcoming Facilities',
    subtitle: 'New programs under development and launch prep.',
    icon: <UpcomingIcon sx={{ fontSize: 26 }} />,
    accent: '#F59E0B',
    badge: 'Launching Soon',
    items: ['Kalari', 'Adimurai', 'Cricket Nets', 'Volleyball', 'Kabaddi', 'Karate'],
  },
];

const Services = () => {
  return (
    <Box sx={{ bgcolor: '#0B1120', py: { xs: 7, md: 8.5 }, position: 'relative' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
          <Typography
            variant="h2"
            sx={{
              mb: 1.2,
              fontWeight: 900,
              color: '#F8FAFC',
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.1,
            }}
          >
            Our <Box component="span" sx={{ color: '#3B82F6' }}>Services</Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#94A3B8',
              maxWidth: 720,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.08rem' },
            }}
          >
            Comprehensive sports facilities tailored to maximize athletic potential.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {serviceGroups.map((group) => (
            <Grid key={group.id} size={{ xs: 12, md: 4 }}>
              <Box
                className="glass-panel"
                sx={{
                  borderRadius: 6,
                  p: { xs: 3.5, md: 4.5 },
                  minHeight: 320,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${group.accent}20`,
                  background: `linear-gradient(160deg, ${group.accent}05 0%, rgba(15, 23, 42, 0.4) 100%)`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: `${group.accent}60`,
                    boxShadow: `0 20px 40px -10px ${group.accent}25`,
                    background: `linear-gradient(160deg, ${group.accent}15 0%, rgba(15, 23, 42, 0.6) 100%)`,
                  }
                }}
              >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${group.accent}15`,
                        color: group.accent,
                        boxShadow: `inset 0 0 0 1px ${group.accent}40`,
                        mb: 2
                      }}
                    >
                      {React.cloneElement(group.icon, { sx: { fontSize: 32 } })}
                    </Box>
                  {group.badge && (
                    <Chip
                      label={group.badge}
                      size="small"
                      sx={{
                        height: 26,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        color: group.accent,
                        bgcolor: `${group.accent}15`,
                        border: `1px solid ${group.accent}40`,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="h5" sx={{ color: '#F8FAFC', fontWeight: 800, mb: 1.5, letterSpacing: -0.5 }}>
                  {group.title}
                </Typography>

                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.6, fontSize: '1.05rem', flexGrow: 1 }}>
                  {group.subtitle}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.2,
                    mt: 'auto',
                  }}
                >
                  {group.items.map((item) => (
                    <Box
                      key={item}
                      sx={{
                        px: 2,
                        py: 0.8,
                        borderRadius: 2,
                        border: `1px solid ${group.accent}25`,
                        bgcolor: `${group.accent}08`,
                        color: '#E2E8F0',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: `${group.accent}20`,
                          borderColor: `${group.accent}50`,
                          color: '#FFFFFF'
                        }
                      }}
                    >
                      {item}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Services;
