import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Bell, Plus, RefreshCw, CheckCircle, Mail, MessageSquare, Smartphone, CheckCheck } from 'lucide-react';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Form states
  const [recipient, setRecipient] = useState('guest@acmehotels.com');
  const [channel, setChannel] = useState('EMAIL');
  const [title, setTitle] = useState('Pre-Arrival Check-in Confirmation');
  const [body, setBody] = useState('Your reservation at Grand Resort Miami is ready. Check-in starts at 3:00 PM.');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient('/notifications/mark-read', { method: 'POST' });
      setActionSuccess('All notifications marked as READ in delivery log.');
      fetchNotifications();
    } catch (err) {
      setActionError(err.message || 'Failed to mark read');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient('/notifications/send', {
        method: 'POST',
        data: {
          recipient,
          channel,
          title,
          body,
        },
      });
      setActionSuccess('Notification queued and lifecycle status updated to SENT.');
      setIsSendModalOpen(false);
      fetchNotifications();
    } catch (err) {
      setActionError(err.message || 'Failed to dispatch notification');
    }
  };

  const getChannelIcon = (ch) => {
    switch (ch) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-indigo-400" />;
      case 'SMS':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getLifecycleBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success" dot>Delivered</Badge>;
      case 'SENT':
        return <Badge variant="primary" dot>Sent</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning" dot>Processing</Badge>;
      case 'FAILED':
        return <Badge variant="danger" dot>Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Notification Title & Body',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
            {getChannelIcon(row.channel)}
            <span>{val}</span>
            {!row.is_read && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="Unread" />
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{row.body}</div>
        </div>
      ),
    },
    {
      key: 'recipient',
      label: 'Recipient',
      render: (r) => <span className="font-mono text-xs text-slate-300">{r}</span>,
    },
    {
      key: 'status',
      label: 'Delivery Lifecycle',
      render: (st) => getLifecycleBadge(st),
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (ts) => <span className="font-mono text-xs text-slate-400">{new Date(ts).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Omnichannel Notification Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative delivery lifecycles (Rule 14: PENDING → PROCESSING → SENT → DELIVERED)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark All Read
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSendModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Dispatch Notification
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Notifications Table */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Delivery Lifecycle Ledger</CardTitle>
            <CardDescription>Transactional transmission records across Email, SMS, and In-App push</CardDescription>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {notifications.length} Total Transmissions
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <Table
            columns={columns}
            data={notifications}
            loading={loading}
            emptyTitle="No notifications recorded"
          />
        </CardContent>
      </Card>

      {/* Dispatch Modal */}
      {isSendModalOpen && (
        <Modal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          title="Dispatch Omnichannel Notification"
          subtitle="Sends real transactional communication with state tracking"
        >
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="EMAIL">Email (SendGrid/SMTP)</option>
                  <option value="SMS">SMS (Twilio)</option>
                  <option value="PUSH">In-App Notification Center</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Address / Phone</label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="name@email.com or +1555..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notification Subject / Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
              <Input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Message payload..."
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsSendModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Queue & Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
