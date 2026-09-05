import React from 'react';
import {
  AlertCircle,
  MapPin,
  Users,
  History,
  UserCheck,
  Shield,
  Wifi,
  WifiOff,
  Sparkles,
  LogOut,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import { useEmergency } from '../../contexts/EmergencyContext';
import { UserRole } from '../../types/emergency.types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAI: () => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAI, onOpenAuth }) => {
  const { user, logout, isAdmin, switchDemoRole } = useAuth();
  const { isOnline } = useOffline();
  const { status, startSosCountdown } = useEmergency();

  const handleSignOut = async () => {
    await logout();
    setCurrentTab('landing');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
              Emergency Nearby
            </span>
            <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase block">
              Response System
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Home Link */}
          <button
            type="button"
            onClick={() => setCurrentTab('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'landing'
                ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Home</span>
          </button>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: Compass },
            { id: 'map', label: 'Interactive Map', icon: MapPin },
            ...(user
              ? [
                  { id: 'contacts', label: 'Trusted Contacts', icon: Users },
                  { id: 'history', label: 'Emergency History', icon: History },
                  { id: 'profile', label: 'Emergency Profile', icon: UserCheck },
                ]
              : []),
          ].map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 shadow-md shadow-indigo-900/30'
                  : 'text-indigo-400 hover:text-white hover:bg-indigo-950/40'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin EOC</span>
            </button>
          )}
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2">
          {/* Online / Offline status badge */}
          <div
            title={isOnline ? 'System Online' : 'Offline: Operating on Cached Data'}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'LIVE' : 'OFFLINE'}</span>
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Assist</span>
          </button>

          {/* Quick SOS Trigger in Header */}
          <button
            onClick={() => startSosCountdown('unknown')}
            disabled={status === 'countdown' || status === 'active'}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-rose-600/40 active:scale-95 transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            <span>SOS</span>
          </button>

          {/* User Account / Role Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="flex items-center gap-1.5 text-xs text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block">
                    <span className="font-bold text-white block text-xs truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] block -mt-0.5 font-bold ${
                      isAdmin ? 'text-indigo-400' : 'text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Role Switcher Demo Dropdown */}
                <select
                  value={user.role}
                  onChange={(e) => switchDemoRole(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 rounded-lg px-1.5 py-1 focus:outline-none hidden md:block"
                  title="Switch Demo Role"
                >
                  <option value="USER">Citizen</option>
                  <option value="ADMIN">Admin EOC</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>

                <button
                  onClick={handleSignOut}
                  title="Sign Out (Return to Home)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Exit</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login', 'USER')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('login', 'ADMIN')}
                  className="hidden sm:block px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 hover:text-white rounded-xl text-xs font-bold border border-indigo-700/60 transition-all"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
