import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../shared/PageLoader';

/**
 * ProtectedRoute
 *
 * Props:
 *   children     – the component to render when access is granted
 *   allowedRoles – optional string[] of roles that may access this route.
 *                  If omitted, any authenticated user is allowed.
 *                  If the authenticated user's role is not in the list they
 *                  are redirected back to /dashboard.
 *
 * Auth state comes from AuthContext which verifies the HttpOnly cookie
 * session on app boot — no localStorage token required.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait for the initial /me check before making any redirect decisions
  if (loading) return <PageLoader message="Checking session..." />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Authenticated but wrong role — send to generic dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
