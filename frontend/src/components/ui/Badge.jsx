import React from 'react';

/**
 * Design System: Accessible Badge Component
 * Non-wrapping pill with semantic high-contrast color tokens and optional dot indicator.
 */
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  id,
}) {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/80',
    primary: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
    info: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-500/40',
    outline: 'bg-transparent text-slate-400 border-slate-600',
  }[variant] || 'bg-slate-800 text-slate-300 border-slate-700/80';

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-indigo-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-cyan-400',
    purple: 'bg-purple-400',
    outline: 'bg-slate-400',
  }[variant] || 'bg-slate-400';

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
  }[size] || 'px-2.5 py-0.5 text-xs gap-1.5';

  return (
    <span
      id={id}
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap select-none leading-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}

