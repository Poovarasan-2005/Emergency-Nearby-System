import React from 'react';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';
import { EmergencyCategory } from '../../types/emergency.types';

const CATEGORIES: Array<{ id: EmergencyCategory; label: string; icon: string }> = [
  { id: 'medical', label: 'Medical Emergency', icon: '🚑' },
  { id: 'accident', label: 'Car/Traffic Accident', icon: '💥' },
  { id: 'fire', label: 'Fire / Explosion', icon: '🔥' },
  { id: 'crime', label: 'Crime / Physical Threat', icon: '👮' },
  { id: 'women_safety', label: "Women's Safety", icon: '🛡️' },
  { id: 'child_safety', label: 'Child In Danger', icon: '👶' },
  { id: 'natural_disaster', label: 'Disaster / Flood', icon: '🌊' },
  { id: 'unknown', label: "Can't Specify / Urgent", icon: '⚠️' },
];

export const SOSConfirmationModal: React.FC = () => {
  const {
    status,
    countdownSeconds,
    cancelSosCountdown,
    activateSosImmediately,
    selectedCategory,
    setSelectedCategory,
  } = useEmergency();

  if (status !== 'countdown') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-600 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.4)] text-center overflow-hidden">
        {/* Animated Background warning stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse"></div>

        {/* Big Countdown Display */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-rose-950/80 border-4 border-rose-500 flex items-center justify-center shadow-inner relative">
            <span className="text-5xl font-black text-white tracking-tighter animate-pulse">
              {countdownSeconds}
            </span>
            <div className="absolute -inset-2 rounded-full border border-rose-500/40 animate-ping"></div>
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400 mt-2">
            Seconds to Activation
          </span>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">
          Activating Emergency SOS
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
          Alerting your configured trusted contacts and locking coordinates for nearest responders.
        </p>

        {/* Quick Emergency Category Selector */}
        <div className="my-5 text-left">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Category (Optional):
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600/30 border-rose-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Safety Cancel and Immediate Activate */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <button
            type="button"
            onClick={cancelSosCountdown}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <X className="w-5 h-5 text-rose-400" />
            <span>Cancel SOS (False Alarm)</span>
          </button>

          <button
            type="button"
            onClick={() => activateSosImmediately(selectedCategory)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-98 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>Activate Now</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Need police or fire right now? Dial 911 / 112 directly.</span>
        </div>
      </div>
    </div>
  );
};
