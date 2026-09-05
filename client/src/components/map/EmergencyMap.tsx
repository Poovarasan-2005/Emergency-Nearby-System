import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Facility, FacilityCategory } from '../../types/emergency.types';

interface EmergencyMapProps {
  userLat: number;
  userLng: number;
  userAccuracy?: number | null;
  facilities: Facility[];
  selectedFacility?: Facility | null;
  onSelectFacility?: (facility: Facility) => void;
  radiusKm?: number;
}

const getCategoryColor = (category: FacilityCategory): string => {
  switch (category) {
    case 'hospital':
    case 'emergency_room':
      return '#ef4444'; // Red
    case 'police':
      return '#3b82f6'; // Blue
    case 'fire_station':
      return '#f97316'; // Orange
    case 'pharmacy':
      return '#10b981'; // Green
    case 'blood_bank':
      return '#e11d48'; // Rose
    case 'shelter':
      return '#8b5cf6'; // Purple
    default:
      return '#64748b'; // Slate
  }
};

const getCategoryIconSvg = (category: FacilityCategory): string => {
  switch (category) {
    case 'hospital':
    case 'emergency_room':
      return `<path d="M12 2v20M2 12h20" stroke="white" stroke-width="3" stroke-linecap="round"/>`;
    case 'police':
      return `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="white" stroke-width="2.2" stroke-linejoin="round"/>`;
    case 'fire_station':
      return `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="none" stroke="white" stroke-width="2"/>`;
    case 'pharmacy':
      return `<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7" stroke="white" stroke-width="2"/>`;
    case 'blood_bank':
      return `<path d="M12 2a5 5 0 0 0-5 5c0 3 5 9 5 9s5-6 5-9a5 5 0 0 0-5-5z" fill="white"/>`;
    case 'shelter':
      return `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="white" stroke-width="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="white" stroke-width="2"/>`;
    default:
      return `<circle cx="12" cy="12" r="6" fill="white"/>`;
  }
};

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  userLat,
  userLng,
  userAccuracy,
  facilities,
  selectedFacility,
  onSelectFacility,
  radiusKm = 5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 14,
        zoomControl: false,
      });

      // High quality CartoDB Dark Matter tiles (sleek, high contrast for emergency HUD)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom Zoom control on top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User Marker & Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Update center
    map.panTo([userLat, userLng], { animate: true });

    // User Marker
    const userHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping"></div>
        <div class="absolute -inset-2 rounded-full bg-rose-500/50 animate-pulse"></div>
        <div class="relative w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
          YOU
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: userHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      userMarkerRef.current.bindPopup(`
        <div class="p-2 text-xs font-semibold">
          <div class="text-rose-400 font-bold uppercase tracking-wider mb-0.5">Your Current Location</div>
          <div class="text-slate-300">Accuracy: ±${userAccuracy || 20}m</div>
        </div>
      `);
    } else {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    }

    // Radius Circle
    if (!radiusCircleRef.current) {
      radiusCircleRef.current = L.circle([userLat, userLng], {
        radius: radiusKm * 1000,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '5, 8',
      }).addTo(map);
    } else {
      radiusCircleRef.current.setLatLng([userLat, userLng]);
      radiusCircleRef.current.setRadius(radiusKm * 1000);
    }
  }, [userLat, userLng, userAccuracy, radiusKm]);

  // Update Facility Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    facilities.forEach((fac) => {
      const color = getCategoryColor(fac.category);
      const svgIcon = getCategoryIconSvg(fac.category);
      const isSelected = selectedFacility?.id === fac.id;

      const markerHtml = `
        <div class="relative cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
          <div style="background-color: ${color};" class="w-9 h-9 rounded-2xl border-2 ${isSelected ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-2xl' : 'border-white/90 shadow-lg'} flex items-center justify-center p-1.5 transition-all">
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none">
              ${svgIcon}
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${color};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 text-slate-100 min-w-[240px]">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style="background: ${color}25; color: ${color};">
              ${fac.category.replace('_', ' ')}
            </span>
            <span class="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
              Score ${fac.recommendationScore}%
            </span>
          </div>
          
          <h4 class="text-sm font-bold text-white mb-1">${fac.name}</h4>
          <p class="text-xs text-slate-300 mb-2">${fac.address}</p>
          
          <div class="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-700/80 pt-2 mb-3">
            <div><span class="font-bold text-white">${fac.distanceKm} km</span> away</div>
            <div>•</div>
            <div class="${fac.isOpen ? 'text-emerald-400' : 'text-rose-400'} font-semibold">
              ${fac.isOpen ? '● Open 24/7' : '● Closed'}
            </div>
            ${fac.estimatedTravelMins ? `<div>•</div><div>~${fac.estimatedTravelMins}m drive</div>` : ''}
          </div>

          <div class="grid grid-cols-2 gap-2">
            ${
              fac.phone
                ? `<a href="tel:${fac.phone}" class="flex items-center justify-center py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold text-center no-underline">
                     📞 Call Now
                   </a>`
                : ''
            }
            <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold text-center no-underline">
              🧭 Directions
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectFacility) {
          onSelectFacility(fac);
        }
      });

      marker.addTo(markersLayer);
    });
  }, [facilities, selectedFacility, onSelectFacility]);

  // Draw Route Polyline if facility selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (selectedFacility) {
      const latLngs: L.LatLngExpression[] = [
        [userLat, userLng],
        [selectedFacility.lat, selectedFacility.lng],
      ];

      routeLineRef.current = L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
      }).addTo(map);

      // Fit bounds to show both user and facility
      map.fitBounds(L.latLngBounds(latLngs), { padding: [60, 60], maxZoom: 15 });
    }
  }, [selectedFacility, userLat, userLng]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Recenter button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([userLat, userLng], 14, { animate: true });
          }
        }}
        title="Center on My Location"
        className="absolute bottom-4 right-4 z-[400] bg-slate-900/90 hover:bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>My Location</span>
      </button>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800/80 text-[11px] font-medium text-slate-300 hidden sm:flex items-center gap-3 shadow-lg">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Hospital/ER</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Police</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Fire</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pharmacy</span>
      </div>
    </div>
  );
};
