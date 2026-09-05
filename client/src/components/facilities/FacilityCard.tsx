import React from 'react';
import { Phone, Navigation, Star, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';
import { Facility } from '../../types/emergency.types';

interface FacilityCardProps {
  facility: Facility;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewDetails?: (facility: Facility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  isSelected,
  onSelect,
  onViewDetails,
}) => {
  const getBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'hospital':
      case 'emergency_room':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'police':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'fire_station':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'pharmacy':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'blood_bank':
        return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
      default:
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-200 backdrop-blur-md flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-900/95 border-rose-500 ring-2 ring-rose-500/40 shadow-2xl shadow-rose-950/50'
          : 'bg-slate-900/75 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90 shadow-lg'
      }`}
    >
      {/* Top row: Category, Recommendation Score, Verified */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                facility.category
              )}`}
            >
              {facility.category.replace('_', ' ')}
            </span>
            {facility.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* Smart Recommendation Score */}
          <div className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Score {facility.recommendationScore}%</span>
          </div>
        </div>

        {/* Facility Name & Proximity */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
            {facility.name}
          </h3>
          <div className="text-right whitespace-nowrap">
            <span className="text-sm font-black text-rose-400">{facility.distanceKm} km</span>
            {facility.estimatedTravelMins && (
              <div className="text-[10px] text-slate-400 font-medium">
                ~{facility.estimatedTravelMins} min drive
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{facility.address}</span>
        </p>

        {/* Operational Status & Rating */}
        <div className="flex items-center gap-4 text-xs text-slate-300 pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className={facility.isOpen ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {facility.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>

          {facility.rating && (
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{facility.rating}</span>
              {facility.userRatingsTotal && (
                <span className="text-slate-500 font-normal">({facility.userRatingsTotal})</span>
              )}
            </div>
          )}
        </div>

        {/* Smart Recommendation Reason Badges */}
        {facility.recommendationReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {facility.recommendationReasons.slice(0, 2).map((reason, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
              >
                ✓ {reason}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {facility.phone ? (
          <a
            href={`tel:${facility.phone}`}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-800 text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed"
          >
            <span>No Phone</span>
          </button>
        )}

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Route</span>
        </a>

        <button
          type="button"
          onClick={() => {
            if (onSelect) onSelect();
            if (onViewDetails) onViewDetails(facility);
          }}
          className="flex items-center justify-center py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 active:scale-95"
        >
          Details
        </button>
      </div>
    </div>
  );
};
