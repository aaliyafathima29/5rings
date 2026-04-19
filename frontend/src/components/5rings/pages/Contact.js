import React from 'react';
import { Box, Container, Typography, Grid, Card, Button, Stack, Divider, GlobalStyles } from '@mui/material';
import Layout from '../components/Layout.js';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Contact = () => {
  const WHATSAPP_NUMBER = '919876543210';

  const contacts = [
    { icon: <PhoneIcon sx={{ fontSize: 32 }} />, title: 'Phone', value: '+91 9876543210', href: 'tel:+919876543210' },
    { icon: <EmailIcon sx={{ fontSize: 32 }} />, title: 'Email', value: 'info@5rings.in', href: 'mailto:info@5rings.in' },
    { icon: <AccessTimeIcon sx={{ fontSize: 32 }} />, title: 'Hours', value: 'Mon-Sun: 6 AM - 10 PM', href: null }
  ];

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
              'radial-gradient(1100px 520px at 20% -10%, rgba(59,130,246,0.24), transparent 60%), radial-gradient(900px 520px at 90% 0%, rgba(16,185,129,0.18), transparent 55%), #0B1120',
            fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
          }}
        >
          <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
            {/* Hero */}
            <Box sx={{ maxWidth: 960, mx: 'auto', textAlign: 'center', mb: { xs: 6, md: 9 }, px: { xs: 2, md: 0 } }}>
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
                Contact 5RINGS
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: '2.8rem', md: '4.4rem' },
                  lineHeight: 1.05,
                  mb: 2,
                  color: '#F8FAFC',
                  letterSpacing: -1,
                }}
              >
                Speak with our team
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
                Get guidance on memberships, facility bookings, training programs, and partnerships.
              </Typography>
            </Box>

            {/* WhatsApp CTA */}
            <Card
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                mb: 7,
                borderRadius: 5,
                border: '1px solid rgba(16,185,129,0.25)',
                background: 'linear-gradient(140deg, rgba(15,23,42,0.9), rgba(2,6,23,0.95))',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
                gap: { xs: 3, md: 4 },
                alignItems: 'center',
              }}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: 'rgba(16,185,129,0.18)', display: 'grid', placeItems: 'center', color: '#34D399' }}>
                    <WhatsAppIcon />
                  </Box>
                  <Typography variant="overline" sx={{ color: '#A7F3D0', letterSpacing: 2, fontWeight: 700 }}>
                    Priority Support
                  </Typography>
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 1 }}>
                  Chat with us on WhatsApp
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 520 }}>
                  The fastest way to reach our team for bookings, membership queries, and facility access.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<WhatsAppIcon />}
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: '#16A34A',
                    color: 'white',
                    px: { xs: 3.5, md: 5 },
                    py: 1.6,
                    fontSize: { xs: '1rem', md: '1.05rem' },
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(22,163,74,0.35)',
                    '&:hover': { bgcolor: '#15803D', boxShadow: '0 14px 30px rgba(22,163,74,0.45)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Start conversation
                </Button>
              </Box>
            </Card>

            {/* Other Contact Methods */}
            <Grid container spacing={3} justifyContent="center" alignItems="stretch" sx={{ mb: 7 }}>
              {contacts.map((contact) => (
                <Grid item xs={12} md={4} key={contact.title} sx={{ display: 'flex' }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      width: '100%',
                      maxWidth: 360,
                      borderRadius: 4,
                      border: '1px solid rgba(148,163,184,0.18)',
                      background: 'linear-gradient(160deg, rgba(30,41,59,0.65), rgba(15,23,42,0.8))',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: 'rgba(99,102,241,0.18)', display: 'grid', placeItems: 'center', color: '#A5B4FC' }}>
                        {contact.icon}
                      </Box>
                      <Box>
                        <Typography variant="overline" sx={{ color: '#94A3B8', letterSpacing: 2, fontWeight: 700 }}>
                          {contact.title}
                        </Typography>
                        {contact.href ? (
                          <Typography component="a" href={contact.href} variant="h6" sx={{ color: '#E2E8F0', textDecoration: 'none', fontWeight: 700, display: 'block', mt: 0.5, '&:hover': { color: '#93C5FD' } }}>
                            {contact.value}
                          </Typography>
                        ) : (
                          <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 700, mt: 0.5 }}>
                            {contact.value}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                          {contact.title === 'Phone' && 'Call us for immediate assistance.'}
                          {contact.title === 'Email' && 'We respond within one business day.'}
                          {contact.title === 'Hours' && 'Support available throughout the week.'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Location */}
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 5,
                border: '1px solid rgba(148,163,184,0.2)',
                background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(2,6,23,0.85))',
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 4, bgcolor: 'rgba(245,158,11,0.18)', display: 'grid', placeItems: 'center', color: '#FBBF24' }}>
                  <LocationOnIcon />
                </Box>
                <Box>
                  <Typography variant="overline" sx={{ color: '#FCD34D', letterSpacing: 2, fontWeight: 700 }}>
                    Our location
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#F8FAFC', fontWeight: 800, mt: 0.5 }}>
                    FIVERINGS SPORTS PVT LTD
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                    Address: 90, 1st Main Rd, Ambattur Industrial Estate, Chennai, Tamil Nadu 600058
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 3, borderColor: 'rgba(148,163,184,0.2)' }} />
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Need directions or a site visit? Reach out and we will arrange a walkthrough.
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(148,163,184,0.2)'
                }}
              >
                <iframe
                  title="5RINGS location map"
                  src="https://www.google.com/maps?q=90,+1st+Main+Rd,+Ambattur+Industrial+Estate,+Chennai,+Tamil+Nadu+600058&output=embed"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Card>
          </Container>
        </Box>
      </>
    </Layout>
  );
};

export default Contact;
