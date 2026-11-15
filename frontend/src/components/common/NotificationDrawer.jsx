import React, { useState } from 'react';
import { useNotification } from '../../store/notificationContext';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Bell, CheckCircle2, Shield, AlertTriangle, Info, PlusCircle, Check } from 'lucide-react';

/**
 * Design System & Core UX: Authoritative Notification Drawer
 * Displays real persisted notifications from PostgreSQL with authentic delivery lifecycle states.
 */
export function NotificationDrawer({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    fetchNotifications,
  } = useNotification();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [dispatchTitle, setDispatchTitle] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchCategory, setDispatchCategory] = useState('SECURITY');
  const [dispatchPriority, setDispatchPriority] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);

  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => n.status !== 'READ')
      : notifications;

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchTitle.trim() || !dispatchMessage.trim()) return;

    setSubmitting(true);
    try {
      await createNotification({
        title: dispatchTitle.trim(),
        message: dispatchMessage.trim(),
        category: dispatchCategory,
        priority: dispatchPriority,
      });
      setDispatchTitle('');
      setDispatchMessage('');
      setShowDispatchForm(false);
    } catch (err) {
      alert(`Failed to dispatch notification: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'SECURITY':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'PMS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-indigo-400" />
          <span>Notifications & Event Stream</span>
          {unreadCount > 0 && (
            <Badge variant="primary" size="xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      }
      subtitle="Authoritative PostgreSQL audit notifications and system events"
      width="md"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button
            size="xs"
            variant="outline"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setShowDispatchForm((prev) => !prev)}
          >
            {showDispatchForm ? 'Cancel Dispatch' : 'Dispatch Test Event'}
          </Button>

          <Button
            size="xs"
            variant="secondary"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Mark all read
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'unread'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchNotifications()}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Live Dispatch Form */}
        {showDispatchForm && (
          <form
            onSubmit={handleDispatch}
            className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-3"
          >
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Dispatch Authoritative Notification to PostgreSQL
            </div>

            <FormField label="Event Title" required>
              <Input
                value={dispatchTitle}
                onChange={(e) => setDispatchTitle(e.target.value)}
                placeholder="e.g., Security Audit Probe"
                required
              />
            </FormField>

            <FormField label="Event Message" required>
              <Input
                value={dispatchMessage}
                onChange={(e) => setDispatchMessage(e.target.value)}
                placeholder="e.g., Cross-tenant isolation verification logged."
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Category">
                <Select
                  value={dispatchCategory}
                  onChange={(e) => setDispatchCategory(e.target.value)}
                  options={[
                    { label: 'SECURITY', value: 'SECURITY' },
                    { label: 'SYSTEM', value: 'SYSTEM' },
                    { label: 'TENANCY', value: 'TENANCY' },
                    { label: 'PMS', value: 'PMS' },
                    { label: 'ALERT', value: 'ALERT' },
                  ]}
                />
              </FormField>

              <FormField label="Priority">
                <Select
                  value={dispatchPriority}
                  onChange={(e) => setDispatchPriority(e.target.value)}
                  options={[
                    { label: 'NORMAL', value: 'NORMAL' },
                    { label: 'HIGH', value: 'HIGH' },
                    { label: 'URGENT', value: 'URGENT' },
                    { label: 'LOW', value: 'LOW' },
                  ]}
                />
              </FormField>
            </div>

            <Button type="submit" size="xs" variant="primary" loading={submitting} className="w-full">
              Commit & Dispatch into Database
            </Button>
          </form>
        )}

        {/* Notifications List */}
        {displayedNotifications.length > 0 ? (
          <div className="space-y-2.5">
            {displayedNotifications.map((n) => {
              const isUnread = n.status !== 'READ';

              return (
                <div
                  key={n.id}
                  onClick={() => isUnread && markAsRead(n.id)}
                  className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                    isUnread
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(n.category)}
                      <span className="font-semibold text-xs text-slate-100">{n.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTimestamp(n.created_at)}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500" title="Unread" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-6">{n.message}</p>

                  <div className="flex items-center gap-2 mt-2.5 pl-6">
                    <Badge
                      size="xs"
                      variant={
                        n.category === 'SECURITY'
                          ? 'primary'
                          : n.category === 'ALERT'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {n.category}
                    </Badge>

                    <Badge
                      size="xs"
                      variant={
                        n.priority === 'URGENT'
                          ? 'danger'
                          : n.priority === 'HIGH'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {n.priority}
                    </Badge>

                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      STATUS: {n.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No notifications"
            description={
              filter === 'unread'
                ? 'All operational and security notifications have been read.'
                : 'No notification records currently exist in the database.'
            }
            icon={Bell}
          />
        )}
      </div>
    </Drawer>
  );
}
