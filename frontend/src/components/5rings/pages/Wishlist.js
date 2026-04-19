import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Layout from '../components/Layout.js';
import { useCart } from '../../../context/CartContext';
import { foodAPI, SERVER_BASE } from '../../../utils/api';

const Wishlist = () => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    const ids = saved ? JSON.parse(saved) : [];
    setWishlistIds(Array.isArray(ids) ? ids : []);
  }, []);

  useEffect(() => {
    const loadWishlistItems = async () => {
      if (!wishlistIds.length) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      try {
        const response = await foodAPI.getAllMenuItems();
        const all = response.data?.menuItems || [];
        const wished = all.filter((item) => wishlistIds.includes(item._id));
        setMenuItems(wished);
      } catch (error) {
        console.error('Failed to load wishlist items:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistItems();
  }, [wishlistIds]);

  const removeFromWishlist = (itemId) => {
    const updated = wishlistIds.filter((id) => id !== itemId);
    setWishlistIds(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setMenuItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  const getImageSrc = (item) => {
    const src = item.images?.[0];
    if (!src) return null;
    return src.startsWith('http') ? src : `${SERVER_BASE}${src}`;
  };

  return (
    <Layout>
      <Box sx={{ pt: { xs: 10, md: 12 }, minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#F8FAFC', mb: 1.5 }}>
              My Wishlist
            </Typography>
            <Typography sx={{ color: '#94A3B8' }}>
              Saved food items you may want to order later.
            </Typography>
          </Box>

          {loading ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <Typography sx={{ color: '#64748B' }}>Loading wishlist...</Typography>
            </Paper>
          ) : menuItems.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <FavoriteIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Your wishlist is empty
              </Typography>
              <Typography sx={{ color: '#64748B', mb: 2.5 }}>
                Browse food and tap the heart icon to save items.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/food')}>
                Explore Food
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {menuItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Card sx={{ height: '100%', borderRadius: 3 }}>
                    {getImageSrc(item) && (
                      <CardMedia
                        component="img"
                        height="220"
                        image={getImageSrc(item)}
                        alt={item.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ color: '#64748B', minHeight: 42 }}>
                        {item.description || 'No description available'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                        <Typography sx={{ fontWeight: 800 }}>Rs {Number(item.price || 0).toLocaleString()}</Typography>
                        {item.category && <Chip label={item.category} size="small" />}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => addToCart({
                          id: item._id,
                          name: item.name,
                          price: item.price,
                          image: item.images?.[0] || null,
                          vendorId: item.vendor?._id,
                          vendorName: item.vendor?.name,
                          type: 'food',
                        })}
                      >
                        Add to Cart
                      </Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => removeFromWishlist(item._id)}>
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default Wishlist;
