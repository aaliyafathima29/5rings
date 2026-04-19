import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, resetSocket } from '../utils/socket';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      markAllRead: () => {},
      markRead: () => {},
      clearAll: () => {},
      addNotification: () => {},
    };
  }
  return ctx;
};

// Status → notification meta
const ORDER_STATUS_META = {
  confirmed: { title: 'Order Confirmed ✓',      severity: 'success', emoji: '🎉' },
  preparing: { title: 'Being Prepared 🔥',       severity: 'info',    emoji: '🔥' },
  ready:     { title: 'Ready for Pickup 🍽️',     severity: 'success', emoji: '🍽️' },
  delivered: { title: 'Delivered ✅',             severity: 'success', emoji: '✅' },
  cancelled: { title: 'Order Cancelled ❌',       severity: 'error',   emoji: '❌' },
};

// Read user from localStorage safely
const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  // Internal user state — populated from localStorage + auth events
  const [user, setUser] = useState(readUser);
  const socketSetupDone = useRef(false);

  // ── Re-read user when auth changes ─────────────────────────────────────────
  useEffect(() => {
    const handleAuthChange = () => {
      const u = readUser();
      setUser(u);
    };
    // Same-tab auth events (dispatched by Dashboard/Login after user is stored)
    window.addEventListener('5rings:auth', handleAuthChange);
    // Cross-tab auth (e.g., logout in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') handleAuthChange();
    });
    return () => {
      window.removeEventListener('5rings:auth', handleAuthChange);
    };
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: new Date(),
          read: false,
          ...notif,
        },
        ...prev,
      ].slice(0, 100)
    );
  }, []);

  const markAllRead = useCallback(() =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), []);

  const markRead = useCallback((id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))), []);

  const clearAll = useCallback(() => setNotifications([]), []);

  // ── Socket: attach listeners whenever the identified user changes ───────────
  useEffect(() => {
    if (!user) return; // not logged in

    const userId = user.id || user._id;
    const role   = user.role;

    const socket = connectSocket(role, userId);

    const handleNewOrder = (order) => {
      const ref         = `#${String(order._id).slice(-6).toUpperCase()}`;
      const itemSummary = (order.items || []).map((i) => `${i.name} ×${i.quantity}`).join(', ');
      addNotification({
        type:     'new_order',
        title:    `🛎️ New Order ${ref}`,
        message:  `From ${order.user?.name || 'Customer'} — ${itemSummary} · ₹${order.totalAmount?.toFixed(2)}`,
        severity: 'warning',
        emoji:    '🛎️',
        data:     order,
      });
    };

    const handleStatusUpdate = (order) => {
      const ref  = `#${String(order._id).slice(-6).toUpperCase()}`;
      const meta = ORDER_STATUS_META[order.status];
      if (!meta) return;
      const itemSummary = (order.items || []).map((i) => `${i.name} ×${i.quantity}`).join(', ');
      addNotification({
        type:     'order_status',
        title:    meta.title,
        message:  `Order ${ref}: ${itemSummary}`,
        severity: meta.severity,
        emoji:    meta.emoji,
        data:     order,
      });
    };

    if (role === 'kitchen' || role === 'admin' || role === 'vendor') {
      socket.on('new_order', handleNewOrder);
    } else {
      socket.on('order_status_updated', handleStatusUpdate);
    }

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [user, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, clearAll, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
