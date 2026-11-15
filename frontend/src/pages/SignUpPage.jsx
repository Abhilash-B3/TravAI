import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { ROUTES } from '../constants/routes';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Shield, CheckCircle } from 'lucide-react';

export function SignUpPage({ onNavigate }) {
  const { login } = useAuth();
  
  // Required fields per Section 8
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('HOTEL_CHAIN');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('America/New_York');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const organizationTypes = [
    { value: 'HOTEL_CHAIN', label: 'Hotel Chain / Multi-Property Group' },
    { value: 'INDEPENDENT_HOTEL', label: 'Independent Hotel' },
    { value: 'RESORT_SPA', label: 'Resort & Luxury Spa' },
    { value: 'BOUTIQUE', label: 'Boutique Property' },
    { value: 'VACATION_RENTAL', label: 'Vacation Rental / Property Management' },
  ];

  const commonTimezones = [
    { value: 'America/New_York', label: 'Eastern Time (US & Canada) - UTC-5' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada) - UTC-6' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada) - UTC-7' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) - UTC-8' },
    { value: 'Europe/London', label: 'London, Edinburgh - UTC+0' },
    { value: 'Europe/Paris', label: 'Paris, Berlin, Rome - UTC+1' },
    { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi - UTC+4' },
    { value: 'Asia/Singapore', label: 'Singapore, Hong Kong - UTC+8' },
    { value: 'Asia/Tokyo', label: 'Tokyo, Seoul - UTC+9' },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !organizationName.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient('/auth/signup', {
        method: 'POST',
        data: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          organization_name: organizationName.trim(),
          organization_type: organizationType,
          country,
          timezone,
          property_name: `${organizationName.trim()} Primary Property`,
        },
      });

      if (res && res.access_token) {
        localStorage.setItem('nexgile_access_token', res.access_token);
        if (login) {
          // Log into auth context with new credentials
          await login(email.trim().toLowerCase(), password);
        }
        // Direct to progressive 5-step onboarding as required by Section 8 & 10
        onNavigate(ROUTES.ONBOARDING);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2 font-bold text-xl">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Create Enterprise Account</h1>
          <p className="text-sm text-slate-400">Nexgile-TravAI Travel & Hospitality Intelligence Platform</p>
        </div>

        {/* Signup Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          {error && (
            <div className="mb-5">
              <Alert variant="danger">
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* User Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                  autoComplete="name"
                  className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email <span className="text-red-400">*</span>
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  required
                  autoComplete="email"
                  className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-password" block="true" className="text-xs font-semibold text-slate-300 mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    autoComplete="new-password"
                    className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="signup-confirm-password" block="true" className="text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    autoComplete="new-password"
                    className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Organization Details */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div>
                <label htmlFor="signup-org" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Organization Name <span className="text-red-400">*</span>
                </label>
                <Input
                  id="signup-org"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Apex Hospitality Group"
                  required
                  className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-org-type" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Organization Type
                  </label>
                  <select
                    id="signup-org-type"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full h-10 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-100 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {organizationTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="signup-country" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Country
                  </label>
                  <Input
                    id="signup-country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-timezone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Timezone
                </label>
                <select
                  id="signup-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-10 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-100 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {commonTimezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-4 py-2.5 font-medium text-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate(ROUTES.LOGIN)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Trust & Database notice */}
        <div className="text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Real Multi-Tenant Isolation & PostgreSQL Persistence</span>
        </div>
      </div>
    </div>
  );
}
