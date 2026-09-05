import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertOctagon, MapPin, Phone, Compass, Navigation } from 'lucide-react';
import { EmergencyMap } from '../components/map/EmergencyMap';
import { Facility } from '../types/emergency.types';
import { generateNearbyFacilities } from '../services/facilitiesService';

interface LiveShareViewPageProps {
  token: string;
  onExitShareView?: () => void;
}

export const LiveShareViewPage: React.FC<LiveShareViewPageProps> = ({ token, onExitShareView }) => {
  // Mock secure token lookup state
  const [lat, setLat] = useState<number>(40.7128);
  const [lng, setLng] = useState<number>(-74.0060);
  const [accuracy, setAccuracy] = useState<number>(18);
  const [category, setCategory] = useState<string>('Medical Emergency');
  const [status, setStatus] = useState<'active' | 'expired' | 'revoked'>('active');
  const [minutesRemaining, setMinutesRemaining] = useState<number>(18);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    // Generate facilities around shared coordinates
    const nearby = generateNearbyFacilities(lat, lng, 5);
    setFacilities(nearby);

    const timer = setInterval(() => {
      setMinutesRemaining((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [lat, lng]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl px-4 py-3 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-rose-600/30">
            SOS
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white leading-tight">
              Live Emergency Location Feed
            </h1>
            <span className="text-[10px] text-slate-400 font-mono">
              Secure Token: {token.slice(0, 10)}... (Read-Only)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'active' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Tracking ({minutesRemaining}m left)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Session {status === 'expired' ? 'Expired' : 'Revoked'}
            </span>
          )}

          {onExitShareView && (
            <button
              onClick={onExitShareView}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700"
            >
              Return to App
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Map View */}
        <div className="lg:col-span-2 h-[450px] lg:h-auto min-h-[420px]">
          <EmergencyMap
            userLat={lat}
            userLng={lng}
            userAccuracy={accuracy}
            facilities={facilities}
            radiusKm={5}
          />
        </div>

        {/* Right Details Panel */}
        <div className="space-y-5">
          {/* Emergency Alert Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                {category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                Updated 15s ago
              </span>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-2">
              User Has Broadcasted Emergency Coordinates
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This secure temporary tracker allows authorized contacts or first responders to monitor the user's real-time position during an incident.
            </p>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono text-xs mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                  Lat / Lng
                </span>
                <span className="font-bold text-white">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                  GPS Accuracy
                </span>
                <span className="font-bold text-emerald-400">±{accuracy}m</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to User</span>
              </a>
              <a
                href="tel:911"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Contact Dispatch</span>
              </a>
            </div>
          </div>

          {/* Nearest Facilities to User */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Nearest Responding Facilities
            </h3>
            <div className="space-y-2.5">
              {facilities.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{f.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {f.distanceKm} km • {f.category.replace('_', ' ')}
                    </span>
                  </div>
                  {f.phone && (
                    <a
                      href={`tel:${f.phone}`}
                      className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Expiration Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Privacy Guarantee:</span> This link automatically expires after its countdown. The user may stop live broadcasting at any time. Private profile information and passwords are strictly protected.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
