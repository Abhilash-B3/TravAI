import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  // Transient toast messages
  const [toasts, setToasts] = useState([]);
  
  // Real persisted notifications from backend PostgreSQL / API
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real notifications from API
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setLoading(true);
    try {
      const res = await apiClient('/api/v1/notifications', {
        params: { unread_only: unreadOnly },
      });
      if (res) {
        setNotifications(res.items || []);
        setUnreadCount(res.unread_count || 0);
      }
      setError(null);
    } catch (err) {
      console.warn('Failed to load notifications from API:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on boot
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark specific notification as read in database
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, status: 'READ', read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
      throw err;
    }
  }, []);

  // Mark all unread notifications as read in database
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient('/api/v1/notifications/mark-all-read', {
        method: 'POST',
      });
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'READ', read_at: n.read_at || now }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err.message);
      throw err;
    }
  }, []);

  // Create and dispatch genuine notification to backend API
  const createNotification = useCallback(async ({ title, message, category = 'SYSTEM', priority = 'NORMAL' }) => {
    try {
      const res = await apiClient('/api/v1/notifications', {
        method: 'POST',
        data: { title, message, category, priority },
      });
      if (res) {
        setNotifications((prev) => [res, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
      return res;
    } catch (err) {
      console.error('Failed to create notification:', err.message);
      throw err;
    }
  }, []);

  // Transient Toast Management
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    toasts,
    addToast,
    removeToast,
    toastSuccess: (msg) => addToast(msg, 'success'),
    toastError: (msg) => addToast(msg, 'error'),
    toastInfo: (msg) => addToast(msg, 'info'),
    toastWarning: (msg) => addToast(msg, 'warning'),
    notify: {
      success: (msg) => addToast(msg, 'success'),
      error: (msg) => addToast(msg, 'error'),
      info: (msg) => addToast(msg, 'info'),
      warning: (msg) => addToast(msg, 'warning'),
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Render Viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-xl border text-xs md:text-sm flex items-center justify-between gap-3 transition-all duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-200'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white ml-2 flex-shrink-0"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

