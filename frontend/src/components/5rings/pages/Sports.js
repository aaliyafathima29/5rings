import React from 'react';
import { Box, Container, Typography, Grid, Card, Button, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Layout from '../components/Layout.js';
import MessageIcon from '@mui/icons-material/Message';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import footballImg from '../../../assets/sports/football.jpg';
import cricketImg from '../../../assets/sports/Cricket.jpg';
import tennisImg from '../../../assets/sports/tennis.jpg';
import kickboxingImg from '../../../assets/sports/kickboxing.jpg';
import tableTennisImg from '../../../assets/sports/tableTennis.jpg';
import silambamImg from '../../../assets/sports/silambam.jpg';
import archeryImg from '../../../assets/sports/Archery.jpg';
import basketballImg from '../../../assets/sports/basketball.jpg';
import volleyballImg from '../../../assets/sports/volleyball.jpg';

const Sports = () => {
  const WHATSAPP_NUMBER = '919876543210';

  const sports = [
    { 
      name: 'Football', 
      icon: <SportsSoccerIcon />, 
      description: 'Experience indoor football with professional turf and lighting. Perfect for 5-a-side matches and training sessions.',
      type: 'Indoor',
      color: '#2E7D32',
      status: 'Open',
      image: footballImg
    },
    { 
      name: 'Cricket', 
      icon: <SportsBaseballIcon />, 
      description: 'World-class cricket facilities including nets, practice pitches, and box cricket for all skill levels.',
      type: 'Outdoor',
      color: '#01579B',
      status: 'Open',
      image: cricketImg
    },
    { 
      name: 'Tennis', 
      icon: <SportsTennisIcon />, 
      description: 'Professional tennis courts with quality surfaces and equipment for singles and doubles play.',
      type: 'Indoor',
      color: '#F57C00',
      status: 'Open',
      image: tennisImg
    },
    { 
      name: 'Kick Boxing', 
      icon: <SportsMartialArtsIcon />, 
      description: 'Train with certified instructors in our fully-equipped kickboxing studio with premium gear.',
      type: 'Indoor',
      color: '#C62828',
      status: 'Open',
      image: kickboxingImg
    },
    { 
      name: 'Table Tennis', 
      icon: <SportsEsportsIcon />, 
      description: 'Competition-grade tables and equipment for recreational and professional table tennis players.',
      type: 'Indoor',
      color: '#6A1B9A',
      status: 'Open',
      image: tableTennisImg
    },
    { 
      name: 'Silambam', 
      icon: <SportsMartialArtsIcon />, 
      description: 'Learn the ancient Tamil martial art of Silambam from experienced masters.',
      type: 'Outdoor',
      color: '#D84315',
      status: 'Upcoming',
      image: silambamImg
    },
    { 
      name: 'Archery', 
      icon: <GolfCourseIcon />, 
      description: 'Precision archery training with professional equipment and expert guidance.',
      type: 'Outdoor',
      color: '#5D4037',
      status: 'Upcoming',
      image: archeryImg
    },
    {
      name: 'Basketball',
      icon: <SportsBasketballIcon />,
      description: 'Indoor full-court basketball arena with pro-standard boards and flooring.',
      type: 'Indoor',
      color: '#EF6C00',
      status: 'Upcoming',
      image: basketballImg
    },
    {
      name: 'Volleyball',
      icon: <SportsVolleyballIcon />,
      description: 'Dedicated volleyball courts designed for training camps and league games.',
      type: 'Indoor',
      color: '#00838F',
      status: 'Upcoming',
      image: volleyballImg
    }
  ];

  const availableSports = sports.filter((sport) => sport.status === 'Open');
  const upcomingSports = sports.filter((sport) => sport.status === 'Upcoming');

  const getWhatsAppUrl = (sportName) => {
    const message = `Hello 5RINGS, I would like to enquire about ${sportName} facilities.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Layout>
      <Box sx={{ pt: { xs: 10, md: 12 }, bgcolor: 'transparent', minHeight: '100vh' }}>
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', mb: 8 }}>
            <Typography variant="h1" className="text-gradient" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '5rem' }, mb: 2 }}>
              Elite Arenas
            </Typography>
            <Typography variant="h5" sx={{ color: '#94A3B8', fontSize: '1.25rem', fontWeight: 500, letterSpacing: 0.5 }}>
              Push your limits in our world-class, professionally curated sports facilities.
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ color: '#F8FAFC', fontWeight: 800, mb: 3 }}>
            Available Sports
          </Typography>

          <Grid container spacing={3} sx={{ mb: 8 }}>
            {availableSports.map((sport) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sport.name}>
                <Card
                  className="glass-panel"
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    minHeight: 360,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      '& .sport-icon-box': {
                        transform: 'scale(1.2) rotate(5deg)',
                        bgcolor: alpha(sport.color, 0.2)
                      },
                      '& .overlay-bg': { opacity: 0.1 }
                    }
                  }}
                >
                  {/* Icon Header */}
                  <Box
                    sx={{
                      height: 130,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      backgroundImage: sport.image
                        ? `linear-gradient(135deg, ${alpha(sport.color, 0.25)} 0%, rgba(15,23,42,0.38) 100%), url(${sport.image})`
                        : `linear-gradient(135deg, ${alpha(sport.color, 0.1)} 0%, rgba(15,23,42,0.5) 100%)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      color: sport.color,
                      overflow: 'hidden'
                    }}
                  >
                    <Box className="overlay-bg" sx={{ position: 'absolute', inset: 0, bgcolor: sport.color, opacity: 0.03, transition: 'opacity 0.3s' }} />
                    <Box
                      className="sport-icon-box"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(sport.color, 0.1),
                        border: `1px solid ${alpha(sport.color, 0.3)}`,
                        transition: 'all 0.4s ease',
                        boxShadow: `0 8px 24px ${alpha(sport.color, 0.2)}`,
                        '& svg': { fontSize: 48 }
                      }}
                    >
                      {sport.icon}
                    </Box>
                    <Chip
                      label={sport.type}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        height: 22,
                        letterSpacing: 1,
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#F8FAFC' }}>
                      {sport.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, lineHeight: 1.6 }}>
                      {sport.description}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<MessageIcon sx={{ fontSize: 18 }} />}
                      href={getWhatsAppUrl(sport.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: '#25D366',
                        color: 'white',
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        py: 1.2,
                        borderRadius: 2,
                        boxShadow: 'none',
                        mt: 'auto',
                        '&:hover': {
                          bgcolor: '#1FAF56',
                          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Enquire Now
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h4" sx={{ color: '#F8FAFC', fontWeight: 800, mb: 1 }}>
            Upcoming Events
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3 }}>
            These sports facilities are launching soon.
          </Typography>

          <Grid container spacing={3}>
            {upcomingSports.map((sport) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sport.name}>
                <Card
                  className="glass-panel"
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    minHeight: 360,
                    opacity: 0.92,
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      '& .sport-icon-box': {
                        transform: 'scale(1.2) rotate(5deg)',
                        bgcolor: alpha(sport.color, 0.2)
                      },
                      '& .overlay-bg': { opacity: 0.1 }
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 130,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      backgroundImage: sport.image
                        ? `linear-gradient(135deg, ${alpha(sport.color, 0.25)} 0%, rgba(15,23,42,0.38) 100%), url(${sport.image})`
                        : `linear-gradient(135deg, ${alpha(sport.color, 0.1)} 0%, rgba(15,23,42,0.5) 100%)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      color: sport.color,
                      overflow: 'hidden'
                    }}
                  >
                    <Box className="overlay-bg" sx={{ position: 'absolute', inset: 0, bgcolor: sport.color, opacity: 0.03, transition: 'opacity 0.3s' }} />
                    <Box
                      className="sport-icon-box"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(sport.color, 0.1),
                        border: `1px solid ${alpha(sport.color, 0.3)}`,
                        transition: 'all 0.4s ease',
                        boxShadow: `0 8px 24px ${alpha(sport.color, 0.2)}`,
                        '& svg': { fontSize: 48 }
                      }}
                    >
                      {sport.icon}
                    </Box>
                    <Chip
                      label={sport.type}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        height: 22,
                        letterSpacing: 1,
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                    <Chip
                      label="Upcoming"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'rgba(245, 158, 11, 0.2)',
                        color: '#FDE68A',
                        border: '1px solid rgba(245, 158, 11, 0.45)',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        height: 22,
                        letterSpacing: 0.6
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#F8FAFC' }}>
                      {sport.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, lineHeight: 1.6 }}>
                      {sport.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        color: '#FDE68A',
                        borderColor: 'rgba(245, 158, 11, 0.45)',
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        py: 1.2,
                        borderRadius: 2,
                        mt: 'auto',
                        '&:hover': {
                          borderColor: '#F59E0B',
                          backgroundColor: 'rgba(245, 158, 11, 0.12)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Launching Soon
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default Sports;
