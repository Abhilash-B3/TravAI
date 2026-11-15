import React from 'react';

/**
 * Design System: Accessible Textarea Component
 */
export function Textarea({
  id,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  disabled = false,
  readOnly = false,
  required = false,
  maxLength = null,
  error = null,
  className = '',
  ...props
}) {
  const hasError = Boolean(error);
  const errorId = id && hasError ? `${id}-error` : undefined;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full space-y-1">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`w-full bg-slate-900 border rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed resize-y ${
          hasError
            ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-700/80 hover:border-slate-600'
        } ${className}`}
        {...props}
      />
      {maxLength && (
        <div className="text-right text-[11px] text-slate-500 font-mono">
          {currentLength} / {maxLength}
        </div>
      )}
    </div>
  );
}
