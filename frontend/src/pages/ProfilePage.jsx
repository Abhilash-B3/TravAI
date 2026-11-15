import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Table } from '../components/ui/Table';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, KeyRound, Monitor, Trash2, CheckCircle2 } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(null);
  const [pwdError, setPwdError] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await apiClient('/auth/sessions');
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await apiClient('/auth/change-password', {
        method: 'POST',
        data: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });
      setPwdSuccess(res?.message || 'Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSessions();
    } catch (err) {
      setPwdError(err.message || 'Failed to rotate password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await apiClient(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
      fetchSessions();
    } catch (err) {
      console.error('Failed to revoke session:', err);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await apiClient('/auth/sessions/revoke-all', { method: 'POST' });
      fetchSessions();
    } catch (err) {
      console.error('Failed to revoke all sessions:', err);
    }
  };

  const sessionColumns = [
    {
      key: 'device',
      label: 'Device / Client',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-slate-400" />
          <div>
            <div className="font-medium text-slate-200">{row.user_agent}</div>
            <div className="text-[11px] text-slate-500 font-mono">IP: {row.ip_address}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'is_current',
      label: 'Status',
      render: (isCurrent) =>
        isCurrent ? (
          <Badge variant="success" dot>Current Device</Badge>
        ) : (
          <Badge variant="default">Active Secondary</Badge>
        ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) =>
        row.is_current ? (
          <span className="text-xs text-slate-500 italic">This Device</span>
        ) : (
          <Button
            variant="danger"
            size="xs"
            onClick={() => handleRevokeSession(row.id)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Revoke
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          User Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage identity credentials, cryptographic session keys, and tenant authorization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <Card className="md:col-span-1 border-slate-800">
          <CardHeader>
            <CardTitle>Identity Information</CardTitle>
            <CardDescription>Active user account and RBAC profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="w-16 h-16 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 flex items-center justify-center font-bold text-xl mx-auto">
              {user?.first_name?.[0] || 'U'}
              {user?.last_name?.[0] || 'A'}
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-100 text-sm">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</div>
              <div className="mt-2 flex justify-center gap-1.5 flex-wrap">
                {user?.roles?.map((r) => (
                  <Badge key={r} variant="primary">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-slate-400">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Tenant</span>
                <span className="font-mono text-indigo-400">{user?.active_organization_id ? 'Scoped' : 'Unscoped'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Mode</span>
                <Badge variant="success" size="xs">PostgreSQL RLS</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="md:col-span-2 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Rotate Account Password
            </CardTitle>
            <CardDescription>
              Enforces enterprise complexity: minimum 10 characters, automatic secondary session invalidation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {pwdSuccess && (
              <Alert variant="success" icon={<CheckCircle2 className="w-4 h-4" />}>
                {pwdSuccess}
              </Alert>
            )}
            {pwdError && <Alert variant="danger">{pwdError}</Alert>}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 10 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" loading={pwdLoading}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions Management */}
      <Card className="border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              Active Sessions & Device Grants
            </CardTitle>
            <CardDescription>
              Authoritative list of cryptographically signed JWT sessions currently registered in the database
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button variant="danger" size="sm" onClick={handleRevokeAll}>
              Revoke All Other Devices
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-2">
          <Table
            columns={sessionColumns}
            data={sessions}
            loading={loadingSessions}
            emptyTitle="No active sessions found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
