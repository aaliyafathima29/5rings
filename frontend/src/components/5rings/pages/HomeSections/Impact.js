import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Zoom, alpha } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Impact = () => {
  const [stats, setStats] = useState({ athletes: 0, events: 0, sports: 0, years: 0 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const target = { athletes: 1000, events: 150, sports: 7, years: 6 };
        const duration = 2000, steps = 50, inc = duration / steps;
        
        Object.keys(target).forEach(key => {
          let current = 0;
          const stepVal = target[key] / steps;
          const timer = setInterval(() => {
            current += stepVal;
            if (current >= target[key]) {
              current = target[key];
              clearInterval(timer);
            }
            setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
          }, inc);
        });
      }
    }, { threshold: 0.1 });
    
    setTimeout(() => {
      const el = document.getElementById('impact-trigger');
      if (el) observer.observe(el);
    }, 500);
    return () => observer.disconnect();
  }, [started]);

  const items = [
    { label: 'Athletes Trained', val: `${stats.athletes}+`, icon: <PeopleIcon sx={{fontSize: 40, color: '#60A5FA'}} /> },
    { label: 'Events Organized', val: `${stats.events}+`, icon: <EmojiEventsIcon sx={{fontSize: 40, color: '#F59E0B'}} /> },
    { label: 'Sports Available', val: stats.sports, icon: <SportsSoccerIcon sx={{fontSize: 40, color: '#34D399'}} /> },
    { label: 'Years Experience', val: stats.years, icon: <TrendingUpIcon sx={{fontSize: 40, color: '#A78BFA'}} /> }
  ];

  return (
    <Box sx={{ bgcolor: '#0B1120', position: 'relative', mt: { xs: -4, md: -6 }, zIndex: 20, px: { xs: 2, md: 4 } }} id="impact-trigger">
      <Container maxWidth="lg" className="glass-panel" sx={{ borderRadius: { xs: 4, md: 8 }, py: { xs: 6, md: 8 }, px: { xs: 3, md: 6 } }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {items.map((item, i) => (
            <Grid item xs={6} md={3} key={item.label} sx={{ textAlign: 'center' }}>
              <Zoom in={started} style={{ transitionDelay: `${i * 150}ms` }}>
                <Box>
                  <Box sx={{ 
                    width: 72, height: 72, mx: 'auto', mb: 3, borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h3" fontWeight={900} sx={{ color: '#F8FAFC', mb: 1, fontFamily: 'monospace', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {item.val}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#94A3B8', fontWeight: 600, letterSpacing: 0.5 }}>
                    {item.label}
                  </Typography>
                </Box>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Impact;
