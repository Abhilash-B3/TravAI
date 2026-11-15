import React from 'react';

/**
 * Design System: Accessible Shimmer Skeleton Loader
 */
export function LoadingSkeleton({
  lines = 3,
  className = '',
  height = 'h-4',
  rounded = 'rounded-md',
}) {
  return (
    <div role="status" aria-label="Loading content..." className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`${height} ${rounded} bg-slate-800/80 ${
            idx === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'
          }`}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading card..."
      className={`p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 animate-pulse ${className}`}
    >
      <div className="h-5 bg-slate-800 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-800/70 rounded w-full" />
        <div className="h-3.5 bg-slate-800/70 rounded w-5/6" />
      </div>
      <div className="h-9 bg-slate-800/50 rounded w-1/4 pt-2" />
      <span className="sr-only">Loading card...</span>
    </div>
  );
}
