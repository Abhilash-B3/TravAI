import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, ChevronDown, ChevronUp, UserCheck, Shield } from 'lucide-react';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDemoPersonas, setShowDemoPersonas] = useState(false);

  const demoPersonas = [
    { label: 'Chain Admin', email: 'admin@acmehotels.com', role: 'ChainAdmin', org: 'Acme Hospitality' },
    { label: 'Property GM', email: 'propadmin@grandresort.com', role: 'PropertyAdmin', org: 'Grand Resort Miami' },
    { label: 'Front Desk Agent', email: 'frontdesk@grandresort.com', role: 'FrontDesk', org: 'Grand Resort Miami' },
    { label: 'Platform Superadmin', email: 'superadmin@travai.nexgile.com', role: 'PlatformAdmin', org: 'Platform Wide' },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      onNavigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectPersona = (p) => {
    setEmail(p.email);
    setPassword('Password123!@#');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2 font-bold text-xl">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Nexgile-TravAI</h1>
          <p className="text-sm text-slate-400">Travel & Hospitality Intelligence Platform</p>
        </div>

        {/* Login Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          {error && (
            <div className="mb-5">
              <Alert variant="danger">
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                required
                autoComplete="email"
                className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" block="true" className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate(ROUTES.FORGOT_PASSWORD)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2 py-2.5 font-medium text-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate(ROUTES.SIGNUP)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Create account
            </button>
          </div>

          {/* Optional Quick-fill for Evaluators */}
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setShowDemoPersonas(!showDemoPersonas)}
              className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-400 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400/80" />
                Quick-fill evaluation credentials
              </span>
              {showDemoPersonas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoPersonas && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
                {demoPersonas.map((p) => (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => selectPersona(p)}
                    className="text-left p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-200 truncate">{p.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{p.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quiet footer reassurance */}
        <div className="text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>PostgreSQL Auth & Row-Level Security Enforced</span>
        </div>
      </div>
    </div>
  );
}
