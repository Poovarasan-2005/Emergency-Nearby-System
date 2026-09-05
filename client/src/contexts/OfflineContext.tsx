import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  wasOffline: boolean;
  cachedFacilitiesCount: number;
  lastOnlineTimestamp: number | null;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnlineTimestamp, setLastOnlineTimestamp] = useState<number | null>(Date.now());
  const [cachedFacilitiesCount, setCachedFacilitiesCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTimestamp(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    try {
      const stored = localStorage.getItem('ens_cached_facilities');
      if (stored) {
        setCachedFacilitiesCount(JSON.parse(stored).length);
      }
    } catch {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        wasOffline,
        cachedFacilitiesCount,
        lastOnlineTimestamp,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within an OfflineProvider');
  return ctx;
};
