import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

/**
 * Design System: Accessible Alert Component
 * Strictly complies with WCAG AA contrast, semantics, and ARIA roles.
 */
export function Alert({
  children,
  variant = 'info',
  title = null,
  onDismiss = null,
  className = '',
  id,
}) {
  const configs = {
    info: {
      container: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200',
      icon: Info,
      iconColor: 'text-cyan-400',
      titleColor: 'text-cyan-100',
    },
    success: {
      container: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-100',
    },
    warning: {
      container: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-100',
    },
    error: {
      container: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
      icon: XCircle,
      iconColor: 'text-rose-400',
      titleColor: 'text-rose-100',
    },
  }[variant] || {
    container: 'bg-slate-800/80 border-slate-700 text-slate-200',
    icon: Info,
    iconColor: 'text-slate-400',
    titleColor: 'text-slate-100',
  };

  const IconComponent = configs.icon;

  return (
    <div
      id={id}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={`rounded-lg border p-4 flex items-start gap-3 text-sm leading-relaxed ${configs.container} ${className}`}
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${configs.iconColor}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <h4 className={`font-semibold text-sm mb-1 ${configs.titleColor}`}>{title}</h4>}
        <div className="text-xs md:text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors p-1 -m-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
