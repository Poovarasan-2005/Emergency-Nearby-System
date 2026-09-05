import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  EmergencyCategory,
  EmergencySession,
  EmergencyStatus,
  Facility,
  LocationShareSession,
  TrustedContact,
  EmergencyProfile,
} from '../types/emergency.types';
import { useLocation } from './LocationContext';
import { useAuth } from './AuthContext';
import { emergencyAudio } from '../utils/emergencyAudio';

interface EmergencyContextType {
  status: 'idle' | 'countdown' | 'active' | 'resolved' | 'cancelled';
  countdownSeconds: number;
  activeSession: EmergencySession | null;
  selectedCategory: EmergencyCategory;
  emergencyHistory: EmergencySession[];
  trustedContacts: TrustedContact[];
  liveShareSession: LocationShareSession | null;
  emergencyProfile: EmergencyProfile;
  startSosCountdown: (category?: EmergencyCategory) => void;
  cancelSosCountdown: () => void;
  activateSosImmediately: (category?: EmergencyCategory) => void;
  resolveEmergency: (notes?: string) => Promise<void>;
  cancelEmergency: (reason?: string) => Promise<void>;
  setSelectedCategory: (cat: EmergencyCategory) => void;
  selectFacilityForEmergency: (facility: Facility) => void;
  createLiveShareSession: (durationMinutes?: number) => LocationShareSession;
  revokeLiveShareSession: () => void;
  addTrustedContact: (contact: Omit<TrustedContact, 'id' | 'userId' | 'createdAt'>) => void;
  updateTrustedContact: (id: string, updates: Partial<TrustedContact>) => void;
  deleteTrustedContact: (id: string) => void;
  testAlertContact: (contact: TrustedContact) => { success: boolean; message: string; previewUrl: string };
  updateEmergencyProfile: (updates: Partial<EmergencyProfile>) => void;
}

const STORAGE_KEY_SESSIONS = 'ens_emergency_sessions';
const STORAGE_KEY_CONTACTS = 'ens_trusted_contacts';
const STORAGE_KEY_PROFILE = 'ens_emergency_profile';

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lat, lng, accuracy, startTracking, stopTracking } = useLocation();
  const { user } = useAuth();

  const [status, setStatus] = useState<'idle' | 'countdown' | 'active' | 'resolved' | 'cancelled'>('idle');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('unknown');
  const [activeSession, setActiveSession] = useState<EmergencySession | null>(null);
  const [liveShareSession, setLiveShareSession] = useState<LocationShareSession | null>(null);

  const countdownTimerRef = useRef<any>(null);

  // Load Trusted Contacts
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'tc-1',
        userId: 'demo-user-123',
        name: 'Elena Rostova (Mother)',
        relationship: 'Mother',
        phone: '+1 (555) 432-8901',
        email: 'elena.rostova@example.com',
        priority: 'primary',
        notifyBySms: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tc-2',
        userId: 'demo-user-123',
        name: 'David Miller (Partner)',
        relationship: 'Partner',
        phone: '+1 (555) 789-0123',
        email: 'david.m@example.com',
        priority: 'secondary',
        notifyBySms: true,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Load Emergency History
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencySession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'emg-hist-01',
        userId: 'demo-user-123',
        category: 'medical',
        lat: 40.7128,
        lng: -74.006,
        accuracy: 15,
        status: 'resolved',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        resolvedAt: new Date(Date.now() - 7 * 86400000 + 45 * 60000).toISOString(),
        notifiedContactsCount: 2,
        selectedFacilityId: 'fac-1',
        selectedFacilityName: 'Metropolitan General Hospital',
        notes: 'Arrived at emergency triage. Stable condition.',
        actionsTaken: ['SOS Triggered', 'Contacts Notified', 'Route Initiated', 'Resolved by User'],
      },
    ];
  });

  // Load Emergency Profile
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      userId: user?.uid || 'demo-user-123',
      bloodGroup: 'O+',
      allergies: 'Penicillin, Peanuts',
      medications: 'Albuterol Inhaler (Asthma)',
      medicalConditions: 'Mild Asthma',
      emergencyNote: 'Carry emergency epinephrine autoinjector in bag side pocket.',
      preferredLanguage: 'English',
      organDonor: true,
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(trustedContacts));
  }, [trustedContacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(emergencyHistory));
  }, [emergencyHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(emergencyProfile));
  }, [emergencyProfile]);

  const commitEmergencyActivation = useCallback((category: EmergencyCategory) => {
    const sessionLat = lat ?? 40.7128;
    const sessionLng = lng ?? -74.006;
    const sessionAcc = accuracy ?? 25;

    const newSession: EmergencySession = {
      id: `SOS-${Date.now().toString(36).toUpperCase()}`,
      userId: user?.uid || 'anonymous',
      category: category,
      lat: sessionLat,
      lng: sessionLng,
      accuracy: sessionAcc,
      status: 'active',
      createdAt: new Date().toISOString(),
      notifiedContactsCount: trustedContacts.length,
      actionsTaken: [
        'Emergency SOS Activated',
        `GPS Coordinates Captured (${sessionLat.toFixed(4)}, ${sessionLng.toFixed(4)})`,
        `Notified ${trustedContacts.length} Trusted Contact(s)`,
      ],
    };

    setActiveSession(newSession);
    setStatus('active');
    startTracking();
    emergencyAudio.playSosAlarm();

    // Auto-generate live sharing token
    const token = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const share: LocationShareSession = {
      id: `share-${Date.now().toString(36)}`,
      emergencyId: newSession.id,
      token,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      status: 'active',
      lat: sessionLat,
      lng: sessionLng,
      accuracy: sessionAcc,
      updatedAt: new Date().toISOString(),
    };
    setLiveShareSession(share);
  }, [lat, lng, accuracy, user, trustedContacts, startTracking]);

  const startSosCountdown = useCallback((category: EmergencyCategory = 'unknown') => {
    setSelectedCategory(category);
    setStatus('countdown');
    setCountdownSeconds(5);
    emergencyAudio.playCountdownBeep(880, 200);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    let remaining = 5;
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdownSeconds(remaining);
      emergencyAudio.playCountdownBeep(remaining === 0 ? 1200 : 880, 200);

      if (remaining <= 0) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        commitEmergencyActivation(category);
      }
    }, 1000);
  }, [commitEmergencyActivation]);

  const cancelSosCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setStatus('idle');
    setCountdownSeconds(5);
  }, []);

  const activateSosImmediately = useCallback((category: EmergencyCategory = 'unknown') => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setSelectedCategory(category);
    commitEmergencyActivation(category);
  }, [commitEmergencyActivation]);

  const resolveEmergency = async (notes?: string): Promise<void> => {
    if (!activeSession) return;
    const resolved: EmergencySession = {
      ...activeSession,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      notes: notes || 'Resolved safely by user.',
      actionsTaken: [...activeSession.actionsTaken, 'Emergency Marked Resolved by User'],
    };

    setEmergencyHistory((prev) => [resolved, ...prev]);
    setActiveSession(null);
    setStatus('resolved');
    stopTracking();
    emergencyAudio.playSuccessChime();
    if (liveShareSession) {
      setLiveShareSession({ ...liveShareSession, status: 'expired' });
    }
  };

  const cancelEmergency = async (reason?: string): Promise<void> => {
    if (!activeSession) return;
    const cancelled: EmergencySession = {
      ...activeSession,
      status: 'cancelled',
      resolvedAt: new Date().toISOString(),
      notes: reason || 'Cancelled by user.',
      actionsTaken: [...activeSession.actionsTaken, 'Emergency Cancelled by User'],
    };

    setEmergencyHistory((prev) => [cancelled, ...prev]);
    setActiveSession(null);
    setStatus('cancelled');
    stopTracking();
    if (liveShareSession) {
      setLiveShareSession({ ...liveShareSession, status: 'revoked' });
    }
  };

  const selectFacilityForEmergency = (facility: Facility) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      selectedFacilityId: facility.id,
      selectedFacilityName: facility.name,
      actionsTaken: [...activeSession.actionsTaken, `Selected Destination: ${facility.name}`],
    });
  };

  const createLiveShareSession = (durationMinutes: number = 20): LocationShareSession => {
    const token = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newShare: LocationShareSession = {
      id: `share-${Date.now().toString(36)}`,
      emergencyId: activeSession?.id || 'manual-session',
      token,
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      status: 'active',
      lat: lat ?? 40.7128,
      lng: lng ?? -74.006,
      accuracy: accuracy ?? 20,
      updatedAt: new Date().toISOString(),
    };
    setLiveShareSession(newShare);
    return newShare;
  };

  const revokeLiveShareSession = () => {
    if (liveShareSession) {
      setLiveShareSession({ ...liveShareSession, status: 'revoked' });
    }
  };

  const addTrustedContact = (contact: Omit<TrustedContact, 'id' | 'userId' | 'createdAt'>) => {
    const newContact: TrustedContact = {
      ...contact,
      id: `tc-${Date.now().toString(36)}`,
      userId: user?.uid || 'demo-user-123',
      createdAt: new Date().toISOString(),
    };
    setTrustedContacts((prev) => [newContact, ...prev]);
  };

  const updateTrustedContact = (id: string, updates: Partial<TrustedContact>) => {
    setTrustedContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteTrustedContact = (id: string) => {
    setTrustedContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const testAlertContact = (contact: TrustedContact) => {
    const shareLink = `${window.location.origin}/share/demo-secure-token`;
    const message = `EMERGENCY TEST ALERT: This is a test notification from ${user?.name || 'User'} via Emergency Nearby System. Current location: ${shareLink}`;
    const previewUrl = `sms:${encodeURIComponent(contact.phone)}?body=${encodeURIComponent(message)}`;
    return {
      success: true,
      message: `Simulated notification sent to ${contact.name} (${contact.phone}). In a real emergency, SMS gateway dispatches coordinates automatically.`,
      previewUrl,
    };
  };

  const updateEmergencyProfile = (updates: Partial<EmergencyProfile>) => {
    setEmergencyProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <EmergencyContext.Provider
      value={{
        status,
        countdownSeconds,
        activeSession,
        selectedCategory,
        emergencyHistory,
        trustedContacts,
        liveShareSession,
        emergencyProfile,
        startSosCountdown,
        cancelSosCountdown,
        activateSosImmediately,
        resolveEmergency,
        cancelEmergency,
        setSelectedCategory,
        selectFacilityForEmergency,
        createLiveShareSession,
        revokeLiveShareSession,
        addTrustedContact,
        updateTrustedContact,
        deleteTrustedContact,
        testAlertContact,
        updateEmergencyProfile,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = (): EmergencyContextType => {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency must be used within an EmergencyProvider');
  return ctx;
};
