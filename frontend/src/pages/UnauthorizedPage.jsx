import React from 'react';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../constants/routes';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-100">Access Denied</h1>
      <p className="text-xs text-slate-400 max-w-md mt-2 mb-6">
        Your active role and assigned scope lack the necessary permissions to access this resource.
      </p>
      <Button variant="secondary" size="sm" onClick={() => onNavigate(ROUTES.DASHBOARD)}>
        Return to Platform Dashboard
      </Button>
    </div>
  );
}
