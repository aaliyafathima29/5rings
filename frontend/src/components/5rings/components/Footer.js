import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, IconButton, alpha } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer = () => {
  const WHATSAPP_NUMBER = '919876543210';

  return (
    <Box component="footer" sx={{ 
      background: 'linear-gradient(180deg, rgba(11, 17, 32, 0.9) 0%, rgba(5, 10, 21, 1) 100%)', 
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: 'none',
      color: 'white', 
      pt: { xs: 6, md: 10 }, 
      pb: { xs: 3, md: 4 }, 
      mt: { xs: 6, md: 8 },
      position: 'relative',
      zIndex: 10,
      overflow: 'hidden'
    }}>
      {/* Background Ambience */}
      <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '100%', background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.15) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container rowSpacing={{ xs: 4, md: 5 }} columnSpacing={{ xs: 5, md: 7 }} alignItems="flex-start">
          {/* Brand Section */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Box component="img" src="/5rings.jpg" alt="5Rings" sx={{ height: 55, mb: 2.5, borderRadius: 2 }} />
              <Typography variant="h5" fontWeight={800} sx={{ color: 'white', mb: 2, letterSpacing: 0.5 }}>
                5RINGS SPORTS
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.7, lineHeight: 1.8, maxWidth: { xs: '100%', md: 340 }, mx: { xs: 'auto', md: 0 } }}>
              Chennai's premier multi-sports organization dedicated to fostering athletic excellence and community wellness through world-class facilities and technology-driven solutions.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <IconButton href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" sx={{ bgcolor: alpha('#fff', 0.05), border: '1px solid rgba(255,255,255,0.08)', color: '#25D366', '&:hover': { bgcolor: '#25D366', color: 'white', transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(37,211,102,0.4)' }, transition: 'all 0.3s ease' }}>
                <WhatsAppIcon />
              </IconButton>
              <IconButton sx={{ bgcolor: alpha('#fff', 0.05), border: '1px solid rgba(255,255,255,0.08)', color: 'white', '&:hover': { bgcolor: '#3b5998', borderColor: '#3b5998', color: 'white', transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(59,89,152,0.4)' }, transition: 'all 0.3s ease' }}>
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ bgcolor: alpha('#fff', 0.05), border: '1px solid rgba(255,255,255,0.08)', color: 'white', '&:hover': { bgcolor: '#1DA1F2', borderColor: '#1DA1F2', color: 'white', transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(29,161,242,0.4)' }, transition: 'all 0.3s ease' }}>
                <TwitterIcon />
              </IconButton>
              <IconButton
                href="https://www.instagram.com/5rings_sports/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: alpha('#fff', 0.05), border: '1px solid rgba(255,255,255,0.08)', color: 'white', '&:hover': { bgcolor: '#E1306C', borderColor: '#E1306C', color: 'white', transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(225,48,108,0.4)' }, transition: 'all 0.3s ease' }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton sx={{ bgcolor: alpha('#fff', 0.05), border: '1px solid rgba(255,255,255,0.08)', color: 'white', '&:hover': { bgcolor: '#0077b5', borderColor: '#0077b5', color: 'white', transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,119,181,0.4)' }, transition: 'all 0.3s ease' }}>
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3} sx={{ textAlign: { xs: 'center', sm: 'left' }, pl: { xs: 0, md: 1.5 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3.5, color: 'white', fontSize: '1.1rem' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              {[
                { text: 'Home', path: '/' },
                { text: 'About Us', path: '/about' },
                { text: 'Sports', path: '/sports' },
                { text: 'Services', path: '/services' },
                { text: 'Gallery', path: '/gallery' },
                { text: 'Contact', path: '/contact' }
              ].map((link) => (
                <Link
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    width: 'fit-content',
                    '&:hover': {
                      color: 'white',
                      paddingLeft: 1.5,
                      '&::before': {
                        width: '8px'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: '2px',
                      bgcolor: 'white',
                      transition: 'width 0.3s ease'
                    }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Sports */}
          <Grid item xs={12} sm={6} md={2} sx={{ textAlign: { xs: 'center', sm: 'left' }, pl: { xs: 0, md: 1.5 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3.5, color: 'white', fontSize: '1.1rem' }}>
              Sports
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              {['Football', 'Cricket', 'Tennis', 'Kickboxing', 'Table Tennis', 'Silambam', 'Archery'].map((sport) => (
                <Typography key={sport} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {sport}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' }, pl: { xs: 0, md: 1.5 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3.5, color: 'white', fontSize: '1.1rem' }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, textAlign: 'left', maxWidth: 280 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.5)', mt: 0.3 }} />
                <Link
                  href="https://www.google.com/maps?q=90,+1st+Main+Rd,+Ambattur+Industrial+Estate,+Chennai,+Tamil+Nadu+600058"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', lineHeight: 1.7, '&:hover': { color: 'white' }, transition: 'all 0.3s ease' }}
                >
                  FIVERINGS SPORTS PVT LTD<br />
                  90, 1st Main Rd, Ambattur Industrial Estate<br />
                  Chennai, Tamil Nadu 600058
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 280 }}>
                <PhoneIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.5)' }} />
                <Link href="tel:+919876543210" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: 'white' }, transition: 'all 0.3s ease' }}>
                  +91 9876543210
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 280 }}>
                <EmailIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.5)' }} />
                <Link href="mailto:info@5rings.in" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: 'white' }, transition: 'all 0.3s ease' }}>
                  info@5rings.in
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 280 }}>
                <WhatsAppIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.5)' }} />
                <Link href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontWeight: 500, '&:hover': { color: '#25D366' }, transition: 'all 0.3s ease' }}>
                  Chat on WhatsApp
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', mt: 8, pt: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} FIVERINGS SPORTS PVT LTD. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Link href="#" sx={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' }, transition: 'all 0.3s ease' }}>
              Privacy Policy
            </Link>
            <Link href="#" sx={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' }, transition: 'all 0.3s ease' }}>
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
