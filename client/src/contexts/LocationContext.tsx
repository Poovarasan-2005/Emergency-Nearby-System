import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  timestamp: number | null;
  address: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  searchRadiusKm: number;
}

interface LocationContextType extends LocationState {
  refreshLocation: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  setManualLocation: (lat: number, lng: number, addressName?: string) => void;
  setSearchRadiusKm: (radius: number) => void;
  searchAddress: (query: string) => Promise<boolean>;
}

const PRESET_LOCATIONS = [
  { name: 'New York (Manhattan)', lat: 40.7128, lng: -74.0060 },
  { name: 'London (Central)', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo (Shinjuku)', lat: 35.6895, lng: 139.6917 },
  { name: 'Mumbai (South)', lat: 18.9388, lng: 72.8354 },
  { name: 'Sydney (CBD)', lat: -33.8688, lng: 151.2093 },
  { name: 'Paris (Center)', lat: 48.8566, lng: 2.3522 },
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(5);

  const watchIdRef = useRef<number | null>(null);

  // Reverse geocode to get human-friendly locality name
  const fetchAddressForCoords = async (latitude: number, longitude: number) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        { headers: { 'User-Agent': 'EmergencyNearbySystem/1.0' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const readable = data.display_name?.split(',').slice(0, 3).join(',') || 'Detected Location';
        setAddress(readable);
      }
    } catch {
      setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const updateCoordinates = useCallback((latitude: number, longitude: number, acc: number, time: number) => {
    setLat(latitude);
    setLng(longitude);
    setAccuracy(Math.round(acc));
    setTimestamp(time);
    setIsStale(false);
    setError(null);
    setIsLoading(false);
    fetchAddressForCoords(latitude, longitude);
  }, []);

  const refreshLocation = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
      // Fallback to default preset
      updateCoordinates(PRESET_LOCATIONS[0].lat, PRESET_LOCATIONS[0].lng, 100, Date.now());
      return;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus('granted');
          updateCoordinates(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy,
            position.timestamp
          );
          resolve();
        },
        (geoError) => {
          let msg = 'Unable to retrieve location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setPermissionStatus('denied');
            msg = 'Location permission was denied. Please enable GPS or enter location manually.';
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            msg = 'Location information is unavailable on your device.';
          } else if (geoError.code === geoError.TIMEOUT) {
            msg = 'Location request timed out. Retrying or using fallback.';
          }
          setError(msg);
          setIsLoading(false);

          // If no location has ever been set, set a reliable fallback so the user is never stranded
          if (lat === null || lng === null) {
            updateCoordinates(PRESET_LOCATIONS[0].lat, PRESET_LOCATIONS[0].lng, 150, Date.now());
          }
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 5000,
        }
      );
    });
  }, [lat, lng, updateCoordinates]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) return;

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setPermissionStatus('granted');
        updateCoordinates(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy,
          position.timestamp
        );
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );
  }, [updateCoordinates]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const setManualLocation = useCallback((manualLat: number, manualLng: number, addressName?: string) => {
    updateCoordinates(manualLat, manualLng, 25, Date.now());
    if (addressName) {
      setAddress(addressName);
    }
  }, [updateCoordinates]);

  const searchAddress = async (query: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'User-Agent': 'EmergencyNearbySystem/1.0' } }
      );
      if (resp.ok) {
        const results = await resp.json();
        if (results && results.length > 0) {
          const item = results[0];
          const newLat = parseFloat(item.lat);
          const newLng = parseFloat(item.lon);
          updateCoordinates(newLat, newLng, 30, Date.now());
          setAddress(item.display_name?.split(',').slice(0, 3).join(',') || query);
          setIsLoading(false);
          return true;
        }
      }
      setError('Location not found. Please try another query.');
      setIsLoading(false);
      return false;
    } catch {
      setError('Geocoding search failed. Check your network.');
      setIsLoading(false);
      return false;
    }
  };

  // Initial location fetch
  useEffect(() => {
    refreshLocation();
    // Check permission query if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
        result.onchange = () => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          if (result.state === 'granted') {
            refreshLocation();
          }
        };
      }).catch(() => {
        // Ignore permission query failure
      });
    }

    return () => {
      stopTracking();
    };
  }, [refreshLocation, stopTracking]);

  // Periodic staleness check (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (timestamp) {
        const ageMinutes = (Date.now() - timestamp) / 1000 / 60;
        setIsStale(ageMinutes > 3);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <LocationContext.Provider
      value={{
        lat,
        lng,
        accuracy,
        timestamp,
        address,
        permissionStatus,
        isTracking,
        isLoading,
        error,
        isStale,
        searchRadiusKm,
        refreshLocation,
        startTracking,
        stopTracking,
        setManualLocation,
        setSearchRadiusKm,
        searchAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export { PRESET_LOCATIONS };
