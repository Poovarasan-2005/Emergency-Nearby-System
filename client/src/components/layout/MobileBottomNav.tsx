import React from 'react';
import { Compass, MapPin, AlertCircle, Users, UserCheck } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { startSosCountdown, status } = useEmergency();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => setCurrentTab('dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
          currentTab === 'dashboard' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      <button
        onClick={() => setCurrentTab('map')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
          currentTab === 'map' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <MapPin className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold">Map</span>
      </button>

      {/* Central Giant SOS Button */}
      <div className="relative -top-4">
        <button
          onClick={() => startSosCountdown('unknown')}
          disabled={status === 'countdown' || status === 'active'}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-red-600 border-4 border-slate-950 text-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] active:scale-95 transition-transform"
        >
          <AlertCircle className="w-6 h-6 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest uppercase">SOS</span>
        </button>
      </div>

      <button
        onClick={() => setCurrentTab('contacts')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
          currentTab === 'contacts' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold">Contacts</span>
      </button>

      <button
        onClick={() => setCurrentTab('profile')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
          currentTab === 'profile' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <UserCheck className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </div>
  );
};
