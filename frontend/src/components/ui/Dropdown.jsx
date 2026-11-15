import React, { useState, useRef, useEffect } from 'react';

/**
 * Design System: Accessible Dropdown / Menu
 */
export function Dropdown({
  trigger,
  children,
  align = 'right',
  className = '',
  id = 'dropdown-menu',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignClasses =
    align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {isOpen && (
        <div
          id={id}
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${alignClasses} mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 focus:outline-none divide-y divide-slate-800/60`}
        >
          {typeof children === 'function' ? children({ close: () => setIsOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon = null,
  destructive = false,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors focus:outline-none ${
        disabled
          ? 'opacity-40 cursor-not-allowed text-slate-500'
          : destructive
          ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      } ${className}`}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0" aria-hidden="true">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}
