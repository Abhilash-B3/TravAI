import React from 'react';

/**
 * Design System: Accessible Button Component
 * Strictly conforms to typography, contrast, touch targets, and ARIA standards.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  id,
  ariaLabel,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap';

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 min-h-[28px]',
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
    lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[44px]',
  }[size] || 'px-4 py-2 text-sm gap-2 min-h-[40px]';

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white focus-visible:ring-indigo-500 shadow-sm shadow-indigo-900/30',
    secondary:
      'bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-100 border border-slate-700/80 focus-visible:ring-slate-500',
    outline:
      'bg-transparent border border-slate-600 hover:bg-slate-800 active:bg-slate-750 text-slate-200 focus-visible:ring-slate-400',
    ghost:
      'bg-transparent hover:bg-slate-800/80 active:bg-slate-800 text-slate-300 hover:text-white focus-visible:ring-slate-500',
    danger:
      'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white focus-visible:ring-rose-500 shadow-sm shadow-rose-900/30',
    success:
      'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white focus-visible:ring-emerald-500 shadow-sm shadow-emerald-900/30',
  }[variant] || 'bg-indigo-600 text-white';

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
}

