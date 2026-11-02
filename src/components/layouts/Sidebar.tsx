import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  Fingerprint,
  MessageSquare,
  Building2,
  Settings,
  Flame,
  LogOut,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppStore';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogoutClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogoutClick }) => {
  const { organization } = useAppSelector((state) => state.branch);
  const { user } = useAppSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Plans & Pricing', href: '/plans', icon: Dumbbell },
    { name: 'Payments & Due', href: '/payments', icon: CreditCard },
    { name: 'Punch-In & Attendance', href: '/attendance', icon: Fingerprint },
    { name: 'WhatsApp & Messages', href: '/messages', icon: MessageSquare },
    { name: 'Branches', href: '/branches', icon: Building2 },
    { name: 'Settings & Hardware', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    if (onClose) onClose();
    onLogoutClick();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Flame className="w-5 h-5 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              IRON<span className="text-amber-400">PULSE</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
              {organization.name}
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Core Modules
          </div>

          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              end={item.href === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Live System Status card & Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Biometric Sync
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Machine Online & Active</p>
          </div>

          {/* User Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              {user.role}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
