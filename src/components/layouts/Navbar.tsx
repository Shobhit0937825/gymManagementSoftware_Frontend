import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, QrCode, Shield, LogOut, Settings as SettingsIcon, ChevronDown, Bell, CheckCheck } from 'lucide-react';
import { BranchSwitcher } from './BranchSwitcher';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { setUserRole } from '../../store/slices/authSlice';
import { UserRole } from '../../types';
import api from '../../services/api';

interface NavbarProps {
  onMenuClick: () => void;
  onOpenCheckIn: () => void;
  onLogoutClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  onOpenCheckIn,
  onLogoutClick,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const roles: UserRole[] = ['owner', 'manager', 'trainer', 'frontdesk'];

  // Fetch live notifications
  const fetchNotifications = () => {
    api
      .get('/notifications')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setNotifications(res.data.data);
        }
      })
      .catch((e) => console.warn('Notifications fetch note:', e));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    api.put('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerLogout = () => {
    setIsUserMenuOpen(false);
    onLogoutClick();
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch switcher dropdown */}
        <BranchSwitcher />
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Check-in kiosk trigger */}
        <button
          onClick={onOpenCheckIn}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
          title="Instant Member Check-In"
        >
          <QrCode className="w-4 h-4" />
          <span>Quick Check-In</span>
        </button>

        {/* Role Switcher Pill for Testing Role-based Access */}
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
          <span className="text-[10px] text-slate-400 font-medium hidden md:inline">Role:</span>
          <select
            value={user.role}
            onChange={(e) => dispatch(setUserRole(e.target.value as UserRole))}
            className="bg-transparent text-xs font-semibold text-amber-400 outline-none capitalize cursor-pointer pr-1"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-slate-900 text-white">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Owner & Manager In-App Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse ring-2 ring-slate-900" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 font-semibold transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3.5 text-xs cursor-pointer transition hover:bg-slate-800/50 ${
                        !n.isRead ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-[11px]">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-500 mt-1.5 block">
                        {n.branch?.name || 'Org-wide'} •{' '}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Dropdown Menu */}
        <div className="relative pl-2 border-l border-slate-800" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition group text-left"
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/30 group-hover:ring-amber-400 transition"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 hidden sm:block" />
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/40"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 capitalize border border-amber-500/20">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Account & System Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={triggerLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out of Terminal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sign Out Icon Button */}
        <button
          onClick={triggerLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition hidden sm:flex"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
