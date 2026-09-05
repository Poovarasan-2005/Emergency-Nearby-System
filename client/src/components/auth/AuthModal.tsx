import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldAlert, ArrowRight, ShieldCheck, KeyRound, Phone } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../contexts/AuthContext';
import { UserRole } from '../../types/emergency.types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  initialRole = 'USER',
  onClose,
  onSuccess,
}) => {
  const { login, register, isLoading, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [adminKey, setAdminKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setFormError(null);
      if (initialRole === 'ADMIN' && initialMode === 'login' && !email) {
        setEmail('admin@emergency.system');
      }
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate admin key if creating admin account
    if (mode === 'register' && role === 'ADMIN') {
      if (adminKey.trim() && adminKey.trim().toUpperCase() !== 'ADMIN2026' && adminKey.trim().toUpperCase() !== 'CAD911') {
        setFormError('Invalid Admin Passkey. Use demo key: ADMIN2026');
        return;
      }
    }

    if (mode === 'login') {
      const res = await login(email, password, role);
      if (res.success) {
        onSuccess?.(role);
        onClose();
      }
    } else {
      const res = await register(name, email, password, phone, role);
      if (res.success) {
        onSuccess?.(role);
        onClose();
      }
    }
  };

  const handleQuickDemoLogin = async (asRole: UserRole) => {
    setFormError(null);
    if (asRole === 'ADMIN') {
      await login('dispatcher.miller@emergency.system', 'admin123', 'ADMIN');
    } else {
      await login('sarah.connor@example.com', 'user123', 'USER');
    }
    onSuccess?.(asRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 border ${
            role === 'ADMIN' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }">
            {role === 'ADMIN' ? <ShieldCheck className="w-3 h-3 text-indigo-400" /> : <User className="w-3 h-3 text-rose-400" />}
            <span>{role === 'ADMIN' ? 'Admin & CAD Dispatch Portal' : 'Citizen Assistance Portal'}</span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            {mode === 'login'
              ? role === 'ADMIN'
                ? 'Admin / Dispatcher Sign In'
                : 'Welcome Back'
              : role === 'ADMIN'
              ? 'Register Admin Account'
              : 'Create Citizen Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Enter credentials to securely authenticate and access the system.'
              : 'Register your device for instant emergency response coordination.'}
          </p>
        </div>

        {(error || formError) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Role selector tab for both login and register */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Access Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  role === 'USER'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Citizen User</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  role === 'ADMIN'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin / EOC</span>
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor / Dispatcher Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder={role === 'ADMIN' ? 'admin@emergency.system' : 'citizen@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Emergency Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {mode === 'register' && role === 'ADMIN' && (
            <div>
              <label className="text-xs font-bold text-indigo-300 block mb-1">
                Admin Authorization Passkey <span className="text-slate-400 font-normal">(Demo: ADMIN2026)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ADMIN2026"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-indigo-700 text-xs text-indigo-200 placeholder-indigo-500/50 focus:outline-none focus:border-indigo-400"
                />
                <KeyRound className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 mt-2 ${
              role === 'ADMIN'
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
            }`}
          >
            <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In & Access Website' : 'Create Account & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access shortcuts */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block text-center mb-2">
            One-Click Instant Access:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('USER')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5"
            >
              <span>Instant Citizen</span>
              <span className="text-[10px] font-normal text-slate-400">Standard Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5"
            >
              <span>Instant Admin</span>
              <span className="text-[10px] font-normal text-indigo-400">EOC CAD Monitor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
