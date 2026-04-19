import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import sportTheme from './theme/sportTheme';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import PageLoader from './components/shared/PageLoader';

// 5Rings Public Pages
import Index from './components/5rings/pages/Home';
import About from './components/5rings/pages/About';
import Services from './components/5rings/pages/Services';
import Sports from './components/5rings/pages/Sports';
import Gallery from './components/5rings/pages/Gallery';
import Contact from './components/5rings/pages/Contact';
import Products from './components/5rings/pages/Products';
import Wishlist from './components/5rings/pages/Wishlist';
import Events from './components/5rings/pages/Events';
import BookingConfirmation from './components/5rings/pages/BookingConfirmation';
import Workshops from './components/5rings/pages/Workshops';
import Food from './components/5rings/pages/Food';
import Cart from './components/5rings/pages/Cart';
import Search from './components/5rings/pages/Search';
import NotFound from './components/5rings/pages/NotFound';

// Auth & Dashboard Pages
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import VerifyOTP from './components/Login/VerifyOTP';
import ForgotPassword from './components/Login/ForgotPassword';
import ResetPassword from './components/Login/ResetPassword';
import Dashboard from './components/Login/Dashboard';
import AdminSetup from './components/Admin/AdminSetup';
import CreateSpecialUser from './components/Admin/CreateSpecialUser';
import ProtectedRoute from './components/Login/ProtectedRoute';

// Staff roles that should land on dashboard outside the homepage.
const SPECIAL_ROLES = ['admin', 'event_organizer', 'vendor', 'kitchen', 'coach', 'delivery'];

/**
 * PublicRoute — wraps public pages.
 * Homepage (/) is visible to everyone.
 * For other public pages, authenticated staff users are redirected to /dashboard.
 */
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (pathname !== '/' && user && SPECIAL_ROLES.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * GuestRoute — wraps /login and /register.
 * Already-authenticated users are redirected to /dashboard.
 * Shows a spinner while the initial /me check is in progress so we never
 * flash the login form only to immediately redirect.
 */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader message="Loading..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

/**
 * RouteErrorBoundary — resets whenever the pathname changes so that
 * navigating away from a crashed page clears the error state.
 */
const RouteErrorBoundary = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKeys={[pathname]}>
      {children}
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ThemeProvider theme={sportTheme}>
      <CssBaseline />
      {/* Top-level ErrorBoundary — last resort for anything outside Router */}
      <ErrorBoundary>
        {/* NotificationProvider wraps everything so ANY page can add to the bell */}
        <NotificationProvider>
          <CartProvider>
            <AuthProvider>
              <Router>
                <Routes>
              {/* ── Public 5Rings Pages ──────────────────────────────────────── */}
              {/* Homepage is always public; staff are redirected on other public pages */}
              <Route path="/"         element={<RouteErrorBoundary><PublicRoute><Index /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/about"    element={<RouteErrorBoundary><PublicRoute><About /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/services" element={<RouteErrorBoundary><PublicRoute><Services /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/sports"   element={<RouteErrorBoundary><PublicRoute><Sports /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/products" element={<RouteErrorBoundary><PublicRoute><Products /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/wishlist" element={<RouteErrorBoundary><PublicRoute><Wishlist /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/events"   element={<RouteErrorBoundary><PublicRoute><Events /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/events/booking-confirmation"   element={<RouteErrorBoundary><PublicRoute><BookingConfirmation /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/workshops"   element={<RouteErrorBoundary><PublicRoute><Workshops /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/food"     element={<RouteErrorBoundary><PublicRoute><Food /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/cart"     element={<RouteErrorBoundary><PublicRoute><Cart /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/search"   element={<RouteErrorBoundary><PublicRoute><Search /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/gallery"  element={<RouteErrorBoundary><PublicRoute><Gallery /></PublicRoute></RouteErrorBoundary>} />
              <Route path="/contact"  element={<RouteErrorBoundary><PublicRoute><Contact /></PublicRoute></RouteErrorBoundary>} />

              {/* ── Auth Routes (redirect if already logged in) ──────────────── */}
              <Route path="/login"           element={<RouteErrorBoundary><GuestRoute><Login /></GuestRoute></RouteErrorBoundary>} />
              <Route path="/register"        element={<RouteErrorBoundary><GuestRoute><Register /></GuestRoute></RouteErrorBoundary>} />
              <Route path="/verify-otp"      element={<RouteErrorBoundary><GuestRoute><VerifyOTP /></GuestRoute></RouteErrorBoundary>} />
              <Route path="/forgot-password" element={<RouteErrorBoundary><GuestRoute><ForgotPassword /></GuestRoute></RouteErrorBoundary>} />
              <Route path="/reset-password"  element={<RouteErrorBoundary><GuestRoute><ResetPassword /></GuestRoute></RouteErrorBoundary>} />

              {/* Admin-only setup routes */}
              <Route
                path="/admin-setup"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminSetup />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />
              <Route
                path="/admin/create-user"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CreateSpecialUser />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />

              {/* ── Protected Dashboard Routes ───────────────────────────────── */}
              {/* Generic /dashboard — any authenticated user */}
              <Route
                path="/dashboard"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />

              {/* Role-specific dashboard routes */}
              <Route
                path="/dashboard/admin"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />
              <Route
                path="/dashboard/coach"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['coach']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />
              <Route
                path="/dashboard/vendor"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />
              <Route
                path="/dashboard/kitchen"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['kitchen']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />
              <Route
                path="/dashboard/delivery"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['delivery']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />
              <Route
                path="/dashboard/event-organizer"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['event_organizer']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />

              {/* Legacy vendor/products route */}
              <Route
                path="/vendor/products"
                element={
                  <RouteErrorBoundary>
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </RouteErrorBoundary>
                }
              />

              {/* ── 404 ─────────────────────────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </AuthProvider>
          </CartProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
