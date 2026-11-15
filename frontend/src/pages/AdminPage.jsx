import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { apiClient } from '../api/client';
import { Shield, Users, History, RefreshCw, CheckCircle, Lock, ShieldAlert } from 'lucide-react';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit'
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('PropertyAdmin');

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usrList, logs] = await Promise.all([
        apiClient('/admin/users'),
        apiClient('/admin/audit-logs'),
      ]);
      setUsers(Array.isArray(usrList) ? usrList : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionError(null);
    try {
      await apiClient(`/admin/users/${selectedUser.id}/roles`, {
        method: 'PATCH',
        data: { role: selectedRole },
      });
      setActionSuccess(`Role for ${selectedUser.first_name} updated to ${selectedRole}.`);
      setSelectedUser(null);
      fetchAdminData();
    } catch (err) {
      setActionError(err.message || 'Failed to update user role');
    }
  };

  const userColumns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-slate-100">{row.first_name} {row.last_name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Assigned RBAC Roles',
      render: (roles) => (
        <div className="flex gap-1 flex-wrap">
          {roles?.map((r) => (
            <Badge key={r} variant="primary" size="xs">
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (act) => (act ? <Badge variant="success" dot>Active</Badge> : <Badge variant="danger">Suspended</Badge>),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (d) => <span className="text-xs text-slate-400 font-mono">{new Date(d).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      label: 'Permissions',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="xs"
          onClick={() => {
            setSelectedUser(row);
            setSelectedRole(row.roles?.[0] || 'PropertyAdmin');
          }}
          leftIcon={<Lock className="w-3 h-3" />}
        >
          Assign Role
        </Button>
      ),
    },
  ];

  const auditColumns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (val) => <span className="font-mono text-xs text-slate-400">{new Date(val).toLocaleString()}</span>,
    },
    {
      key: 'action',
      label: 'Action Event',
      render: (act) => (
        <span className="font-mono font-semibold text-xs text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/30">
          {act}
        </span>
      ),
    },
    {
      key: 'entity',
      label: 'Target Entity',
      render: (val) => <span className="text-xs text-slate-300 font-mono">{val}</span>,
    },
    {
      key: 'actor',
      label: 'Actor / User',
      render: (val) => <span className="text-xs text-slate-200">{val}</span>,
    },
    {
      key: 'ip_address',
      label: 'Source IP',
      render: (ip) => <span className="font-mono text-[11px] text-slate-500">{ip}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Tenant Administration & Compliance Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise RBAC user permissions, security access policies, and immutable system audit trails
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant={activeTab === 'users' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('users')}
            leftIcon={<Users className="w-3.5 h-3.5" />}
          >
            Staff Directory
          </Button>
          <Button
            variant={activeTab === 'audit' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('audit')}
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            Audit Trail ({auditLogs.length})
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle>Enterprise User Directory</CardTitle>
            <CardDescription>PostgreSQL users mapped to organizational tenant roles</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table
              columns={userColumns}
              data={users}
              loading={loading}
              emptyTitle="No users found"
            />
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle>Immutable System Audit Trail</CardTitle>
            <CardDescription>
              Chronological log of critical mutations, logins, rate adjustments, and financial transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table
              columns={auditColumns}
              data={auditLogs}
              loading={loading}
              emptyTitle="No audit records logged"
            />
          </CardContent>
        </Card>
      )}

      {/* Assign Role Modal */}
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={`Update Role: ${selectedUser.first_name} ${selectedUser.last_name}`}
          subtitle={`Current Email: ${selectedUser.email}`}
        >
          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Role Level</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ChainAdmin">ChainAdmin (Multi-property organizational control)</option>
                <option value="PropertyAdmin">PropertyAdmin (General Manager, full property control)</option>
                <option value="FrontDesk">FrontDesk (Check-in/out, bookings, keys, folios)</option>
                <option value="Housekeeper">Housekeeper (Turnover, task completion)</option>
                <option value="FinanceAdmin">FinanceAdmin (Folios, payments, invoices)</option>
                <option value="PlatformAdmin">PlatformAdmin (Global Superadmin)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save RBAC Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
