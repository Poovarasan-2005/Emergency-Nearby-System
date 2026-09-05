import React, { useState } from 'react';
import { EmergencyMap } from '../components/map/EmergencyMap';
import { FacilityCard } from '../components/facilities/FacilityCard';
import { FacilityDetailsModal } from '../components/facilities/FacilityDetailsModal';
import { Facility, FacilityCategory } from '../types/emergency.types';
import { useLocation } from '../contexts/LocationContext';
import { Sliders, Filter, Navigation, Phone, ChevronRight } from 'lucide-react';

interface MapPageProps {
  facilities: Facility[];
}

export const MapPage: React.FC<MapPageProps> = ({ facilities }) => {
  const { lat, lng, accuracy, searchRadiusKm, setSearchRadiusKm } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | 'all'>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const filtered =
    selectedCategory === 'all'
      ? facilities
      : facilities.filter((f) => f.category === selectedCategory);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* Floating Control Ribbon */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl pointer-events-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Services', icon: '🚨' },
            { id: 'emergency_room', label: 'ER/Trauma', icon: '🏥' },
            { id: 'hospital', label: 'Hospitals', icon: '🩺' },
            { id: 'police', label: 'Police', icon: '👮' },
            { id: 'fire_station', label: 'Fire', icon: '🚒' },
            { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Radius Filter */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl pointer-events-auto text-xs">
          <span className="text-slate-400 font-bold px-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            Radius:
          </span>
          {[1, 3, 5, 10, 25].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSearchRadiusKm(r)}
              className={`px-2 py-1 rounded-lg font-bold text-xs transition-all ${
                searchRadiusKm === r
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r}k
            </button>
          ))}
        </div>
      </div>

      {/* Main Full-Screen Map */}
      <div className="flex-1 w-full h-full">
        <EmergencyMap
          userLat={lat ?? 40.7128}
          userLng={lng ?? -74.006}
          userAccuracy={accuracy}
          facilities={filtered}
          selectedFacility={selectedFacility}
          onSelectFacility={(fac) => setSelectedFacility(fac)}
          radiusKm={searchRadiusKm}
        />
      </div>

      {/* Bottom Floating Facility Card Preview when facility is selected */}
      {selectedFacility && (
        <div className="absolute bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 animate-fade-in">
          <div className="p-4 rounded-3xl bg-slate-900/95 border-2 border-rose-500 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full">
                {selectedFacility.category.replace('_', ' ')}
              </span>
              <span className="text-xs font-black text-amber-400">
                Score {selectedFacility.recommendationScore}%
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">{selectedFacility.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{selectedFacility.address}</p>

            <div className="flex items-center justify-between text-xs text-slate-300 mb-3">
              <span className="font-bold text-white">{selectedFacility.distanceKm} km away</span>
              <span className="text-sky-400 font-semibold">
                ~{selectedFacility.estimatedTravelMins || 4} min drive
              </span>
              <span className={selectedFacility.isOpen ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {selectedFacility.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {selectedFacility.phone && (
                <a
                  href={`tel:${selectedFacility.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.lat},${selectedFacility.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all text-center"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <FacilityDetailsModal
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
      />
    </div>
  );
};
