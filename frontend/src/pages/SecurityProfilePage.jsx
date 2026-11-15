import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTenant } from '../hooks/useTenant';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiClient } from '../api/client';
import {
  Shield,
  KeyRound,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  UserCheck,
  Building,
  Hotel,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

export function SecurityProfilePage() {
  const {
    user,
    sessions,
    revokeSession,
    revokeAllSessions,
    changePassword,
    activeOrg,
    activeProperty,
    refreshProfile,
    loading,
  } = useAuth();

  // Password change state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Security Probe Sandbox State
  const [probeResult, setProbeResult] = useState(null);
  const [probing, setProbing] = useState(false);

  // Password Policy Checks
  const hasLength = newPwd.length >= 12 && newPwd.length <= 72;
  const hasUpper = /[A-Z]/.test(newPwd);
  const hasLower = /[a-z]/.test(newPwd);
  const hasDigit = /[0-9]/.test(newPwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPwd);
  const isPasswordValid = hasLength && hasUpper && hasLower && hasDigit && hasSpecial;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    setPwdError(null);

    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (!isPasswordValid) {
      setPwdError('Password does not meet enterprise security requirements.');
      return;
    }

    setPwdSubmitting(true);
    try {
      await changePassword(currentPwd, newPwd);
      setPwdMsg('Password updated successfully. All other active sessions have been revoked.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      refreshProfile();
    } catch (err) {
      setPwdError(err.message || 'Failed to update password');
    } finally {
      setPwdSubmitting(false);
    }
  };

  // Run a live Cross-Tenant Security Probe
  const runSecurityProbe = async (targetType) => {
    setProbing(true);
    setProbeResult(null);
    try {
      let headers = {};
      let desc = '';

      if (targetType === 'authorized_property') {
        // Grand Resort & Spa
        headers['X-Organization-ID'] = '11111111-1111-1111-1111-111111111111';
        headers['X-Property-ID'] = '22222222-2222-2222-2222-222222222222';
        desc = 'Authorized Grand Resort & Spa property scope';
      } else if (targetType === 'cross_tenant_property') {
        // Attempting to access Zenith Lodge under Acme Group
        headers['X-Organization-ID'] = '11111111-1111-1111-1111-111111111111';
        headers['X-Property-ID'] = '55555555-5555-5555-5555-555555555555'; // Belongs to Zenith, not Acme!
        desc = 'Cross-tenant probe: Requesting property 55555555 (Zenith) with Acme organization';
      } else if (targetType === 'forged_unauthorized_org') {
        // Attempting to access Zenith Corporation directly
        headers['X-Organization-ID'] = '33333333-3333-3333-3333-333333333333';
        desc = 'Forged organization header: Requesting Zenith Luxury Hotels directly';
      }

      const res = await apiClient('/api/v1/tenancy/context', {
        headers,
      });

      setProbeResult({
        success: true,
        type: targetType,
        description: desc,
        status: 200,
        data: res,
      });
    } catch (err) {
      setProbeResult({
        success: false,
        type: targetType,
        description: targetType,
        status: err.status,
        code: err.code,
        message: err.message,
      });
    } finally {
      setProbing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-indigo-400" />
          Security, Authentication & Scoped RBAC
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographic session rotation, PostgreSQL Row-Level Security (RLS) enforcement, and fine-grained authorization audit.
        </p>
      </div>

      {/* Grid: Identity Profile & Active Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Authenticated Identity
            </h2>
            <Badge variant={user?.account_status === 'ACTIVE' ? 'success' : 'warning'}>
              {user?.account_status || 'ACTIVE'}
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Email Address</span>
              <span className="font-mono text-slate-200 text-sm">{user?.email || 'Loading...'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">User Subject ID (UUID)</span>
              <span className="font-mono text-slate-300 text-[11px] select-all">{user?.id || '—'}</span>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-slate-400">Superadmin Governance:</span>
              <Badge variant={user?.is_superadmin ? 'danger' : 'neutral'}>
                {user?.is_superadmin ? 'PLATFORM SUPERADMIN' : 'SCOPED OPERATOR'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Current Active Tenant Scope */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Transaction Scope
            </h2>
            <Badge variant="info">SET LOCAL ACTIVE</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Active Organization</span>
              <span className="font-semibold text-slate-200">{activeOrg?.name || 'Acme Hospitality Group'}</span>
              <span className="font-mono text-[10px] text-slate-500 block mt-0.5 select-all">
                {activeOrg?.id || '11111111-1111-1111-1111-111111111111'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Active Property Scope</span>
              <span className="font-semibold text-indigo-300">{activeProperty?.name || 'All Properties (Org-Wide)'}</span>
              {activeProperty && (
                <span className="font-mono text-[10px] text-slate-500 block mt-0.5 select-all">
                  {activeProperty.id} ({activeProperty.timezone})
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-slate-800 text-slate-400">
              Database isolation level enforced via PostgreSQL RLS on every connection checkout.
            </div>
          </div>
        </Card>

        {/* Canonical Password Policy Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              Password Cryptography
            </h2>
            <Badge variant="primary">Bcrypt 12 Rounds</Badge>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Algorithm: Canonical Bcrypt (Cost 12)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Length: 12 to 72 bytes (No truncation flaw)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero plaintext logging or credential storage</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Token Replay & Session Hijack Detection</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Role Assignments & Fine-Grained Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoped Role Assignments */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Active Role Assignments ({user?.role_assignments?.length || 0})
          </h2>
          <div className="space-y-3">
            {user?.role_assignments && user.role_assignments.length > 0 ? (
              user.role_assignments.map((ra) => (
                <div key={ra.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block text-sm">{ra.role_code}</span>
                    <span className="text-slate-400 block mt-0.5">
                      Scope: <strong className="text-indigo-300">{ra.scope_type}</strong>
                      {ra.property_name && ` — Property: ${ra.property_name}`}
                      {ra.organization_name && ` (${ra.organization_name})`}
                    </span>
                  </div>
                  <Badge variant={ra.scope_type === 'PLATFORM' ? 'danger' : 'primary'}>
                    {ra.scope_type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
                Primary role assigned: <strong className="text-slate-200">{user?.roles?.join(', ')}</strong>
              </div>
            )}
          </div>
        </Card>

        {/* Fine-Grained Permissions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Granted Permissions ({user?.permissions?.length || 0})
            </h2>
            <Badge variant="neutral">Domain:Resource:Action</Badge>
          </div>
          <div className="max-h-64 overflow-y-auto pr-2 flex flex-wrap gap-1.5">
            {user?.permissions && user.permissions.length > 0 ? (
              user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="font-mono text-[11px] px-2 py-1 bg-slate-900 border border-slate-700/60 rounded text-indigo-300"
                >
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No permissions available.</span>
            )}
          </div>
        </Card>
      </div>

      {/* Active Device Sessions & Security Invalidation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-400" />
              Active Tracked Sessions ({sessions?.length || 0})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sessions are cryptographically bound to rotation tokens. Invalidation terminates stale or suspect devices instantly.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={revokeAllSessions}>
            Revoke All Other Sessions
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Session UUID</th>
                <th className="py-2.5 px-3">Device / User Agent</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3">Expires</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              {sessions && sessions.length > 0 ? (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/30">
                    <td className="py-2.5 px-3 font-sans">
                      {s.is_current ? (
                        <Badge variant="success">Current Device</Badge>
                      ) : (
                        <Badge variant="neutral">Active Device</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] select-all">
                      {s.id.slice(0, 8)}...{s.id.slice(-4)}
                    </td>
                    <td className="py-2.5 px-3 font-sans truncate max-w-xs text-slate-300">
                      {s.user_agent || 'Standard Web Browser'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{s.ip_address || '127.0.0.1'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(s.created_at).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(s.expires_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      {!s.is_current && (
                        <button
                          onClick={() => revokeSession(s.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950/40"
                          title="Revoke session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-slate-500 font-sans">
                    No active sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Live Security Probe & Multi-Tenant Boundary Validator */}
      <Card className="p-6 border-indigo-500/20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mb-4">
          <Badge variant="primary" className="mb-2">AUTHORITATIVE SECURITY CORRECTION VALIDATION</Badge>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Live Scoped RBAC & Tenant Isolation Probe
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Verify Stage 4's authoritative rule: Browser-provided tenant headers are <em>requested contexts</em> only.
            The server strictly validates against the user's role assignments before applying PostgreSQL transaction-scoped RLS.
            Test that forged or cross-tenant headers are rejected with HTTP 403 Forbidden without data leakage.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={probing}
            onClick={() => runSecurityProbe('authorized_property')}
          >
            Probe 1: Authorized Scope (Grand Resort & Spa)
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={probing}
            onClick={() => runSecurityProbe('cross_tenant_property')}
          >
            Probe 2: Cross-Tenant Property (Attempting Zenith Lodge via Acme)
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={probing}
            onClick={() => runSecurityProbe('forged_unauthorized_org')}
          >
            Probe 3: Forged Header (Zenith Corp Direct Access)
          </Button>
        </div>

        {probeResult && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between font-sans">
              <span className="font-bold text-slate-200">Probe Execution Result:</span>
              <Badge variant={probeResult.success ? 'success' : 'danger'}>
                HTTP {probeResult.status} {probeResult.success ? 'AUTHORIZED' : 'FORBIDDEN (BLOCKED)'}
              </Badge>
            </div>
            <p className="text-slate-400 font-sans">{probeResult.description}</p>
            <pre className="p-3 bg-slate-900 rounded text-slate-300 overflow-x-auto text-[11px]">
              {JSON.stringify(probeResult, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      {/* Change Password Policy Form */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          Update Password
        </h2>

        {pwdMsg && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
            {pwdMsg}
          </div>
        )}

        {pwdError && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs text-rose-300">
            {pwdError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">New Password (Min 12 Characters)</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••••••"
            />
          </div>

          {/* Real-Time Enterprise Strength Checklist */}
          {newPwd.length > 0 && (
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>At least 12 characters (max 72 bytes)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasUpper ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>At least one uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasLower ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>At least one lowercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasDigit ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>At least one numeric digit</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasSpecial ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>At least one special character (!@#$%^&*...)</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••••••"
            />
          </div>

          <Button type="submit" variant="primary" disabled={pwdSubmitting || !isPasswordValid}>
            {pwdSubmitting ? 'Updating...' : 'Update Password & Invalidate Other Sessions'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
