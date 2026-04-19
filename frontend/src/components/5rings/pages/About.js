import React from 'react';
import { Box, Container, Typography, Grid, Card } from '@mui/material';
import Layout from '../components/Layout.js';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const About = () => {
  const stats = [
    { value: '2018', label: 'Founded', color: '#3B82F6' },
    { value: '7+', label: 'Sports', color: '#10B981' },
    { value: '1000+', label: 'Athletes Trained', color: '#F59E0B' },
    { value: '1', label: 'Premium Facility', color: '#8B5CF6' }
  ];

  const team = [
    { name: 'Ashok Kumar H', role: 'Director' },
    { name: 'Suriyaraaj K', role: 'Head of Operations' },
    { name: 'Rishi Kumar', role: 'Technical Lead' }
  ];

  const values = [
    { icon: <FavoriteIcon sx={{ fontSize: 36 }} />, title: 'Passion', description: 'We love what we do and it shows in everything we deliver', color: '#EF4444' },
    { icon: <EmojiEventsIcon sx={{ fontSize: 36 }} />, title: 'Excellence', description: 'Commitment to the highest standards in sports training', color: '#F59E0B' },
    { icon: <VisibilityIcon sx={{ fontSize: 36 }} />, title: 'Innovation', description: 'Leveraging technology to enhance athletic performance', color: '#3B82F6' },
    { icon: <TrackChangesIcon sx={{ fontSize: 36 }} />, title: 'Community', description: 'Building a supportive ecosystem for all athletes', color: '#10B981' }
  ];

  return (
    <Layout>
      <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 8, md: 12 }, bgcolor: 'transparent', minHeight: '100vh', position: 'relative' }}>
        {/* Background Decorative Elements */}
        <Box sx={{ position: 'absolute', top: '10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
          
          {/* Hero Section */}
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', mb: { xs: 10, md: 14 } }}>
            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '4.5rem', lg: '5rem' }, mb: 3, letterSpacing: -1, color: '#FFFFFF' }}>
              The <span style={{ color: '#3B82F6' }}>5RINGS</span> Story
            </Typography>
            <Typography variant="h5" sx={{ color: '#94A3B8', fontSize: { xs: '1.1rem', md: '1.3rem' }, fontWeight: 400, lineHeight: 1.6 }}>
              A multi-sports and sports technology organization dedicated to fostering athletic excellence and community wellness.
            </Typography>
          </Box>

          {/* Who We Are & Stats */}
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center" sx={{ mb: { xs: 12, md: 16 } }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, color: '#F8FAFC', letterSpacing: -0.5 }}>
                Who We Are
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', fontSize: '1.1rem', mb: 3, lineHeight: 1.8 }}>
                FIVERINGS SPORTS PVT LTD is Chennai's premier multi-sports organization, established with a vision to make quality sports facilities accessible to everyone. Our philosophy, "Everyone is our customer," reflects our commitment to inclusive athletic development.
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', fontSize: '1.1rem', lineHeight: 1.8 }}>
                From traditional Indian martial arts like Silambam to modern sports like Football and Tennis, we offer a comprehensive ecosystem that caters to athletes of all ages and skill levels.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="glass-panel" sx={{ p: { xs: 4, md: 5 }, borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)', backdropFilter: 'blur(10px)' }}>
                <Grid container spacing={4}>
                  {stats.map((stat) => (
                    <Grid size={{ xs: 6 }} key={stat.label}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: stat.color, mb: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* Founder */}
          <Box className="glass-panel" sx={{ 
            p: { xs: 4, md: 6 }, 
            mb: { xs: 12, md: 16 }, 
            borderRadius: 6, 
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.15) 100%)'
          }}>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="overline" sx={{ color: '#60A5FA', fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}>
                FOUNDER & VISIONARY
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#F8FAFC', mb: 1 }}>
                Radhakrishnan N
              </Typography>
              <Typography variant="h6" sx={{ color: '#94A3B8', fontStyle: 'italic', mb: 4, fontWeight: 400 }}>
                "Passion of Sports"
              </Typography>
              <Typography variant="body1" sx={{ color: '#CBD5E1', lineHeight: 1.8, fontSize: '1.1rem', maxWidth: 900 }}>
                Son of Weaver, Graduate in Commerce, Career in Chartered Accountant profession, Articled assistant of CA Firm, Internal Auditor of Automobile MNC, Self Employed Consultant and Accountant, Interest in Games, Passionate in Sports - stepped in "5Rings -Multi Sports Facility"
              </Typography>
            </Box>
          </Box>

          {/* Vision & Mission Row - Aligned with CTA styles */}
          <Grid container spacing={4} sx={{ mb: { xs: 12, md: 16 } }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="glass-panel" sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, height: '100%', borderTop: '4px solid #3B82F6', transition: 'all 0.3s ease', background: 'linear-gradient(160deg, rgba(59, 130, 246, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)', '&:hover': { transform: 'translateY(-5px)', borderColor: '#60A5FA', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' } }}>
                <VisibilityIcon sx={{ fontSize: 48, color: '#3B82F6', mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>Our Vision</Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '1.1rem' }}>
                  To become India's most trusted multi-sports organization, creating a holistic ecosystem that nurtures athletic talent, promotes wellness, and leverages technology to revolutionize the sports and fitness industry.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="glass-panel" sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, height: '100%', borderTop: '4px solid #F59E0B', transition: 'all 0.3s ease', background: 'linear-gradient(160deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.4) 100%)', '&:hover': { transform: 'translateY(-5px)', borderColor: '#fbbf24', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.1)' } }}>
                <TrackChangesIcon sx={{ fontSize: 48, color: '#F59E0B', mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>Our Mission</Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '1.1rem' }}>
                  To provide world-class sports facilities and technology-driven solutions that make quality athletic training accessible to everyone, fostering a dedicated community of champions and promoting a profoundly healthy lifestyle.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* The Team */}
          <Box sx={{ mb: { xs: 12, md: 16 } }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#F8FAFC', mb: 2 }}>
                The <span style={{ color: '#3B82F6' }}>Team</span>
              </Typography>
              <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 400 }}>
                The people driving our vision forward
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {team.map((person) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={person.name}>
                  <Card elevation={0} className="glass-panel" sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    borderRadius: 4, 
                    bgcolor: 'rgba(30, 41, 59, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease', 
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)'
                    } 
                  }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#1E293B', mx: 'auto', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#3B82F6', border: '2px solid rgba(59, 130, 246, 0.2)' }}>
                      {person.name.charAt(0)}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 1 }}>
                      {person.name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                      {person.role}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Core Values */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#F8FAFC', mb: 2 }}>
              Our Core <span style={{ color: '#10B981' }}>Values</span>
            </Typography>
            <Typography variant="h6" sx={{ color: '#94A3B8', maxWidth: 700, mx: 'auto', mb: 8, fontWeight: 400 }}>
              The principles that guide everything we do and how we interact with our athletes
            </Typography>

            <Grid container spacing={4}>
              {values.map((value, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card elevation={0} className="glass-panel" sx={{ 
                    p: 4, 
                    height: '100%', 
                    textAlign: 'center', 
                    borderRadius: 6,
                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      borderColor: `${value.color}40`,
                      boxShadow: `0 20px 40px ${value.color}15`
                    }
                  }}>
                    <Box sx={{ 
                      width: 70, 
                      height: 70, 
                      borderRadius: 4, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mx: 'auto', 
                      mb: 3,
                      bgcolor: `${value.color}15`,
                      color: value.color,
                      transition: 'all 0.3s ease'
                    }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#F8FAFC' }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                      {value.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

        </Container>
      </Box>
    </Layout>
  );
};

export default About;
