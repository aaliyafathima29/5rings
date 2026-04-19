import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  alpha,
  Tooltip,
  Zoom,
  TextField,
  InputAdornment,
  Collapse,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import { useCart } from '../../../context/CartContext';
import { useNotifications } from '../../../context/NotificationContext';
import { authAPI } from '../../../utils/api';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getCartCount } = useCart();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const checkLoginStatus = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userStr));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDashboard = () => {
    handleUserMenuClose();
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    try { await authAPI.logout(); } catch { /* best-effort */ }
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:logout'));
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'About', path: '/about' },
    { text: 'Sports', path: '/sports' },
    { text: 'Events', path: '/events' },
    { text: 'Workshops', path: '/workshops' },
    { text: 'Food', path: '/food' },
    { text: 'Services', path: '/services' },
    { text: 'Gallery', path: '/gallery' },
    { text: 'Contact', path: '/contact' }
  ];

  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: '#0B1120', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/5rings.jpg"
            alt="5Rings"
            sx={{
              height: 40,
              width: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', letterSpacing: 0.5 }}>5RINGS</Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ px: 2, py: 3 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            onClick={handleDrawerToggle}
              sx={{
                color: location.pathname === item.path ? '#F8FAFC' : '#94A3B8',
                bgcolor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderRadius: 2,
                mb: 0.5,
                borderLeft: location.pathname === item.path ? '3px solid #3b82f6' : '3px solid transparent',
                '&:hover': {
                  bgcolor: alpha('#3b82f6', 0.1),
                  color: '#fff',
                },
                transition: 'all 0.2s ease'
              }}
          >
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 700 : 500 }} />
          </ListItem>
        ))}
      </List>
      {isLoggedIn && (
        <Box sx={{ px: 2, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Button
            fullWidth
            startIcon={<DashboardIcon />}
            onClick={() => { handleDrawerToggle(); navigate('/dashboard'); }}
            sx={{ color: 'text.primary', justifyContent: 'flex-start', mb: 1, textTransform: 'none', fontWeight: 500 }}
          >
            Dashboard
          </Button>
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={() => { handleDrawerToggle(); handleLogout(); }}
            sx={{ color: '#d32f2f', justifyContent: 'flex-start', textTransform: 'none', fontWeight: 500 }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(10, 15, 28, 0.92)' : 'rgba(10, 15, 28, 0.65)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scrolled ? '0 10px 36px rgba(0, 0, 0, 0.28)' : '0 6px 22px rgba(0, 0, 0, 0.18)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, rgba(15,23,42,0) 0%, rgba(59,130,246,0.8) 50%, rgba(15,23,42,0) 100%)',
            zIndex: 1,
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              px: { xs: 0, sm: 1 },
              minHeight: { xs: 64, md: 72 },
              gap: 2
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                mr: 'auto',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                component="img"
                src="/5rings.jpg"
                alt="5Rings"
                sx={{
                  height: { xs: 45, md: 50 },
                  width: { xs: 45, md: 50 },
                  borderRadius: '50%',
                  objectFit: 'cover',
                  mr: 1.5,
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  color: '#F8FAFC',
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  fontSize: '1.45rem',
                  fontFamily: 'Outfit, sans-serif'
                }}
              >
                5RINGS
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: location.pathname === item.path ? '#F8FAFC' : '#94A3B8',
                      textTransform: 'none',
                      fontSize: '0.92rem',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      px: 2,
                      py: 0.85,
                      borderRadius: 999,
                      bgcolor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 5,
                        left: '50%',
                        transform: `translateX(-50%) scaleX(${location.pathname === item.path ? 1 : 0})`,
                        width: '60%',
                        height: 2,
                        bgcolor: 'text.primary',
                        transition: 'transform 0.25s ease',
                        borderRadius: 2
                      },
                      '&:hover': {
                        bgcolor: alpha('#3b82f6', 0.06),
                        color: 'text.primary',
                        '&::after': {
                          transform: 'translateX(-50%) scaleX(1)'
                        }
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 3 }}>
              {/* Search Toggle */}
              <Tooltip title="Search" TransitionComponent={Zoom}>
                <IconButton
                  onClick={handleSearchToggle}
                  sx={{ 
                    color: 'text.primary',
                    '&:hover': { 
                      bgcolor: alpha('#fff', 0.04),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>

              {/* Wishlist */}
              {isLoggedIn && (
                <Tooltip title="Wishlist" TransitionComponent={Zoom}>
                  <IconButton
                    component={RouterLink}
                    to="/wishlist"
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': { 
                        bgcolor: alpha('#fff', 0.04),
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Badge badgeContent={0} sx={{ '& .MuiBadge-badge': { bgcolor: '#e91e63', color: '#fff', fontWeight: 600 } }}>
                      <FavoriteIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* Cart */}
              <Tooltip title="Shopping Cart" TransitionComponent={Zoom}>
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  sx={{ 
                    color: 'text.primary',
                    '&:hover': { 
                      bgcolor: alpha('#fff', 0.04),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Badge badgeContent={getCartCount()} sx={{ '& .MuiBadge-badge': { bgcolor: 'text.primary', color: '#fff', fontWeight: 600 } }}>
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              {isLoggedIn && (
                <>
                  <Tooltip title="Notifications" TransitionComponent={Zoom}>
                    <IconButton
                      onClick={(e) => { handleNotificationOpen(e); markAllRead(); }}
                      sx={{ 
                        color: 'text.primary',
                        '&:hover': { 
                          bgcolor: alpha('#fff', 0.04),
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Badge badgeContent={unreadCount > 0 ? unreadCount : null} sx={{ '& .MuiBadge-badge': { bgcolor: '#f44336', color: '#fff', fontWeight: 600 } }}>
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  
                  <Menu
                    anchorEl={notificationAnchor}
                    open={Boolean(notificationAnchor)}
                    onClose={handleNotificationClose}
                    PaperProps={{
                      sx: {
                        bgcolor: '#0B1120',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                        borderRadius: 3,
                        mt: 2,
                        minWidth: 320,
                        maxHeight: 450,
                        overflowY: 'auto',
                        backgroundImage: 'none'
                      }
                    }}
                  >
                    <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>Notifications</Typography>
                      {unreadCount > 0 && (
                        <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={markAllRead}>
                          Mark all read
                        </Typography>
                      )}
                    </Box>
                    {notifications.length === 0 ? (
                      <MenuItem disabled sx={{ py: 3, justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
                      </MenuItem>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <MenuItem key={n.id} onClick={() => { markRead(n.id); handleNotificationClose(); }} sx={{ 
                          py: 1.5, 
                          px: 2.5, 
                          flexDirection: 'column', 
                          alignItems: 'flex-start',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          bgcolor: !n.read ? alpha('#2196f3', 0.05) : 'transparent',
                          '&:hover': { bgcolor: alpha('#fff', 0.04) }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 0.3, gap: 1 }}>
                            <Typography variant="body2" sx={{ flex: 1, fontWeight: !n.read ? 700 : 400, lineHeight: 1.4 }}>
                              {n.emoji && <span style={{ marginRight: 4 }}>{n.emoji}</span>}
                              {n.title}
                            </Typography>
                            {!n.read && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2196f3', flexShrink: 0, mt: 0.5 }} />
                            )}
                          </Box>
                          {n.message && (
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3 }}>
                              {n.message}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.disabled">
                            {timeAgo(n.timestamp)}
                          </Typography>
                        </MenuItem>
                      ))
                    )}
                  </Menu>
                </>
              )}

              {isLoggedIn ? (
                <>
                  <Tooltip title={user?.name || "User Menu"} TransitionComponent={Zoom}>
                    <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: 'primary.main', 
                        color: '#fff', 
                        fontWeight: 700,
                        border: '2px solid',
                        borderColor: 'rgba(26, 26, 26, 0.1)',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          borderColor: 'primary.main'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      sx: {
                        bgcolor: '#0f172a',
                        color: '#F8FAFC',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                        borderRadius: 3,
                        mt: 2,
                        minWidth: 260,
                        overflow: 'visible',
                        backgroundImage: 'none',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '2px',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0
                        }
                      }
                    }}
                  >
                    <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'text.primary', mr: 2 }}>
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={700}>{user?.name}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {user?.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Chip
                          icon={<PersonIcon sx={{ fontSize: 16 }} />}
                          label={user?.role?.toUpperCase() || 'USER'}
                          size="small"
                          sx={{
                            bgcolor: alpha('#fff', 0.1),
                            color: 'text.primary',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <MenuItem onClick={handleDashboard} sx={{ py: 1.5, px: 3, '&:hover': { bgcolor: alpha('#fff', 0.04) } }}>
                      <DashboardIcon sx={{ mr: 2, fontSize: 20, color: 'text.primary' }} />
                      <Typography variant="body2" fontWeight={500}>Dashboard</Typography>
                    </MenuItem>
                    
                    <MenuItem onClick={handleUserMenuClose} component={RouterLink} to="/profile" sx={{ py: 1.5, px: 3, '&:hover': { bgcolor: alpha('#fff', 0.04) } }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 20, color: 'text.primary' }} />
                      <Typography variant="body2" fontWeight={500}>Profile Settings</Typography>
                    </MenuItem>
                    
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 3, color: '#d32f2f', '&:hover': { bgcolor: alpha('#d32f2f', 0.04) } }}>
                      <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={500}>Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  startIcon={<AccountCircleIcon />}
                  sx={{
                    bgcolor: 'text.primary',
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': { 
                      bgcolor: '#2a2a2a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-2px)'
                    },
                    display: { xs: 'none', sm: 'flex' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Login
                </Button>
              )}

              {isMobile && (
                <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary', ml: 1 }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'background.paper',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Search Overlay */}
      <Collapse in={searchOpen}>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          bgcolor: 'rgba(11, 17, 32, 0.95)',
          backdropFilter: 'blur(30px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <IconButton onClick={handleSearchToggle} sx={{ position: 'absolute', top: 30, right: 30, color: 'white' }}>
            <CloseIcon sx={{ fontSize: 32 }} />
          </IconButton>
          <Container maxWidth="md">
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                autoFocus
                placeholder="Search for sports, events, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearchToggle} size="small">
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Popular searches:
              </Typography>
              {['Football', 'Cricket', 'Tennis', 'Events', 'Equipment'].map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearchSubmit({ preventDefault: () => {} });
                  }}
                  sx={{
                    bgcolor: alpha('#fff', 0.05),
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.1)
                    },
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Box>
          </Container>
        </Box>
      </Collapse>
    </>
  );
};

export default Navbar;
