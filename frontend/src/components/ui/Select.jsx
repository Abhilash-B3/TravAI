import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Design System: Accessible Native Select Component
 */
export function Select({
  id,
  value,
  onChange,
  options = [],
  children,
  disabled = false,
  required = false,
  error = null,
  placeholder = null,
  className = '',
  ...props
}) {
  const hasError = Boolean(error);
  const errorId = id && hasError ? `${id}-error` : undefined;

  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`w-full appearance-none bg-slate-900 border rounded-lg pl-3.5 pr-10 py-2 min-h-[40px] text-sm text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed ${
          hasError
            ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-700/80 hover:border-slate-600'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="text-slate-500">
            {placeholder}
          </option>
        )}
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
