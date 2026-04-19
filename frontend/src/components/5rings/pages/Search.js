import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  Chip,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Layout from '../components/Layout.js';
import api, { foodAPI } from '../../../utils/api';

const SPORTS_CATALOG = [
  {
    name: 'Football',
    type: 'Indoor',
    status: 'Open',
    description: 'Indoor football with professional turf and lighting for 5-a-side matches and training sessions.',
  },
  {
    name: 'Cricket',
    type: 'Outdoor',
    status: 'Open',
    description: 'Cricket facilities with nets, practice pitches, and box cricket for all skill levels.',
  },
  {
    name: 'Tennis',
    type: 'Indoor',
    status: 'Open',
    description: 'Professional tennis courts with quality surfaces and equipment for singles and doubles play.',
  },
  {
    name: 'Kick Boxing',
    type: 'Indoor',
    status: 'Open',
    description: 'Certified instructors and a fully-equipped kickboxing studio with premium gear.',
  },
  {
    name: 'Table Tennis',
    type: 'Indoor',
    status: 'Open',
    description: 'Competition-grade tables and equipment for recreational and professional play.',
  },
  {
    name: 'Silambam',
    type: 'Outdoor',
    status: 'Upcoming',
    description: 'Traditional Silambam training guided by experienced masters.',
  },
  {
    name: 'Archery',
    type: 'Outdoor',
    status: 'Upcoming',
    description: 'Precision archery training with professional equipment and expert guidance.',
  },
  {
    name: 'Basketball',
    type: 'Indoor',
    status: 'Upcoming',
    description: 'Full-court basketball arena with pro-standard boards and flooring.',
  },
  {
    name: 'Volleyball',
    type: 'Indoor',
    status: 'Upcoming',
    description: 'Dedicated volleyball courts designed for training camps and league games.',
  },
];

const normalizeQuery = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .trim();

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [foodLoading, setFoodLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .get('/events')
      .then((res) => {
        if (!isMounted) return;
        setEvents(res.data.events || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setEvents([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setFoodLoading(true);
    foodAPI
      .getAllMenuItems()
      .then((res) => {
        if (!isMounted) return;
        setFoodItems(res.data.menuItems || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setFoodItems([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setFoodLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = normalizeQuery(searchQuery);

  const filteredSports = useMemo(() => {
    if (!normalizedQuery) return [];
    return SPORTS_CATALOG.filter((sport) => {
      const haystack = [sport.name, sport.description, sport.type, sport.status]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const filteredEvents = useMemo(() => {
    if (!normalizedQuery) return [];
    return events.filter((event) => {
      const haystack = [
        event.title || event.name,
        event.description,
        event.sport,
        event.eventType || event.type,
        event.venue?.name,
        event.venue?.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [events, normalizedQuery]);

  const filteredFood = useMemo(() => {
    if (!normalizedQuery) return [];
    return foodItems.filter((item) => {
      const haystack = [
        item.name,
        item.description,
        item.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [foodItems, normalizedQuery]);

  const sectionOrder = useMemo(() => {
    if (!normalizedQuery) return ['sports', 'events', 'food'];

    const q = normalizedQuery;
    const wantsEvents = /(event|events|tournament|match|camp|training|workshop)/.test(q);
    const wantsFood = /(food|menu|dish|cuisine|snack|breakfast|lunch|dinner|dessert|beverage)/.test(q);

    const counts = {
      sports: filteredSports.length,
      events: filteredEvents.length,
      food: filteredFood.length,
    };

    const baseOrder = ['sports', 'events', 'food']
      .map((key) => ({ key, count: counts[key] }))
      .sort((a, b) => b.count - a.count)
      .map(({ key }) => key);

    if (wantsEvents && counts.events > 0) {
      return ['events', ...baseOrder.filter((key) => key !== 'events')];
    }
    if (wantsFood && counts.food > 0) {
      return ['food', ...baseOrder.filter((key) => key !== 'food')];
    }

    return baseOrder;
  }, [normalizedQuery, filteredSports.length, filteredEvents.length, filteredFood.length]);

  const renderSportsSection = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#F8FAFC' }}>
          Sports results
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/sports`)}
          sx={{ borderColor: 'rgba(148,163,184,0.4)', color: '#CBD5E1', textTransform: 'none' }}
        >
          View Sports
        </Button>
      </Stack>
      <Grid container spacing={3}>
        {normalizedQuery && filteredSports.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ color: '#94A3B8' }}>No sports found for this search.</Typography>
          </Grid>
        )}
        {filteredSports.map((sport) => (
          <Grid item xs={12} md={6} key={sport.name}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.85)',
                border: '1px solid rgba(148,163,184,0.18)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: '#F8FAFC' }}>{sport.name}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={sport.type} sx={{ bgcolor: 'rgba(99,102,241,0.15)', color: '#C7D2FE' }} />
                  <Chip size="small" label={sport.status} sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#A7F3D0' }} />
                </Stack>
              </Stack>
              <Typography sx={{ color: '#94A3B8' }}>{sport.description}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderEventsSection = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#F8FAFC' }}>
          Events results
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/events`)}
          sx={{ borderColor: 'rgba(148,163,184,0.4)', color: '#CBD5E1', textTransform: 'none' }}
        >
          View Events
        </Button>
      </Stack>
      <Grid container spacing={3}>
        {normalizedQuery && !loading && filteredEvents.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ color: '#94A3B8' }}>No events found for this search.</Typography>
          </Grid>
        )}
        {filteredEvents.map((event) => (
          <Grid item xs={12} md={6} key={event._id}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.85)',
                border: '1px solid rgba(148,163,184,0.18)',
              }}
            >
              <Typography sx={{ fontWeight: 800, color: '#F8FAFC', mb: 1 }}>
                {event.title || event.name}
              </Typography>
              <Typography sx={{ color: '#94A3B8', mb: 1.5 }}>
                {event.description || 'Event details available in the events page.'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {event.sport && (
                  <Chip size="small" label={event.sport} sx={{ bgcolor: 'rgba(99,102,241,0.15)', color: '#C7D2FE' }} />
                )}
                {event.eventType && (
                  <Chip size="small" label={event.eventType} sx={{ bgcolor: 'rgba(148,163,184,0.18)', color: '#E2E8F0' }} />
                )}
                {event.venue?.name && (
                  <Chip size="small" label={event.venue.name} sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#A7F3D0' }} />
                )}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderFoodSection = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#F8FAFC' }}>
          Food results
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/food`)}
          sx={{ borderColor: 'rgba(148,163,184,0.4)', color: '#CBD5E1', textTransform: 'none' }}
        >
          View Food
        </Button>
      </Stack>
      <Grid container spacing={3}>
        {normalizedQuery && !foodLoading && filteredFood.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ color: '#94A3B8' }}>No food items found for this search.</Typography>
          </Grid>
        )}
        {filteredFood.map((item) => (
          <Grid item xs={12} md={6} key={item._id}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.85)',
                border: '1px solid rgba(148,163,184,0.18)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: '#F8FAFC' }}>{item.name}</Typography>
                <Chip size="small" label={`₹${item.price}`} sx={{ bgcolor: 'rgba(99,102,241,0.15)', color: '#C7D2FE' }} />
              </Stack>
              <Typography sx={{ color: '#94A3B8', mb: 1.5 }}>
                {item.description || 'Menu item available on the food page.'}
              </Typography>
              {item.category && (
                <Chip size="small" label={item.category} sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#A7F3D0' }} />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout>
      <Box
        sx={{
          bgcolor: '#0B1120',
          color: '#F8FAFC',
          py: { xs: 6, md: 9 },
          textAlign: 'center',
          background:
            'radial-gradient(900px 420px at 20% -10%, rgba(59,130,246,0.24), transparent 60%), radial-gradient(800px 420px at 85% 0%, rgba(16,185,129,0.16), transparent 55%), #0B1120',
        }}
      >
        <Container maxWidth="md">
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#94A3B8',
              mb: 2,
            }}
          >
            Search
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.2rem', md: '3.4rem' }, mb: 1.5 }}>
            Results for "{searchQuery || '...'}"
          </Typography>
            <Typography sx={{ color: '#94A3B8' }}>
            We search across sports, events, and food.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <TextField
              fullWidth
              placeholder="Search sports and events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15,23,42,0.9)',
                  borderRadius: 3,
                  color: '#E2E8F0',
                  '& fieldset': {
                    borderColor: 'rgba(148,163,184,0.25)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(148,163,184,0.45)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1'
                  }
                }
              }}
            />
          </Box>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#0B1120', minHeight: '60vh', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                flex: 1,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,184,0.18)',
              }}
            >
              <Typography sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Sports matches
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#F8FAFC' }}>
                {filteredSports.length}
              </Typography>
            </Card>
            <Card
              elevation={0}
              sx={{
                p: 3,
                flex: 1,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,184,0.18)',
              }}
            >
              <Typography sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Event matches
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#F8FAFC' }}>
                {loading ? '…' : filteredEvents.length}
              </Typography>
            </Card>
            <Card
              elevation={0}
              sx={{
                p: 3,
                flex: 1,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,184,0.18)',
              }}
            >
              <Typography sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Food matches
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#F8FAFC' }}>
                {foodLoading ? '…' : filteredFood.length}
              </Typography>
            </Card>
          </Stack>

          <Stack spacing={4}>
            {sectionOrder.map((section, index) => (
              <Box key={section}>
                {section === 'sports' && renderSportsSection()}
                {section === 'events' && renderEventsSection()}
                {section === 'food' && renderFoodSection()}
                {index < sectionOrder.length - 1 && (
                  <Divider sx={{ my: 4, borderColor: 'rgba(148,163,184,0.18)' }} />
                )}
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>
    </Layout>
  );
};

export default Search;
