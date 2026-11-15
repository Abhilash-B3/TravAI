import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';
import { useNotification } from '../../store/notificationContext';
import { TenantBadge } from './TenantBadge';
import { NotificationDrawer } from './NotificationDrawer';
import { SearchDialog } from './SearchDialog';
import { SEED_PERSONAS } from '../../store/authContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { 
  UserCheck, 
  Shield, 
  Search, 
  Bell, 
  Hotel, 
  Palette, 
  LogOut, 
  User as UserIcon,
  Layers,
  ChevronDown
} from 'lucide-react';

/**
 * Design System: Application Shell Header
 * Integrates tenant context switcher, real global search, real notifications drawer, and persona evaluation.
 */
export function Header({ onToggleSidebar, onNavigate }) {
  const { user, switchPersona, switchContext, logout, properties } = useAuth();
  const { organization, property } = useTenant();
  const { unreadCount } = useNotification();

  const [switching, setSwitching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePersonaChange = async (email) => {
    setSwitching(true);
    try {
      await switchPersona(email);
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const handlePropertyChange = async (propId) => {
    if (!organization) return;
    try {
      await switchContext(organization.id, propId || null);
    } catch (e) {
      alert(`Scope authorization denied: ${e.message}`);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left Section: Mobile Menu + Tenant Scope Badge */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <TenantBadge />

          {/* Dynamic Property Scope Selector if multiple properties exist */}
          {properties && properties.length > 1 && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs bg-slate-800/80 border border-slate-700/60 rounded-md px-2 py-1">
              <Hotel className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span className="text-slate-400 font-medium">Scope:</span>
              <select
                value={property?.id || ''}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                aria-label="Select active property scope"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center: Global Search Trigger Button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs transition-colors shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
              <span>Search properties, orgs, users, audits...</span>
            </div>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Mobile Search + Notifications + Design System + Persona + Health */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden focus:outline-none"
            aria-label="Open search dialog"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Real Notification Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </button>

          {/* Design System Showroom Link */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/design-system')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
              title="Design System & UI Component Showroom"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Design System</span>
            </button>
          )}

          {/* Active Persona / Role Switcher for Architectural Evaluation */}
          <div className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/60 rounded-lg p-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400 ml-1.5 hidden sm:inline" />
            <span className="text-slate-400 hidden lg:inline font-medium">Persona:</span>
            <select
              value={user?.email || ''}
              onChange={(e) => handlePersonaChange(e.target.value)}
              disabled={switching}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
              aria-label="Switch active persona"
            >
              {SEED_PERSONAS.map((p) => (
                <option key={p.id} value={p.email}>
                  {p.name} ({p.roleCode})
                </option>
              ))}
            </select>
          </div>

          {/* System Health Quick Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>RLS Active</span>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={async () => {
              await logout();
              if (onNavigate) onNavigate('/login');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-colors"
            title="Sign Out of Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Global Authoritative Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}
