import React from 'react';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../constants/routes';

export function NotFoundPage({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl font-mono font-bold text-indigo-400 mb-2">404</div>
      <h1 className="text-lg font-bold text-slate-100">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">
        The requested endpoint or view does not exist in the active domain registry.
      </p>
      <Button variant="secondary" size="sm" onClick={() => onNavigate(ROUTES.DASHBOARD)}>
        Return to Platform Dashboard
      </Button>
    </div>
  );
}
