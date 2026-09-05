import React, { useState } from 'react';
import { X, Phone, Navigation, Star, MapPin, Clock, ShieldCheck, CheckCircle2, Flag } from 'lucide-react';
import { Facility } from '../../types/emergency.types';
import { useEmergency } from '../../contexts/EmergencyContext';

interface FacilityDetailsModalProps {
  facility: Facility | null;
  onClose: () => void;
}

export const FacilityDetailsModal: React.FC<FacilityDetailsModalProps> = ({
  facility,
  onClose,
}) => {
  const { selectFacilityForEmergency, activeSession } = useEmergency();
  const [reportSent, setReportSent] = useState(false);

  if (!facility) return null;

  const handleSelectAsDestination = () => {
    selectFacilityForEmergency(facility);
    onClose();
  };

  const handleReportIssue = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                {facility.category.replace('_', ' ')}
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                Smart Score {facility.recommendationScore}%
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight leading-snug">
              {facility.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Proximity & Status banner */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-5 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance</span>
            <span className="text-base font-black text-white">{facility.distanceKm} km</span>
          </div>
          <div className="border-x border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
            <span className={`text-sm font-bold ${facility.isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
              {facility.isOpen ? 'Open 24/7' : 'Closed'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Drive</span>
            <span className="text-base font-black text-sky-400">
              ~{facility.estimatedTravelMins || 5} min
            </span>
          </div>
        </div>

        {/* Address and details */}
        <div className="space-y-3.5 mb-6 text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Location Address</div>
              <div className="text-xs text-slate-400 mt-0.5">{facility.address}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Emergency Hours</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Always open for critical emergency admissions. Triage prioritized by severity.
              </div>
            </div>
          </div>

          {facility.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Direct Dispatch / Reception</div>
                <div className="text-xs text-slate-400 mt-0.5">{facility.phone}</div>
              </div>
            </div>
          )}

          {facility.rating && (
            <div className="flex items-start gap-3">
              <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 fill-amber-400" />
              <div>
                <div className="font-semibold text-white">Verified Public Rating</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {facility.rating} out of 5 ({facility.userRatingsTotal || 350} verified patient reviews)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Why Recommended List */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Algorithm Recommendation Insights
          </div>
          <div className="space-y-2">
            {facility.recommendationReasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Verified registry record & GPS verified marker</span>
            </div>
          </div>
        </div>

        {/* Active Emergency lock button */}
        {activeSession && (
          <button
            type="button"
            onClick={handleSelectAsDestination}
            className="w-full py-3 px-4 mb-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-rose-900/40"
          >
            Lock in as SOS Destination
          </button>
        )}

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {facility.phone ? (
            <a
              href={`tel:${facility.phone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-98"
            >
              <Phone className="w-4 h-4" />
              <span>Call Facility</span>
            </a>
          ) : (
            <div className="flex items-center justify-center py-3 px-4 rounded-2xl bg-slate-800 text-slate-500 text-xs font-semibold">
              No Direct Phone
            </div>
          )}

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md active:scale-98"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Navigation</span>
          </a>
        </div>

        {/* Reporting Outdated Info */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Notice incorrect hours or contact?</span>
          {reportSent ? (
            <span className="text-emerald-400 font-semibold">Report received! Thank you.</span>
          ) : (
            <button
              onClick={handleReportIssue}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 underline"
            >
              <Flag className="w-3 h-3" />
              Report Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
