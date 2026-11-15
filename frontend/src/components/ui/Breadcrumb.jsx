import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Design System: Accessible Breadcrumb Navigation
 */
export function Breadcrumb({ items = [], onNavigate = null, className = '', id }) {
  if (!items || items.length === 0) return null;

  return (
    <nav id={id} aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-400 ${className}`}>
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/')}
            className="inline-flex items-center text-slate-400 hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 mx-1 flex-shrink-0" aria-hidden="true" />
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-slate-200 select-none"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate && item.path && onNavigate(item.path)}
                  className="hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
