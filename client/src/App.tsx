import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider, useLocation } from './contexts/LocationContext';
import { EmergencyProvider, useEmergency } from './contexts/EmergencyContext';
import { VoiceAssistantProvider } from './contexts/VoiceAssistantContext';
import { OfflineProvider } from './contexts/OfflineContext';

import { Navbar } from './components/layout/Navbar';
import { LocationStatusBanner } from './components/layout/LocationStatusBanner';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { SOSConfirmationModal } from './components/sos/SOSConfirmationModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { AuthModal } from './components/auth/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { SosActivePage } from './pages/SosActivePage';
import { LiveShareViewPage } from './pages/LiveShareViewPage';
import { TrustedContactsPage } from './pages/TrustedContactsPage';
import { EmergencyHistoryPage } from './pages/EmergencyHistoryPage';
import { EmergencyProfilePage } from './pages/EmergencyProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { fetchNearbyFacilities } from './services/facilitiesService';
import { Facility, EmergencyCategory } from './types/emergency.types';
import { AlertOctagon, Phone } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { lat, lng, searchRadiusKm } = useLocation();
  const { status, activeSession, selectedCategory, setSelectedCategory } = useEmergency();

  // Initialize view: landing page by default if unauthenticated, dashboard/admin if session exists
  const [currentTab, setCurrentTab] = useState<string>(user ? (user.role === 'ADMIN' ? 'admin' : 'dashboard') : 'landing');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);

  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<any>('USER');
  const [shareTokenPreview, setShareTokenPreview] = useState<string | null>(null);

  // Sync tab on auth changes
  useEffect(() => {
    if (user && currentTab === 'landing') {
      setCurrentTab(user.role === 'ADMIN' ? 'admin' : 'dashboard');
    }
  }, [user]);

  // Check URL path on mount for /share/:token
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const token = path.replace('/share/', '');
      if (token) {
        setShareTokenPreview(token);
        setCurrentTab('share');
      }
    }
  }, []);

  // Fetch facilities when lat/lng/radius changes
  const loadFacilities = async () => {
    if (!lat || !lng) return;
    setIsLoadingFacilities(true);
    try {
      const results = await fetchNearbyFacilities(lat, lng, searchRadiusKm, 'all', selectedCategory);
      setFacilities(results);
    } catch (err) {
      console.error('Failed to fetch facilities', err);
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, [lat, lng, searchRadiusKm, selectedCategory]);

  const handleOpenAuth = (mode: 'login' | 'register', role: any = 'USER') => {
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (role: any) => {
    setIsAuthOpen(false);
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // If viewing tokenized live share
  if (currentTab === 'share' && shareTokenPreview) {
    return (
      <LiveShareViewPage
        token={shareTokenPreview}
        onExitShareView={() => {
          setShareTokenPreview(null);
          setCurrentTab(user ? 'dashboard' : 'landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-rose-500 selection:text-white">
      {/* Persistent SOS Status Banner if emergency is active */}
      {status === 'active' && activeSession && (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-2xl animate-pulse">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-white" />
            <span>EMERGENCY SOS BROADCAST ACTIVE ({activeSession.id})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('sos_active')}
              className="px-3 py-1 bg-white text-red-700 rounded-lg text-xs font-black shadow hover:bg-slate-100 transition-all"
            >
              Open Incident HUD
            </button>
            <a
              href="tel:911"
              className="px-3 py-1 bg-red-950 text-white rounded-lg text-xs font-black flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>911</span>
            </a>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Location Status Bar (Hidden on landing or share) */}
      {currentTab !== 'landing' && <LocationStatusBanner />}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {status === 'active' && currentTab === 'sos_active' ? (
          <SosActivePage
            facilities={facilities}
            onOpenMap={() => setCurrentTab('map')}
          />
        ) : currentTab === 'landing' ? (
          <LandingPage
            onFindHelp={() => setCurrentTab('dashboard')}
            onOpenAuth={handleOpenAuth}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardPage
            facilities={facilities}
            isLoadingFacilities={isLoadingFacilities}
            onRefreshFacilities={loadFacilities}
            onNavigateTab={setCurrentTab}
          />
        ) : currentTab === 'map' ? (
          <MapPage facilities={facilities} />
        ) : currentTab === 'contacts' ? (
          <TrustedContactsPage />
        ) : currentTab === 'history' ? (
          <EmergencyHistoryPage />
        ) : currentTab === 'profile' ? (
          <EmergencyProfilePage />
        ) : currentTab === 'admin' ? (
          <AdminDashboardPage />
        ) : (
          <DashboardPage
            facilities={facilities}
            isLoadingFacilities={isLoadingFacilities}
            onRefreshFacilities={loadFacilities}
            onNavigateTab={setCurrentTab}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {currentTab !== 'landing' && (
        <MobileBottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />
      )}

      {/* Modal Dialogs & Drawers */}
      <SOSConfirmationModal />

      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        facilities={facilities}
        onSelectCategory={(cat: EmergencyCategory) => {
          setSelectedCategory(cat);
          setIsAIOpen(false);
          setCurrentTab('dashboard');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authInitialMode}
        initialRole={authInitialRole}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <EmergencyProvider>
          <VoiceAssistantProvider>
            <OfflineProvider>
              <MainAppContent />
            </OfflineProvider>
          </VoiceAssistantProvider>
        </EmergencyProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
