import React from 'react';
import {
  AlertCircle,
  Shield,
  MapPin,
  Share2,
  Users,
  Sparkles,
  PhoneCall,
  Clock,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';

import { UserRole } from '../types/emergency.types';

interface LandingPageProps {
  onFindHelp: () => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onFindHelp, onOpenAuth }) => {
  const { startSosCountdown } = useEmergency();

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-black tracking-wider uppercase mb-6 shadow-inner animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Production-Grade Emergency Assistance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Emergency Nearby System
          </h1>

          <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
            Find nearby emergency assistance when every second matters. Rapid dispatch, live facility triage, and secure incident management.
          </p>

          {/* Primary Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-6">
            <button
              onClick={onFindHelp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base transition-all shadow-xl shadow-blue-900/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Explore Facilities</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => startSosCountdown('unknown')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-base transition-all shadow-xl shadow-rose-900/50 active:scale-95 flex items-center justify-center gap-2 border border-rose-400/30"
            >
              <AlertCircle className="w-5 h-5 animate-pulse" />
              <span>Activate SOS</span>
            </button>
          </div>

          {/* Dedicated Login & Access Portal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto mb-8 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <button
              onClick={() => onOpenAuth('login', 'USER')}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider">Citizen Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs font-bold text-white">Sign In as User</p>
              <p className="text-[11px] text-slate-400">Trusted contacts, medical profile & SOS history</p>
            </button>

            <button
              onClick={() => onOpenAuth('login', 'ADMIN')}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">Dispatcher / CAD</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs font-bold text-white">Sign In as Admin</p>
              <p className="text-[11px] text-slate-400">Emergency operations center & live telemetry</p>
            </button>
          </div>

          {/* Registration link */}
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-400">
            <span>Don't have an account yet?</span>
            <button
              onClick={() => onOpenAuth('register', 'USER')}
              className="text-rose-400 hover:text-rose-300 font-bold underline"
            >
              Register New User
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenAuth('register', 'ADMIN')}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline"
            >
              Register Admin
            </button>
          </div>
        </div>
      </section>

      {/* Mandatory Emergency Disclaimer */}
      <section className="px-4 py-3 bg-red-950/40 border-y border-red-900/40">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-xs sm:text-sm text-red-200 text-center font-medium">
          <Shield className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            <strong>Official Safety Disclaimer:</strong> This platform is an assistance and discovery tool. In a life-threatening emergency, contact your local emergency services (911 / 112 / 999) immediately.
          </span>
        </div>
      </section>

      {/* Key Feature Pillars */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Engineered for High-Pressure Critical Moments
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Prioritizing SPEED → CLARITY → SAFETY → ACTION to ensure zero delays when urgent assistance is required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5 border border-rose-500/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Nearby Emergency Services
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pinpoint verified Level-1 trauma centers, emergency rooms, pharmacies, police precincts, and fire rescue battalions with accurate travel times and open/closed operational status.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-rose-400 flex items-center gap-1">
              <span>Google Places & OSM Integration</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-5 border border-red-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                One-Tap Emergency SOS
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Activate immediate emergency assistance with a protected countdown to prevent accidental triggers. Simultaneously records high-accuracy GPS and alerts your inner trusted circle.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-red-400 flex items-center gap-1">
              <span>Cancellable 5s Safety Window</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 border border-sky-500/20">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Live Location Sharing
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate temporary, cryptographically unpredictable live tracking links with automatic expiration (e.g. 20 mins) and one-tap revocation. Never creates permanent public location records.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-sky-400 flex items-center gap-1">
              <span>Cryptographic TTL Tokens</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Smart Recommendation Score
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Intelligent multi-factor ranking engine evaluating category affinity, distance decay, 24/7 operating status, and facility tier to surface the best option first.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Multi-Factor Algorithmic Scoring</span>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Trusted Contacts Network
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Configure primary and secondary emergency contacts (parents, partner, doctor). Instant notification simulation with pre-populated SMS coordinates and test alert triggers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Automated SOS SMS Dispatch</span>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Secure User & Medical Profile
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Private, voluntary emergency medical profile (blood type, allergies, medications). Strict role-based authorization and Firestore rules preventing unauthorized enumeration.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <span>Private Encryption & RBAC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Call Quick Bar */}
      <section className="py-12 px-4 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-500" />
            Global Emergency Dispatch Shortcuts
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Directly connect your phone dialer to official government emergency services:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <a
              href="tel:911"
              className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition-all"
            >
              🇺🇸 USA / CAN: 911
            </a>
            <a
              href="tel:112"
              className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition-all"
            >
              🇪🇺 Europe: 112
            </a>
            <a
              href="tel:999"
              className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition-all"
            >
              🇬🇧 UK: 999
            </a>
            <a
              href="tel:108"
              className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition-all"
            >
              🇮🇳 India: 108
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
