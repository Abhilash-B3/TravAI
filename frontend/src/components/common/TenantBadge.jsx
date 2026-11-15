import React from 'react';
import { useTenant } from '../../hooks/useTenant';
import { Badge } from '../ui/Badge';
import { Building2, Hotel, ShieldCheck } from 'lucide-react';

export function TenantBadge() {
  const { organization, property, scopeType } = useTenant();

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-medium text-slate-200">{organization?.name || 'Global Organization'}</span>
      </div>

      {property && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-500/20 text-indigo-300">
          <Hotel className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold">{property.name}</span>
        </div>
      )}

      <Badge variant="info" className="hidden sm:inline-flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        RLS ACTIVE
      </Badge>
    </div>
  );
}
