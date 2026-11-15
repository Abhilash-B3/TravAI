import React from 'react';
import { Check } from 'lucide-react';

/**
 * Design System: Accessible Checkbox
 */
export function Checkbox({
  id,
  checked = false,
  onChange,
  disabled = false,
  label = null,
  description = null,
  className = '',
  name,
}) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-start gap-3 cursor-pointer select-none group ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`w-4 h-4 rounded border transition-colors flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900 ${
            checked
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'
          }`}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col text-sm">
          {label && <span className="font-medium text-slate-200 text-xs md:text-sm">{label}</span>}
          {description && <span className="text-slate-400 text-xs">{description}</span>}
        </div>
      )}
    </label>
  );
}
