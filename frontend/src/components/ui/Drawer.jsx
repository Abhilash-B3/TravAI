import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Design System: Accessible Slide-over Drawer
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle = null,
  children,
  footer = null,
  position = 'right',
  width = 'md',
  closeOnBackdrop = true,
  id = 'drawer-panel',
}) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    full: 'max-w-full',
  }[width] || 'max-w-md';

  const positionClasses =
    position === 'left' ? 'left-0' : 'right-0';

  return (
    <div role="presentation" className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      <div className={`fixed inset-y-0 ${positionClasses} flex max-w-full`}>
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          aria-describedby={subtitle ? `${id}-desc` : undefined}
          className={`w-screen ${widthClasses} bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4">
            <div>
              <h3 id={`${id}-title`} className="text-base font-semibold text-slate-100">
                {title}
              </h3>
              {subtitle && (
                <p id={`${id}-desc`} className="text-xs text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
