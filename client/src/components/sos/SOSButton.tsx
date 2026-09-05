import React from 'react';
import { AlertCircle, Flame, ShieldAlert, HeartPulse } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';
import { EmergencyCategory } from '../../types/emergency.types';

export const SOSButton: React.FC = () => {
  const { startSosCountdown, status } = useEmergency();

  const handleTrigger = (cat: EmergencyCategory = 'unknown') => {
    startSosCountdown(cat);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-rose-950/40 via-slate-900/60 to-slate-950 border border-rose-900/40 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Background ambient red glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center mb-5 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wider uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Emergency Assistance System
        </div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
          Need Immediate Emergency Help?
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto mt-1">
          Tap the SOS button to alert trusted contacts, capture exact GPS, and lock on the nearest emergency facility.
        </p>
      </div>

      {/* Giant SOS Trigger Button */}
      <div className="relative group my-2 z-10">
        {/* Pulsing beacon circles */}
        <div className="absolute -inset-4 rounded-full bg-rose-600/20 animate-beacon pointer-events-none"></div>
        <div className="absolute -inset-2 rounded-full bg-rose-600/30 animate-pulse pointer-events-none"></div>

        <button
          onClick={() => handleTrigger('unknown')}
          disabled={status === 'countdown' || status === 'active'}
          className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 hover:from-rose-400 hover:to-red-600 active:scale-95 text-white font-black shadow-[0_0_50px_rgba(239,68,68,0.5)] border-4 border-rose-300/40 flex flex-col items-center justify-center transition-all cursor-pointer select-none focus:outline-none focus:ring-4 focus:ring-rose-500/50"
        >
          <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-white mb-1 animate-bounce" />
          <span className="text-3xl md:text-4xl tracking-wider font-extrabold drop-shadow-md">
            SOS
          </span>
          <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-rose-100 opacity-90">
            Hold or Tap
          </span>
        </button>
      </div>

      {/* Quick Category SOS shortcuts */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-5 z-10">
        <button
          onClick={() => handleTrigger('medical')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700/60 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          <HeartPulse className="w-4 h-4 text-rose-400 mb-1" />
          <span>Medical</span>
        </button>
        <button
          onClick={() => handleTrigger('crime')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/90 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-700/60 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          <ShieldAlert className="w-4 h-4 text-blue-400 mb-1" />
          <span>Police/Threat</span>
        </button>
        <button
          onClick={() => handleTrigger('fire')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/90 hover:bg-orange-950/60 border border-slate-800 hover:border-orange-700/60 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          <Flame className="w-4 h-4 text-orange-400 mb-1" />
          <span>Fire Rescue</span>
        </button>
      </div>
    </div>
  );
};
