import React from 'react';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Hotel, 
  CalendarDays, 
  UserCheck,
  Users,
  Brush,
  Wrench,
  TrendingUp, 
  Network, 
  ShoppingBag, 
  Receipt, 
  Briefcase, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  ActivitySquare,
  Settings,
  FileText,
  X
} from 'lucide-react';

export function Sidebar({ isOpen, onClose, currentPath, onNavigate }) {
  const { user, hasRole, hasPermission } = useAuth();

  const userRoles = user?.roles || [];
  const isSuper = user?.is_superadmin || userRoles.includes('PlatformAdmin') || userRoles.includes('ChainAdmin') || userRoles.includes('PropertyAdmin');

  // Role archetypes
  const isFrontDesk = userRoles.includes('FrontDesk');
  const isHousekeeping = userRoles.includes('Housekeeping');
  const isMaintenance = userRoles.includes('Maintenance');
  const isRevenue = userRoles.includes('RevenueManager');
  const isCorporate = userRoles.includes('CorporateTravelAdmin');
  const isTraveler = userRoles.includes('LeisureTraveler');

  // Section 11: Reorganized Sidebar Navigation
  const navigationGroups = [
    {
      title: 'HOSPITALITY OPERATIONS',
      visible: isSuper || isFrontDesk || isHousekeeping || isMaintenance,
      items: [
        { 
          label: 'Overview', 
          path: ROUTES.DASHBOARD, 
          icon: LayoutDashboard, 
          visible: true, 
          exact: true 
        },
        { 
          label: 'Front Desk', 
          path: ROUTES.FRONT_DESK, 
          icon: UserCheck, 
          visible: isSuper || isFrontDesk 
        },
        { 
          label: 'Reservations', 
          path: ROUTES.RESERVATIONS.ROOT, 
          icon: CalendarDays, 
          visible: isSuper || isFrontDesk || isTraveler 
        },
        { 
          label: 'Rooms', 
          path: ROUTES.PMS.ROOMS, 
          icon: Hotel, 
          visible: isSuper || isFrontDesk || isHousekeeping || isMaintenance 
        },
        { 
          label: 'Housekeeping', 
          path: ROUTES.HOUSEKEEPING, 
          icon: Brush, 
          visible: isSuper || isHousekeeping || isFrontDesk 
        },
        { 
          label: 'Maintenance', 
          path: ROUTES.MAINTENANCE, 
          icon: Wrench, 
          visible: isSuper || isMaintenance 
        },
      ],
    },
    {
      title: 'COMMERCIAL',
      visible: isSuper || isRevenue,
      items: [
        { 
          label: 'Rates & Yield', 
          path: ROUTES.REVENUE.ROOT, 
          icon: TrendingUp, 
          visible: isSuper || isRevenue 
        },
        { 
          label: 'Distribution', 
          path: ROUTES.DISTRIBUTION.ROOT, 
          icon: Network, 
          visible: isSuper || isRevenue 
        },
        { 
          label: 'Marketplace', 
          path: ROUTES.MARKETPLACE.ROOT, 
          icon: ShoppingBag, 
          visible: isSuper 
        },
        { 
          label: 'Folios & Billing', 
          path: ROUTES.FINANCE.ROOT, 
          icon: Receipt, 
          visible: isSuper || isFrontDesk 
        },
      ],
    },
    {
      title: 'GUEST & CORPORATE',
      visible: isSuper || isFrontDesk || isCorporate || isTraveler,
      items: [
        { 
          label: 'Guests', 
          path: ROUTES.GUESTS, 
          icon: Users, 
          visible: isSuper || isFrontDesk 
        },
        { 
          label: 'Concierge', 
          path: ROUTES.CONCIERGE.ROOT, 
          icon: Sparkles, 
          visible: isSuper || isFrontDesk || isTraveler 
        },
        { 
          label: 'Loyalty', 
          path: ROUTES.LOYALTY.ROOT, 
          icon: Award, 
          visible: isSuper || isTraveler 
        },
        { 
          label: 'Corporate', 
          path: ROUTES.CORPORATE.ROOT, 
          icon: Briefcase, 
          visible: isSuper || isCorporate 
        },
      ],
    },
    {
      title: 'ADMINISTRATION',
      visible: isSuper,
      items: [
        { 
          label: 'Users & Roles', 
          path: ROUTES.ADMIN, 
          icon: ShieldCheck, 
          visible: isSuper 
        },
        { 
          label: 'Property Settings', 
          path: ROUTES.PMS.ROOT, 
          icon: Settings, 
          visible: isSuper 
        },
        { 
          label: 'Audit Logs', 
          path: ROUTES.GOVERNANCE.AUDIT, 
          icon: FileText, 
          visible: isSuper 
        },
        { 
          label: 'System Health', 
          path: ROUTES.HEALTH, 
          icon: ActivitySquare, 
          visible: isSuper 
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              N
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm tracking-wide">Nexgile-TravAI</div>
              <div className="text-[10px] text-slate-400">Hospitality Platform</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item Tree */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group) => {
            if (!group.visible) return null;
            const visibleItems = group.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {group.title}
                </div>

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? currentPath === item.path
                      : currentPath === item.path || currentPath.startsWith(item.path + '/');

                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          onNavigate(item.path);
                          if (onClose) onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-[11px] font-bold text-indigo-300">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-200 truncate">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.roles?.[0] || 'Staff'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
