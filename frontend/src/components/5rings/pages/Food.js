import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Button, Chip,
  TextField, InputAdornment, Alert, Dialog, DialogContent,
  DialogActions, IconButton, Paper, Skeleton, Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  LocalFireDepartment as CalIcon,
  AddShoppingCart as CartIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  RestaurantMenu as MenuIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { foodAPI, SERVER_BASE } from '../../../utils/api';
import { useCart } from '../../../context/CartContext';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Dessert'];
const DIET_OPTIONS = [
  { key: 'all',        label: 'All' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan',      label: 'Vegan' },
  { key: 'glutenFree', label: 'Gluten-Free' },
];
const PLACEHOLDER_BG = 'rgba(255, 255, 255, 0.03)';

/* ── Loading skeleton card ────────────────────────────────────────────────── */
const CardSkeleton = () => (
  <Box className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'transparent' }}>
    <Skeleton variant="rectangular" height={280} />
    <Box sx={{ p: 3.5 }}>
      <Skeleton width="70%" height={32} sx={{ mb: 1.5 }} />
      <Skeleton width="90%" height={20} />
      <Skeleton width="60%" height={20} sx={{ mb: 2.5 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={80} height={36} />
        <Skeleton variant="rounded" width={130} height={44} />
      </Box>
    </Box>
  </Box>
);

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Food() {
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [category,  setCategory]  = useState('All');
  const [diet,      setDiet]      = useState('all');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [detail,    setDetail]    = useState(null);
  const [confirm,   setConfirm]   = useState(null);
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      const ids = saved ? JSON.parse(saved) : [];
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  });
  const { addToCart } = useCart();

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    foodAPI.getAllMenuItems()
      .then((res) => setMenuItems(res.data.menuItems || []))
      .catch(() => setError('Failed to load menu. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setSearch(q);
  }, [location.search]);

  useEffect(() => {
    let items = [...menuItems];
    if (category !== 'All') {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (diet === 'vegetarian') items = items.filter((i) => i.isVegetarian);
    if (diet === 'vegan')      items = items.filter((i) => i.isVegan);
    if (diet === 'glutenFree') items = items.filter((i) => i.isGlutenFree);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    setFiltered(items);
  }, [menuItems, category, diet, search]);

  const openConfirm = (item, e) => { e?.stopPropagation(); setConfirm(item); };
  const toggleWishlist = (item, e) => {
    e?.stopPropagation();
    setWishlistIds((prev) => (
      prev.includes(item._id)
        ? prev.filter((id) => id !== item._id)
        : [...prev, item._id]
    ));
  };

  const isInWishlist = (itemId) => wishlistIds.includes(itemId);

  const handleConfirm = () => {
    addToCart({
      id: confirm._id,
      name: confirm.name,
      price: confirm.price,
      image: confirm.images?.[0] || null,
      vendorId: confirm.vendor?._id,
      vendorName: confirm.vendor?.name,
      type: 'food',
    });
    setConfirm(null);
    setDetail(null);
  };

  return (
    <Layout>
      {/* ── Hero ── */}
      <Box
        sx={{
          bgcolor: '#0B1120',
          color: '#fff',
          py: { xs: 7, md: 11 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#3B82F6',
              mb: 3,
            }}
          >
            5Rings Kitchen
          </Typography>
          <Typography
            className="text-gradient"
            sx={{ fontWeight: 900, letterSpacing: -2, mb: 3, lineHeight: 1, fontSize: { xs: '3.5rem', md: '5.5rem' } }}
          >
            Elite Canteens
          </Typography>
          <Typography
            sx={{ fontSize: '1.25rem', color: '#94A3B8', maxWidth: 540, mx: 'auto', lineHeight: 1.8, fontWeight: 500 }}
          >
            Fresh meals prepared daily by our certified kitchen teams for elite performance.
          </Typography>
        </Container>
      </Box>

      {/* ── Filter bar ── */}
      <Box
        sx={{
          bgcolor: 'transparent',
          borderTop: 'none',
          borderBottom: 'none',
          boxShadow: 'none',
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 3 },
          backdropFilter: 'none',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(1200px 120px at 20% 50%, rgba(59,130,246,0.08), transparent 60%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              overflowX: { xs: 'auto', md: 'visible' }
            }}
          >
            <TextField
              size="small"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                width: { xs: '100%', md: 300 },
                flexShrink: 0,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 999,
                  fontSize: '1.05rem',
                  height: 50,
                  bgcolor: 'rgba(12,18,33,0.9)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.22)' },
                  '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.6)' },
                  '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                  boxShadow: '0 0 0 1px rgba(59,130,246,0.08) inset'
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setCategory(cat)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    height: 38,
                    borderRadius: 999,
                    cursor: 'pointer',
                    bgcolor: category === cat ? 'rgba(59,130,246,0.95)' : 'rgba(255,255,255,0.06)',
                    color: category === cat ? '#fff' : '#CBD5E1',
                    border: '1px solid',
                    borderColor: category === cat ? 'rgba(59,130,246,0.9)' : 'rgba(148,163,184,0.25)',
                    '&:hover': { bgcolor: category === cat ? '#2563EB' : 'rgba(255,255,255,0.1)' },
                    '& .MuiChip-label': { px: 1.8 },
                  }}
                />
              ))}
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: 'rgba(255,255,255,0.12)' }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
              {DIET_OPTIONS.map((opt) => (
                <Chip
                  key={opt.key}
                  label={opt.label}
                  onClick={() => setDiet(opt.key)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    height: 38,
                    borderRadius: 999,
                    cursor: 'pointer',
                    bgcolor: diet === opt.key ? 'rgba(22,163,74,0.95)' : 'rgba(255,255,255,0.06)',
                    color: diet === opt.key ? '#fff' : '#CBD5E1',
                    border: '1px solid',
                    borderColor: diet === opt.key ? 'rgba(22,163,74,0.9)' : 'rgba(148,163,184,0.25)',
                    '&:hover': { bgcolor: diet === opt.key ? '#15803d' : 'rgba(255,255,255,0.1)' },
                    '& .MuiChip-label': { px: 1.8 },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ bgcolor: 'transparent', minHeight: '60vh', py: 5 }}>
        <Container maxWidth="xl">
          {/* Result count */}
          {!loading && !error && (
            <Typography sx={{ fontSize: '1rem', color: '#94A3B8', mb: 3 }}>
              Showing <b style={{ color: '#F8FAFC' }}>{filtered.length}</b> item{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}

          {/* Loading skeletons */}
          {loading && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </Box>
          )}

          {/* Error */}
          {!loading && error && (
            <Alert severity="error" sx={{ maxWidth: 480, mx: 'auto' }}>{error}</Alert>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <SearchOffIcon sx={{ fontSize: 56, color: '#475569', mb: 2 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#E2E8F0', mb: 1 }}>
                No items found
              </Typography>
              <Typography sx={{ color: '#94A3B8', mb: 3 }}>
                Try adjusting your search or filters.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => { setSearch(''); setCategory('All'); setDiet('all'); }}
                sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}
              >
                Clear filters
              </Button>
            </Box>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {filtered.map((item) => (
                <Box
                  key={item._id}
                  className="glass-panel"
                  sx={{
                    bgcolor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.5)', transform: 'translateY(-3px)' },
                  }}
                >
                    {/* Image — clickable to open detail */}
                    <Box
                      onClick={() => setDetail(item)}
                      sx={{ cursor: 'pointer', flexShrink: 0 }}
                    >
                      {item.images?.[0] ? (
                        <Box
                          component="img"
                          src={`${SERVER_BASE}${item.images[0]}`}
                          alt={item.name}
                          sx={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 280,
                            bgcolor: PLACEHOLDER_BG,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MenuIcon sx={{ fontSize: 48, color: '#94A3B8' }} />
                        </Box>
                      )}
                    </Box>

                    {/* Body */}
                    <Box sx={{ p: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: { xs: 0.5, sm: 1 }, color: '#F8FAFC', lineHeight: 1.3 }}>
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography
                          sx={{
                            fontSize: '0.95rem',
                            color: '#94A3B8',
                            mb: 2,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.65,
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}

                      {/* Diet badges */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                        {item.isVegetarian && (
                          <Chip label="Veg" sx={{ fontSize: '0.75rem', height: 26, bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontWeight: 800, border: '1px solid rgba(22, 163, 74, 0.2)' }} />
                        )}
                        {item.isVegan && (
                          <Chip label="Vegan" sx={{ fontSize: '0.75rem', height: 26, bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontWeight: 800, border: '1px solid rgba(22, 163, 74, 0.2)' }} />
                        )}
                        {item.isGlutenFree && (
                          <Chip label="GF" sx={{ fontSize: '0.75rem', height: 26, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 800, border: '1px solid rgba(245, 158, 11, 0.2)' }} />
                        )}
                      </Box>

                      {/* Stats row */}
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                        {item.preparationTime && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <TimeIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                              {item.preparationTime} min
                            </Typography>
                          </Box>
                        )}
                        {item.nutrition?.calories && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalIcon sx={{ fontSize: 18, color: '#f97316' }} />
                            <Typography sx={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                              {item.nutrition.calories} kcal
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Price + buttons */}
                      <Divider sx={{ mt: 'auto', mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, color: '#F8FAFC' }}>
                          &#8377;{item.price}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <IconButton
                            onClick={(e) => toggleWishlist(item, e)}
                            aria-label={isInWishlist(item._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            sx={{
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: isInWishlist(item._id) ? '#ef4444' : '#94A3B8',
                              bgcolor: isInWishlist(item._id) ? 'rgba(239,68,68,0.12)' : 'transparent',
                              '&:hover': {
                                borderColor: isInWishlist(item._id) ? '#ef4444' : 'rgba(255,255,255,0.35)',
                                bgcolor: isInWishlist(item._id) ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.06)',
                              },
                            }}
                          >
                            {isInWishlist(item._id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                          </IconButton>
                          <Button
                            variant="outlined"
                            onClick={() => setDetail(item)}
                            sx={{
                              display: { xs: 'none', sm: 'flex' },
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: '#CBD5E1',
                              borderRadius: 2,
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              px: 2,
                              py: 1,
                              whiteSpace: 'nowrap',
                              '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: 'transparent' },
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<CartIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                            onClick={(e) => { e.stopPropagation(); openConfirm(item, e); }}
                            sx={{
                              bgcolor: '#3B82F6',
                              color: '#fff',
                              borderRadius: 2,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              fontWeight: 700,
                              px: { xs: 2.5, sm: 3 },
                              py: { xs: 0.8, sm: 1 },
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                              '&:hover': { bgcolor: '#2563EB', transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.6)' },
                            }}
                          >
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add to Cart</Box>
                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Detail Dialog ── */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            {detail.images?.[0] ? (
              <Box
                component="img"
                src={`${SERVER_BASE}${detail.images[0]}`}
                alt={detail.name}
                sx={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box sx={{ height: 180, bgcolor: PLACEHOLDER_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MenuIcon sx={{ fontSize: 56, color: '#475569' }} />
              </Box>
            )}
            <IconButton
              onClick={() => setDetail(null)}
              size="small"
              sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <DialogContent sx={{ pt: 2.5, bgcolor: '#0B1120' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 }, mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.3rem' }, color: '#F8FAFC', pr: { xs: 0, sm: 2 } }}>
                  {detail.name}
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#F8FAFC', whiteSpace: 'nowrap' }}>
                  &#8377;{detail.price}
                </Typography>
              </Box>

              {/* Diet chips */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {detail.isVegetarian && <Chip label="Vegetarian" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700 }} />}
                {detail.isVegan && <Chip label="Vegan" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />}
                {detail.isGlutenFree && <Chip label="Gluten-Free" size="small" sx={{ bgcolor: '#fef9c3', color: '#a16207', fontWeight: 700 }} />}
                <Chip label={detail.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: '#CBD5E1', fontWeight: 600, textTransform: 'capitalize' }} />
              </Box>

              {detail.description && (
                <Typography sx={{ color: '#CBD5E1', lineHeight: 1.8, mb: 2, fontSize: '0.9rem' }}>
                  {detail.description}
                </Typography>
              )}

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                {detail.preparationTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>{detail.preparationTime} min</Typography>
                  </Box>
                )}
                {detail.nutrition?.calories && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalIcon sx={{ fontSize: 16, color: '#f97316' }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>{detail.nutrition.calories} kcal</Typography>
                  </Box>
                )}
              </Box>

              {detail.allergens?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
                  <b>Allergens:</b> {detail.allergens.join(', ')}
                </Alert>
              )}

              {/* Nutrition table */}
              {detail.nutrition && Object.values(detail.nutrition).some(Boolean) && (
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', mb: 1.5 }}>
                    Nutrition per serving
                  </Typography>
                  <Grid container spacing={1}>
                    {[['Calories','calories','kcal'],['Protein','protein','g'],['Carbs','carbs','g'],['Fat','fat','g'],['Fiber','fiber','g']].map(([label, key, unit]) =>
                      detail.nutrition[key] ? (
                        <Grid item xs={6} sm={2.4} key={key}>
                          <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'transparent', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#F8FAFC' }}>{detail.nutrition[key]}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>{label}<br />{unit}</Typography>
                          </Paper>
                        </Grid>
                      ) : null
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, bgcolor: '#0B1120' }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CartIcon />}
                onClick={() => openConfirm(detail)}
                sx={{ bgcolor: '#0B1120', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#1E293B' } }}
              >
                Add to Cart
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Confirm Dialog ── */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#0B1120', borderRadius: 4, backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } }}>
        {confirm && (
          <>
            <DialogContent sx={{ pt: 4, textAlign: 'center' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                <CartIcon />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 1, color: '#F8FAFC' }}>
                Add to Cart
              </Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Add <b>{confirm.name}</b> to your cart for &#8377;{confirm.price}?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 4, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                fullWidth variant="contained" onClick={handleConfirm}
                sx={{ bgcolor: '#3B82F6', color: '#fff', borderRadius: 3, py: 1.5, fontSize: '1rem', fontWeight: 700, m: '0 !important', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', '&:hover': { bgcolor: '#2563EB', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.5)' } }}
              >
                Confirm Add
              </Button>
              <Button
                fullWidth variant="outlined" onClick={() => setConfirm(null)}
                sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: 3, py: 1.5, fontSize: '1rem', fontWeight: 600, m: '0 !important', '&:hover': { borderColor: 'rgba(255,255,255,0.25)', color: '#F8FAFC', bgcolor: 'transparent' } }}
              >
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
}

