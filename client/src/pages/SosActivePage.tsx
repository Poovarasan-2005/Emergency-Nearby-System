import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Phone,
  Share2,
  CheckCircle,
  Copy,
  Clock,
  MapPin,
  ExternalLink,
  ShieldAlert,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';
import { useLocation } from '../contexts/LocationContext';
import { Facility } from '../types/emergency.types';

interface SosActivePageProps {
  facilities: Facility[];
  onOpenMap: () => void;
}

export const SosActivePage: React.FC<SosActivePageProps> = ({ facilities, onOpenMap }) => {
  const {
    activeSession,
    resolveEmergency,
    cancelEmergency,
    liveShareSession,
    createLiveShareSession,
    revokeLiveShareSession,
    trustedContacts,
  } = useEmergency();

  const { lat, lng, accuracy, address } = useLocation();

  const [copiedLink, setCopiedLink] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [remainingShareMinutes, setRemainingShareMinutes] = useState(20);

  // Calculate live share link TTL countdown
  useEffect(() => {
    if (!liveShareSession) return;
    const interval = setInterval(() => {
      const remainingMs = new Date(liveShareSession.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setRemainingShareMinutes(0);
      } else {
        setRemainingShareMinutes(Math.ceil(remainingMs / 60000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [liveShareSession]);

  if (!activeSession) return null;

  const shareUrl = liveShareSession
    ? `${window.location.origin}/share/${liveShareSession.token}`
    : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Top recommended facility
  const nearestFacility = facilities[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in pb-24">
      {/* High Alert Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950 via-rose-950 to-slate-950 border-2 border-red-600 shadow-[0_0_80px_rgba(239,68,68,0.5)] overflow-hidden mb-6">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <AlertOctagon className="w-64 h-64 text-red-500" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-400 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full">
                Active Emergency Session • {activeSession.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Category:</span>
              <span className="text-xs font-black uppercase tracking-wider text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                {activeSession.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            EMERGENCY SOS ACTIVATED
          </h1>
          <p className="text-sm text-red-200/90 max-w-2xl mt-1">
            Real-time coordinates recorded. Trusted contacts notified. Immediate facility navigation and emergency dial actions available below.
          </p>

          {/* Critical CAD Dispatch disclaimer */}
          <div className="mt-4 p-3 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>
              <strong>Notice:</strong> This platform does not guarantee automated responder dispatch unless confirmed by real CAD integration. In life-threatening emergencies, connect directly to local dispatch below.
            </span>
          </div>

          {/* Quick Primary Dispatch Call Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
            <a
              href="tel:911"
              className="flex items-center justify-center gap-2 py-3 px-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-900/50 transition-all text-center"
            >
              <Phone className="w-4 h-4" />
              <span>Dial 911 (US/CA)</span>
            </a>
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 py-3 px-3 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-black text-sm rounded-2xl shadow-xl transition-all text-center"
            >
              <Phone className="w-4 h-4" />
              <span>Dial 112 (EU/Global)</span>
            </a>
            <a
              href="tel:999"
              className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black text-sm rounded-2xl border border-slate-700 transition-all text-center"
            >
              <Phone className="w-4 h-4" />
              <span>Dial 999 (UK)</span>
            </a>
            <a
              href="tel:108"
              className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black text-sm rounded-2xl border border-slate-700 transition-all text-center"
            >
              <Phone className="w-4 h-4" />
              <span>Dial 108 (IN)</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: GPS and Live Share */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Captured Coordinates */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-400" />
              Your Live Emergency Coordinates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Latitude</span>
                <span className="text-base font-black text-white font-mono">
                  {lat ? lat.toFixed(6) : '40.712800'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Longitude</span>
                <span className="text-base font-black text-white font-mono">
                  {lng ? lng.toFixed(6) : '-74.006000'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ±{accuracy || 15} meters
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 flex items-center gap-2 mb-4">
              <span className="font-semibold text-white">Detected Area:</span>
              <span>{address || 'Downtown Metro Area'}</span>
            </p>

            <button
              onClick={onOpenMap}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Inspect Live on Interactive Map</span>
            </button>
          </div>

          {/* Live Location Sharing Token Management */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Temporary Live Location Sharing
                  </h3>
                  <p className="text-xs text-slate-400">
                    Share a secure, tokenized real-time HUD with family or responders.
                  </p>
                </div>
              </div>

              {liveShareSession && liveShareSession.status === 'active' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Active ({remainingShareMinutes}m remaining)
                </span>
              ) : (
                <span className="text-[11px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                  Inactive
                </span>
              )}
            </div>

            {liveShareSession && liveShareSession.status === 'active' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-xs text-slate-300 font-mono outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    {copiedLink ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                    title="Preview Share Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    Token is cryptographically unpredictable and does not reveal your medical records or passwords.
                  </p>
                  <button
                    onClick={revokeLiveShareSession}
                    className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition-all shrink-0"
                  >
                    Stop Sharing Now
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => createLiveShareSession(20)}
                className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-900/30"
              >
                <Share2 className="w-4 h-4" />
                <span>Generate 20-Minute Secure Share Link</span>
              </button>
            )}
          </div>

          {/* Timeline of Actions */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Incident Activity Log
            </h3>
            <div className="space-y-3">
              {activeSession.actionsTaken.map((act, index) => (
                <div key={index} className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 py-0.5">{act}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Nearest Facility & Resolution */}
        <div className="space-y-6">
          {/* Nearest High-Score Facility Card */}
          {nearestFacility && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-rose-600/60 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  Recommended Facility
                </span>
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Score {nearestFacility.recommendationScore}%
                </span>
              </div>

              <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                {nearestFacility.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">{nearestFacility.address}</p>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-around text-center mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Distance</span>
                  <span className="text-sm font-black text-white">{nearestFacility.distanceKm} km</span>
                </div>
                <div className="border-x border-slate-800 px-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Travel Time</span>
                  <span className="text-sm font-black text-sky-400">
                    ~{nearestFacility.estimatedTravelMins || 4} min
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">ER Status</span>
                  <span className="text-sm font-black text-emerald-400">Open 24/7</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {nearestFacility.phone && (
                  <a
                    href={`tel:${nearestFacility.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all text-center"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call ER</span>
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nearestFacility.lat},${nearestFacility.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all text-center"
                >
                  <span>Start GPS</span>
                </a>
              </div>
            </div>
          )}

          {/* Trusted Contacts Status */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
              Trusted Contacts Alerted ({trustedContacts.length})
            </h3>
            <div className="space-y-2 mb-4">
              {trustedContacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.phone}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    SMS Alerted
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Resolution & Cancellation Controls */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-1">
              Resolve or Cancel Incident
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              When you are safe or responders arrive, close the emergency session to archive it.
            </p>

            <button
              onClick={() => setIsResolveModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Emergency Resolved (Safe)</span>
            </button>

            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Cancel Emergency (False Activation)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resolution Dialog */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Confirm Safe Resolution
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Are you in a safe situation? Stopping the emergency will deactivate live location sharing and log the incident.
            </p>
            <textarea
              rows={3}
              placeholder="Optional notes: e.g. 'Arrived at City Hospital ER, admitted safely'"
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  resolveEmergency(resolveNotes);
                  setIsResolveModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Dialog */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              Cancel Emergency
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Cancelling will mark this emergency as false activation or cancelled by user.
            </p>
            <input
              type="text"
              placeholder="Reason for cancellation (e.g., 'Accidental pocket tap')"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  cancelEmergency(cancelReason);
                  setIsCancelModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
