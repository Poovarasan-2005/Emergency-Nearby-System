import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  List,
  Filter,
  Flame,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  Users,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { useEmergency } from '../contexts/EmergencyContext';
import { SOSButton } from '../components/sos/SOSButton';
import { EmergencyMap } from '../components/map/EmergencyMap';
import { FacilityCard } from '../components/facilities/FacilityCard';
import { FacilityDetailsModal } from '../components/facilities/FacilityDetailsModal';
import { Facility, FacilityCategory, EmergencyCategory } from '../types/emergency.types';

interface DashboardPageProps {
  facilities: Facility[];
  isLoadingFacilities: boolean;
  onRefreshFacilities: () => void;
  onNavigateTab: (tab: string) => void;
}

const CATEGORY_CHIPS: Array<{
  id: FacilityCategory | 'all';
  label: string;
  icon: string;
  emergencyType: EmergencyCategory;
}> = [
  { id: 'all', label: 'All Emergency', icon: '🚨', emergencyType: 'unknown' },
  { id: 'emergency_room', label: 'Trauma & ER', icon: '🏥', emergencyType: 'medical' },
  { id: 'hospital', label: 'Hospitals', icon: '🩺', emergencyType: 'medical' },
  { id: 'police', label: 'Police Stations', icon: '👮', emergencyType: 'crime' },
  { id: 'fire_station', label: 'Fire Rescue', icon: '🚒', emergencyType: 'fire' },
  { id: 'pharmacy', label: '24/7 Pharmacies', icon: '💊', emergencyType: 'medical' },
  { id: 'medical_clinic', label: 'Urgent Care', icon: '🩹', emergencyType: 'medical' },
  { id: 'blood_bank', label: 'Blood Banks', icon: '🩸', emergencyType: 'medical' },
  { id: 'shelter', label: 'Crisis Shelters', icon: '🛡️', emergencyType: 'women_safety' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  facilities,
  isLoadingFacilities,
  onRefreshFacilities,
  onNavigateTab,
}) => {
  const { lat, lng, accuracy, searchRadiusKm } = useLocation();
  const { trustedContacts, setSelectedCategory } = useEmergency();

  const [selectedFacilityCategory, setSelectedFacilityCategory] = useState<FacilityCategory | 'all'>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');

  // Filter facilities based on selected category chip
  const filteredFacilities =
    selectedFacilityCategory === 'all'
      ? facilities
      : facilities.filter((f) => f.category === selectedFacilityCategory);

  const handleCategorySelect = (item: (typeof CATEGORY_CHIPS)[0]) => {
    setSelectedFacilityCategory(item.id);
    setSelectedCategory(item.emergencyType);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 animate-fade-in pb-24">
      {/* SOS Giant Section */}
      <div className="mb-8">
        <SOSButton />
      </div>

      {/* Emergency Category Quick Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-rose-500" />
            Filter Emergency Service Category
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredFacilities.length} facilities within {searchRadiusKm} km
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleCategorySelect(chip)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                selectedFacilityCategory === chip.id
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white">Nearby Verified Facilities</span>
          {isLoadingFacilities && (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'split' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'list' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              List Only
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'map' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map Only
            </button>
          </div>

          <button
            onClick={onRefreshFacilities}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all text-xs"
            title="Reload Facilities"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Facilities & Map Layout */}
      {viewMode === 'map' ? (
        <div className="h-[600px] w-full mb-8">
          <EmergencyMap
            userLat={lat ?? 40.7128}
            userLng={lng ?? -74.006}
            userAccuracy={accuracy}
            facilities={filteredFacilities}
            selectedFacility={selectedFacility}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            radiusKm={searchRadiusKm}
          />
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredFacilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              isSelected={selectedFacility?.id === facility.id}
              onSelect={() => setSelectedFacility(facility)}
              onViewDetails={(fac) => setSelectedFacility(fac)}
            />
          ))}
        </div>
      ) : (
        /* Split View: List on left, Map on right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Facility Cards Column */}
          <div className="lg:col-span-6 space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {filteredFacilities.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white mb-1">
                  No Emergency Facilities Found
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  No verified facilities match the selected filter within {searchRadiusKm} km. Try widening your radius to 10 km or 25 km.
                </p>
                <button
                  onClick={() => setSelectedFacilityCategory('all')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Clear Category Filters
                </button>
              </div>
            ) : (
              filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  isSelected={selectedFacility?.id === facility.id}
                  onSelect={() => setSelectedFacility(facility)}
                  onViewDetails={(fac) => setSelectedFacility(fac)}
                />
              ))
            )}
          </div>

          {/* Interactive Map Sticky Column */}
          <div className="lg:col-span-6 h-[400px] lg:h-[640px] sticky top-36">
            <EmergencyMap
              userLat={lat ?? 40.7128}
              userLng={lng ?? -74.006}
              userAccuracy={accuracy}
              facilities={filteredFacilities}
              selectedFacility={selectedFacility}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
              radiusKm={searchRadiusKm}
            />
          </div>
        </div>
      )}

      {/* Quick Summary Grid at bottom: Trusted Contacts & Safety Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Trusted Contacts Quick Glance */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-extrabold text-white">
                  Trusted Emergency Contacts
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('contacts')}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {trustedContacts.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {c.relationship} • {c.phone}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded-md">
                    {c.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4">
            These individuals are automatically alerted with your GPS pin during SOS activation.
          </p>
        </div>

        {/* First Responder Safety Guidelines */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-extrabold text-white">
                Emergency First Actions Protocol
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">1.</span>
                <span>Ensure your immediate surroundings are secure (traffic, fire, hazards).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">2.</span>
                <span>Activate SOS countdown to transmit coordinates to your emergency circle.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">3.</span>
                <span>Connect with 911 / 112 dispatchers or proceed directly to the top-ranked facility.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Algorithmic facility recommendations are calculated using real-time distance and medical urgency weightings.
          </div>
        </div>
      </div>

      {/* Facility Details Modal */}
      <FacilityDetailsModal
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
      />
    </div>
  );
};
