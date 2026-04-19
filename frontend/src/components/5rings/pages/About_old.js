import React from 'react';
import { Box, Container, Typography, Grid, Card, alpha } from '@mui/material';
import Layout from '../components/Layout.js';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const About = () => {
  const stats = [
    { value: '2018', label: 'Founded' },
    { value: '7+', label: 'Sports' },
    { value: '1000+', label: 'Athletes Trained' },
    { value: '1', label: 'Premium Facility' }
  ];

  const team = [
    { name: 'Ashok Kumar H' },
    { name: 'Suriyaraaj K' },
    { name: 'Rishi Kumar' }
  ];

  const values = [
    { icon: <FavoriteIcon sx={{ fontSize: 32 }} />, title: 'Passion', description: 'We love what we do and it shows in everything we deliver' },
    { icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />, title: 'Excellence', description: 'Commitment to the highest standards in sports training' },
    { icon: <VisibilityIcon sx={{ fontSize: 32 }} />, title: 'Innovation', description: 'Leveraging technology to enhance athletic performance' },
    { icon: <TrackChangesIcon sx={{ fontSize: 32 }} />, title: 'Community', description: 'Building a supportive ecosystem for all athletes' }
  ];

  return (
    <Layout>
      <Box sx={{ pt: 12, bgcolor: 'transparent' }}>
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center', mb: 10 }}>
            <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: '3rem', md: '4.5rem' }, mb: 3, color: 'text.primary' }}>
              About{' '}
              <Box
                component="span"
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 8,
                    left: 0,
                    width: '100%',
                    height: 12,
                    bgcolor: alpha('#1a1a1a', 0.1),
                    zIndex: -1
                  }
                }}
              >
                5RINGS
              </Box>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontSize: '1.25rem' }}>
              A multi-sports and sports technology organization dedicated to fostering athletic excellence and community wellness.
            </Typography>
          </Box>

          {/* Who We Are */}
          <Grid container spacing={8} alignItems="center" sx={{ mb: 15 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight={900} sx={{ mb: 3 }}>
                Who We Are
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                FIVERINGS SPORTS PVT LTD is Chennai's premier multi-sports organization, established with a vision to make quality sports facilities accessible to everyone. Our philosophy, "Everyone is our customer," reflects our commitment to inclusive athletic development.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                From traditional Indian martial arts like Silambam to modern sports like Football and Tennis, we offer a comprehensive ecosystem that caters to athletes of all ages and skill levels.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              >
                <Grid container spacing={3}>
                  {stats.map((stat) => (
                    <Grid item xs={6} key={stat.label}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h3"
                          fontWeight={900}
                          sx={{
                            color: 'text.primary',
                            mb: 1
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>

          {/* Founder */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              mb: 15,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{ mb: 1 }}>
                Founder
              </Typography>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  color: 'text.primary',
                  mb: 2
                }}
              >
                Radhakrishnan N
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 4 }}>
                "Passion of Sports"
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Son of Weaver, Graduate in Commerce, Career in Chartered Accountant profession, Articled assistant of CA Firm, Internal Auditor of Automobile MNC, Self Employed Consultant and Accountant, Interest in Games, Passionate in Sports - stepped in "5Rings -Multi Sports Facility"
              </Typography>
            </Box>
          </Card>

          {/* Team */}
          <Box sx={{ mb: 15 }}>
            <Typography
              variant="h3"
              fontWeight={900}
              textAlign="center"
              sx={{
                mb: 6,
                color: 'text.primary'
              }}
            >
              TEAM
            </Typography>
            <Grid container spacing={4}>
              {team.map((person) => (
                <Grid item xs={12} md={4} key={person.name}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {person.name}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Vision & Mission */}
          <Grid container spacing={6} sx={{ mb: 15 }}>
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  p: 5,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                    '& .icon-box': {
                      transform: 'scale(1.1)',
                      bgcolor: 'background.paper',
                      color: 'white'
                    }
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Box
                  className="icon-box"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha('#fff', 0.05),
                    color: 'text.primary',
                    mb: 4,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h3" fontWeight={900} sx={{ mb: 3 }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  To become India's most trusted multi-sports organization, creating a holistic ecosystem that nurtures athletic talent, promotes wellness, and leverages technology to revolutionize the sports industry.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  p: 5,
                  height: '100%',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  '&:hover': {
                    borderColor: alpha('#FFC107', 0.5),
                    '& .icon-box': {
                      transform: 'scale(1.1)'
                    }
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box
                  className="icon-box"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha('#FFC107', 0.1),
                    color: '#FFC107',
                    mb: 4,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <TrackChangesIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h3" fontWeight={900} sx={{ mb: 3 }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  To provide world-class sports facilities and technology-driven solutions that make quality athletic training accessible to everyone, fostering a community of champions and promoting a healthy lifestyle.
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Core Values */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={900} sx={{ mb: 2 }}>
              Our Core Values
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              The principles that guide everything we do
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                      '& .value-icon': {
                        color: 'text.primary',
                        transform: 'scale(1.1)'
                      }
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Box
                    className="value-icon"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {value.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default About;
