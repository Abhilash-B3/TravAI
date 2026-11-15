import React from 'react';
import { Database, Inbox } from 'lucide-react';

/**
 * Design System: Genuine Zero-Mock Empty State Component
 * Explicitly signals authentic database status without fabricated dummy records.
 */
export function EmptyState({
  title = 'No records found',
  description = 'No matching data exists in the database for the active scope.',
  action = null,
  icon = null,
  className = '',
  id,
}) {
  const IconComponent = icon || Inbox;

  return (
    <div
      id={id}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : (
          <IconComponent className="w-6 h-6" aria-hidden="true" />
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-200 mb-1.5">{title}</h3>
      <p className="text-xs md:text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
