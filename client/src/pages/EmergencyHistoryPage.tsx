import React, { useState } from 'react';
import { History, Shield, CheckCircle, XCircle, AlertOctagon, MapPin, Clock, FileText } from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';
import { EmergencySession } from '../types/emergency.types';

export const EmergencyHistoryPage: React.FC = () => {
  const { emergencyHistory } = useEmergency();
  const [selectedSession, setSelectedSession] = useState<EmergencySession | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'active':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
      case 'cancelled':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in pb-24">
      {/* Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Emergency Incident History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable timeline of past emergency sessions, coordinates captured, and resolutions.
          </p>
        </div>
      </div>

      {emergencyHistory.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 my-8">
          <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Emergency Records</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no recorded emergency SOS sessions. Stay safe!
          </p>
        </div>
      ) : (
        <div className="space-y-4 my-8">
          {emergencyHistory.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-black text-white">{session.id}</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {session.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(session.createdAt).toLocaleDateString()} at{' '}
                    {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {session.lat.toFixed(4)}, {session.lng.toFixed(4)} (±{session.accuracy}m)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">
                    Contacts Alerted: <strong className="text-white">{session.notifiedContactsCount}</strong>
                  </span>
                  {session.selectedFacilityName && (
                    <span className="text-[11px] text-rose-400 block font-semibold truncate max-w-[200px]">
                      {session.selectedFacilityName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Incident Audit Log
                </span>
                <h3 className="text-lg font-black text-white">{selectedSession.id}</h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 mb-6">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-bold text-white capitalize">{selectedSession.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold text-white uppercase">{selectedSession.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Created</span>
                  <span className="font-bold text-white">{new Date(selectedSession.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Resolved</span>
                  <span className="font-bold text-white">
                    {selectedSession.resolvedAt ? new Date(selectedSession.resolvedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {selectedSession.notes && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Resolution Notes</span>
                  <p className="text-slate-200">{selectedSession.notes}</p>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-2">Actions Logged</span>
                <div className="space-y-1.5">
                  {selectedSession.actionsTaken.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
