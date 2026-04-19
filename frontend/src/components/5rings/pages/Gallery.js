import React, { useState } from 'react';
import { Box, Container, Typography, Card, IconButton, Avatar, Stack, Divider, GlobalStyles } from '@mui/material';
import Layout from '../components/Layout.js';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    { id: 1, name: "Benjamin Robert", role: "CEO & Co-Founder", image: "https://randomuser.me/api/portraits/men/32.jpg", text: "It is very satisfying to cooperate with this sports facility, because we are supplied with various types of sports energy for the sustainability of our health in running the business, very satisfying, thank you." },
    { id: 2, name: "Sarah Jenkins", role: "Professional Athlete", image: "https://randomuser.me/api/portraits/women/44.jpg", text: "The infrastructure here is world-class. I've trained in many places, but 5RINGS offers a unique blend of technology and traditional coaching that is hard to find elsewhere." },
    { id: 3, name: "Michael Chen", role: "Sports Enthusiast", image: "https://randomuser.me/api/portraits/men/85.jpg", text: "A perfect place for my kids to learn discipline and sportsmanship. The coaches are attentive and the environment is very safe and encouraging." }
  ];

  const nextTestimonial = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <Layout>
      <>
        <GlobalStyles
          styles={{
            '@import': [
              "url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap')",
            ],
          }}
        />
        <Box
          sx={{
            pt: { xs: 10, md: 12 },
            minHeight: '100vh',
            bgcolor: '#0B1120',
            background:
              'radial-gradient(1100px 500px at 20% -10%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(900px 500px at 90% 0%, rgba(16,185,129,0.18), transparent 55%), #0B1120',
            fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
          }}
        >
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
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
              Client Stories
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
              Client Testimonials
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#94A3B8',
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                fontWeight: 500,
                maxWidth: 720,
                mx: 'auto',
              }}
            >
              Stories from teams, coaches, and athletes who train, compete, and grow with 5RINGS.
            </Typography>
          </Box>

          {/* Testimonial Carousel */}
          <Box sx={{ maxWidth: 980, mx: 'auto', mb: 12, position: 'relative', px: { xs: 0, md: 8 } }}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'left',
                borderRadius: 4,
                position: 'relative',
                overflow: 'visible',
                border: '1px solid rgba(148,163,184,0.16)',
                background: 'linear-gradient(160deg, rgba(30,41,59,0.65), rgba(15,23,42,0.85))',
                boxShadow: '0 20px 60px rgba(2,6,23,0.6)',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 3 }}>
                <Avatar
                  src={testimonials[currentIndex].image}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '3px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                  }}
                />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#F8FAFC', mt: 0.5 }}>
                    {testimonials[currentIndex].name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#A5B4FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    {testimonials[currentIndex].role}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ mt: 0.4, color: 'rgba(99,102,241,0.5)' }}>
                  <FormatQuoteIcon sx={{ fontSize: 34 }} />
                </Box>
                <Typography variant="h6" sx={{ lineHeight: 1.7, color: '#CBD5E1', fontWeight: 500 }}>
                  {testimonials[currentIndex].text}
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(148,163,184,0.2)' }} />
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1' }} />
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Trusted by athletes, coaches, and families across the region.
                </Typography>
              </Stack>
            </Card>

            {/* Desktop Arrows */}
            <IconButton onClick={prevTestimonial} sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(15,23,42,0.7)', color: '#E2E8F0', border: '1px solid rgba(148,163,184,0.2)', backdropFilter: 'blur(10px)', '&:hover': { bgcolor: 'rgba(99,102,241,0.12)', borderColor: '#6366f1', transform: 'translateY(-50%) scale(1.08)' }, transition: 'all 0.3s ease' }}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={nextTestimonial} sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(15,23,42,0.7)', color: '#E2E8F0', border: '1px solid rgba(148,163,184,0.2)', backdropFilter: 'blur(10px)', '&:hover': { bgcolor: 'rgba(99,102,241,0.12)', borderColor: '#6366f1', transform: 'translateY(-50%) scale(1.08)' }, transition: 'all 0.3s ease' }}>
              <ChevronRightIcon />
            </IconButton>

            {/* Mobile Arrows */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', gap: 2, mt: 4 }}>
              <IconButton onClick={prevTestimonial} sx={{ bgcolor: 'rgba(15,23,42,0.7)', color: '#E2E8F0', border: '1px solid rgba(148,163,184,0.2)', '&:hover': { bgcolor: 'rgba(99,102,241,0.12)', borderColor: '#6366f1' }, boxShadow: '0 6px 16px rgba(2,6,23,0.4)' }}>
                <ChevronLeftIcon />
              </IconButton>
              <IconButton onClick={nextTestimonial} sx={{ bgcolor: 'rgba(15,23,42,0.7)', color: '#E2E8F0', border: '1px solid rgba(148,163,184,0.2)', '&:hover': { bgcolor: 'rgba(99,102,241,0.12)', borderColor: '#6366f1' }, boxShadow: '0 6px 16px rgba(2,6,23,0.4)' }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
        </Box>
      </>
    </Layout>
  );
};

export default Gallery;
