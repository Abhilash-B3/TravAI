import React from 'react';

/**
 * Design System: Accessible Text/Number/Password Input
 */
export function Input({
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  disabled = false,
  readOnly = false,
  required = false,
  error = null,
  prefixIcon = null,
  suffixIcon = null,
  className = '',
  autoComplete,
  ...props
}) {
  const hasError = Boolean(error);
  const errorId = id && hasError ? `${id}-error` : undefined;

  return (
    <div className="relative flex items-center w-full">
      {prefixIcon && (
        <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
          {prefixIcon}
        </div>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`w-full bg-slate-900 border rounded-lg text-sm text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed ${
          prefixIcon ? 'pl-9' : 'pl-3.5'
        } ${suffixIcon ? 'pr-9' : 'pr-3.5'} py-2 min-h-[40px] ${
          hasError
            ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-700/80 hover:border-slate-600'
        } ${className}`}
        {...props}
      />

      {suffixIcon && (
        <div className="absolute right-3 flex items-center text-slate-400">
          {suffixIcon}
        </div>
      )}
    </div>
  );
}
