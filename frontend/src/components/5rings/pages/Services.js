import React from 'react';
import { Box, Container, Typography, Grid, Card, Button, Chip, List, ListItem, ListItemText, Stack, Divider, GlobalStyles } from '@mui/material';
import Layout from '../components/Layout.js';
import MessageIcon from '@mui/icons-material/Message';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Services = () => {
  const WHATSAPP_NUMBER = '919876543210';

  const features = [
    { icon: <AccessTimeIcon sx={{ fontSize: 28 }} />, title: 'Flexible Timing', description: 'Book slots that fit your schedule' },
    { icon: <PeopleIcon sx={{ fontSize: 28 }} />, title: 'Expert Coaching', description: 'Learn from certified professionals' },
    { icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />, title: 'Quality Facilities', description: 'World-class equipment & venues' }
  ];

  const ongoingServices = [
    { name: 'Football', type: 'Indoor', features: ['5-a-side matches', 'Professional turf', 'Night play'] },
    { name: 'Box Cricket', type: 'Indoor', features: ['Net practice', 'Match play', 'All ages'] },
    { name: 'Kickboxing', type: 'Indoor', features: ['Certified trainers', 'All levels', 'Personal training'] },
    { name: 'Mini Gym', type: 'Indoor', features: ['Modern equipment', 'Personal training', 'Cardio zone'] },
    { name: 'Table Tennis', type: 'Indoor', features: ['Competition tables', 'Coaching available', 'Tournaments'] },
    { name: 'Tennis', type: 'Indoor', features: ['Professional court', 'Equipment rental', 'Coaching'] },
    { name: 'Cricket', type: 'Outdoor', features: ['Practice nets', 'Match ground', 'Coaching'] },
    { name: 'Silambam', type: 'Outdoor', features: ['Traditional training', 'Expert masters', 'All levels'] },
    { name: 'Archery', type: 'Outdoor', features: ['Professional range', 'Equipment provided', 'Beginners welcome'] }
  ];

  const upcomingServices = [
    { name: 'Kalari', type: 'Indoor' },
    { name: 'Adimurai', type: 'Indoor' },
    { name: 'Cricket Nets', type: 'Outdoor' },
    { name: 'Volleyball', type: 'Outdoor' },
    { name: 'Kabaddi', type: 'Outdoor' },
    { name: 'Karate', type: 'Outdoor' }
  ];

  const getWhatsAppUrl = (serviceName) => {
    const message = `Hello 5RINGS, I would like to enquire about ${serviceName} services.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Layout>
      <>
        <GlobalStyles
          styles={{
            '@import': [
              "url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap')",
            ],
          }}
        />
        <Box
          sx={{
            pt: { xs: 10, md: 12 },
            minHeight: '100vh',
            bgcolor: '#0B1120',
            background:
              'radial-gradient(1200px 600px at 15% -10%, rgba(59,130,246,0.28), transparent 60%), radial-gradient(900px 500px at 90% 0%, rgba(16,185,129,0.22), transparent 55%), #0B1120',
            fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
          }}
        >
          <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
            {/* Hero */}
            <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 3,
                  color: 'rgba(148,163,184,0.9)',
                  fontWeight: 700,
                  display: 'block',
                  mb: 1,
                  textTransform: 'uppercase',
                }}
              >
                Facilities and Coaching
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: '2.8rem', md: '4.5rem' },
                  lineHeight: 1.05,
                  mb: 2,
                  color: '#F8FAFC',
                  letterSpacing: -1,
                }}
              >
                Professional services built for performance
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#94A3B8',
                  fontSize: { xs: '1.05rem', md: '1.25rem' },
                  fontWeight: 500,
                  maxWidth: 720,
                  mx: 'auto',
                }}
              >
                Structured training environments, premium facilities, and dedicated coaching for every level of athlete.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<MessageIcon />}
                  href={getWhatsAppUrl('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: '#2563EB',
                    textTransform: 'none',
                    px: 3,
                    py: 1.4,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
                    '&:hover': { bgcolor: '#1D4ED8' },
                  }}
                >
                  Talk to our team
                </Button>
                <Button
                  variant="outlined"
                  href="#ongoing-services"
                  sx={{
                    color: '#E2E8F0',
                    borderColor: 'rgba(148,163,184,0.35)',
                    textTransform: 'none',
                    px: 3,
                    py: 1.4,
                    borderRadius: 2.5,
                    fontWeight: 600,
                    '&:hover': { borderColor: 'rgba(148,163,184,0.65)', bgcolor: 'rgba(148,163,184,0.06)' },
                  }}
                >
                  View availability
                </Button>
              </Stack>
            </Box>

            {/* Features */}
            <Grid container spacing={3} justifyContent="center" sx={{ mb: { xs: 7, md: 10 } }}>
              {features.map((feature) => (
                <Grid item xs={12} sm={4} key={feature.title}>
                  <Card
                    elevation={0}
                    sx={{ 
                      p: 4,
                      textAlign: 'left',
                      borderRadius: 4,
                      height: '100%',
                      border: '1px solid rgba(148,163,184,0.18)',
                      background: 'linear-gradient(160deg, rgba(30,41,59,0.65), rgba(15,23,42,0.8))',
                      transition: 'all 0.35s ease',
                      '&:hover': { transform: 'translateY(-8px)', borderColor: 'rgba(99,102,241,0.5)' },
                      mx: { xs: 0, sm: 'auto' },
                      maxWidth: 340,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: 'rgba(99,102,241,0.16)', display: 'grid', placeItems: 'center', color: '#A5B4FC' }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>{feature.title}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7 }}>{feature.description}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box id="ongoing-services" sx={{ mb: { xs: 9, md: 12 } }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{ color: '#94A3B8', letterSpacing: 2.5, fontWeight: 700 }}>Now available</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2.2rem', md: '3.2rem' }, color: '#F8FAFC', mb: 1 }}>
                  Ongoing Services
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 620 }}>
                  Choose the right program for your goals. Each service includes dedicated coaching and priority support.
                </Typography>
              </Box>
              <Grid container spacing={4}>
              {ongoingServices.map((service) => (
                <Grid item xs={12} sm={6} lg={4} key={service.name}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: '1px solid rgba(148,163,184,0.18)',
                      background: 'linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.9))',
                      transition: 'all 0.4s ease',
                      '&:hover': { transform: 'translateY(-10px)', borderColor: 'rgba(99,102,241,0.55)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC' }}>{service.name}</Typography>
                      <Chip label={service.type} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.12)', color: '#C7D2FE', fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.7rem', px: 1 }} />
                    </Box>
                    <List sx={{ mb: 4, flexGrow: 1 }}>
                      {service.features.map((feature) => (
                        <ListItem key={feature} sx={{ py: 1, px: 0 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#38BDF8', mr: 1.5 }} />
                          <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2', sx: { color: '#94A3B8', fontWeight: 500 } }} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<MessageIcon />}
                      href={getWhatsAppUrl(service.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: '#0F172A',
                        color: '#E2E8F0',
                        textTransform: 'none',
                        py: 1.4,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        border: '1px solid rgba(148,163,184,0.3)',
                        '&:hover': { bgcolor: '#111827', borderColor: 'rgba(99,102,241,0.6)', boxShadow: '0 10px 25px rgba(15,23,42,0.6)' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Request slot
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
            </Box>

            {/* Coming Soon */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Divider sx={{ flex: 1, borderColor: 'rgba(148,163,184,0.2)' }} />
                <Typography variant="overline" sx={{ color: '#94A3B8', letterSpacing: 2, fontWeight: 700 }}>Coming soon</Typography>
                <Divider sx={{ flex: 1, borderColor: 'rgba(148,163,184,0.2)' }} />
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 4, textAlign: 'center' }}>
                Upcoming Programs
              </Typography>
              <Grid container spacing={2.5}>
                {upcomingServices.map((service) => (
                  <Grid item xs={6} sm={4} md={2} key={service.name}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        bgcolor: 'rgba(15,23,42,0.7)',
                        border: '1px dashed rgba(148,163,184,0.35)',
                        borderRadius: 3,
                        color: '#CBD5E1',
                        transition: 'all 0.3s ease',
                        '&:hover': { borderColor: 'rgba(99,102,241,0.6)', color: '#E2E8F0' }
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>{service.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>{service.type}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>
      </>
    </Layout>
  );
};

export default Services;
