import React from 'react';

/**
 * Design System: Accessible FormField Layout
 * Ties label, input slot, helper description, and live error message together.
 */
export function FormField({
  id,
  label,
  required = false,
  error = null,
  helperText = null,
  children,
  className = '',
}) {
  const errorId = id ? `${id}-error` : undefined;
  const helperId = id ? `${id}-helper` : undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 select-none"
        >
          {label}
          {required && <span className="text-rose-400 ml-1 font-bold" aria-hidden="true">*</span>}
        </label>
      )}

      <div>{children}</div>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-slate-400">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" aria-live="polite" className="text-xs text-rose-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
