import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { ROUTES } from '../constants/routes';
import { apiClient } from '../api/client';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await apiClient('/auth/forgot-password', {
        method: 'POST',
        data: { email },
      });
      setSuccessMsg(res?.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Reset Password</h1>
          <p className="text-xs text-slate-400">Cryptographically signed one-time reset token verification</p>
        </div>

        <Card className="border-slate-800 shadow-xl bg-slate-900/90 backdrop-blur">
          <CardHeader>
            <CardTitle>Account Verification</CardTitle>
            <CardDescription>Enter the email associated with your enterprise account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {error && <Alert variant="danger">{error}</Alert>}
            {successMsg && (
              <Alert variant="success" icon={<CheckCircle2 className="w-4 h-4" />}>
                {successMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@acmehotels.com"
                  required
                />
              </div>

              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate(ROUTES.LOGIN)}
                className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
