import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Search,
  CheckCircle,
  Navigation,
} from 'lucide-react';
import { useLocation, PRESET_LOCATIONS } from '../../contexts/LocationContext';

export const LocationStatusBanner: React.FC = () => {
  const {
    lat,
    lng,
    accuracy,
    timestamp,
    address,
    permissionStatus,
    isLoading,
    error,
    isStale,
    searchRadiusKm,
    refreshLocation,
    setSearchRadiusKm,
    setManualLocation,
    searchAddress,
  } = useLocation();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const getRelativeTime = (ts: number | null): string => {
    if (!ts) return 'Detecting...';
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 15) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    await searchAddress(searchQuery);
    setIsSearching(false);
    setIsManualModalOpen(false);
  };

  return (
    <>
      <div className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl px-4 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Location details */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full ${
                    permissionStatus === 'granted' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {permissionStatus === 'granted' && (
                  <div className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping" />
                )}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Location:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                {address || (lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Detecting GPS...')}
              </span>

              {accuracy && (
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
                  ±{accuracy}m
                </span>
              )}
            </div>

            {/* Staleness or permission badge */}
            {isStale ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                <AlertTriangle className="w-3 h-3" />
                Stale (Updated {getRelativeTime(timestamp)})
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Updated {getRelativeTime(timestamp)}
              </span>
            )}
          </div>

          {/* Controls: Radius & Refresh/Change */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
            {/* Radius selector */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
              <span className="text-slate-400 px-2 font-semibold flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                Radius:
              </span>
              {[1, 3, 5, 10, 25].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSearchRadiusKm(r)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all text-xs ${
                    searchRadiusKm === r
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            {/* Refresh GPS button */}
            <button
              onClick={() => refreshLocation()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all shrink-0"
              title="Refresh GPS Coordinates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Change / Manual Location modal trigger */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Change</span>
            </button>
          </div>
        </div>

        {/* Error warning if GPS denied */}
        {error && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-amber-300">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="underline hover:text-white font-semibold shrink-0"
            >
              Enter Manually
            </button>
          </div>
        )}
      </div>

      {/* Manual Location Dialog */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              Change Current Location
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Search any address or select a preset location to find nearby emergency facilities.
            </p>

            {/* Search Input */}
            <form onSubmit={handleManualSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Times Square, NY or London Eye"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-20 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-1.5 top-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Preset Options */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Demo Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_LOCATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setManualLocation(preset.lat, preset.lng, preset.name);
                      setIsManualModalOpen(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left text-xs font-medium text-slate-300 hover:text-white transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
