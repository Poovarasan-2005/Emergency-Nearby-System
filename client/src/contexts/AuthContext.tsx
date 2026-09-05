import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/emergency.types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string, requestedRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, phone?: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resendVerification: () => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  isDemoMode: boolean;
}

const STORAGE_KEY = 'ens_user_session';

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  USER: {
    uid: 'demo-user-123',
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    phone: '+1 (555) 234-5678',
    role: 'USER',
    emailVerified: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  ADMIN: {
    uid: 'demo-admin-456',
    name: 'Dispatcher Miller',
    email: 'dispatcher.miller@emergency.system',
    phone: '+1 (555) 911-0001',
    role: 'ADMIN',
    emailVerified: true,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  SUPER_ADMIN: {
    uid: 'demo-superadmin-789',
    name: 'Director Vance',
    email: 'director.vance@emergency.system',
    phone: '+1 (555) 999-9999',
    role: 'SUPER_ADMIN',
    emailVerified: true,
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode] = useState<boolean>(true);

  useEffect(() => {
    // Load stored session if exists
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // User starts unauthenticated so they can experience the Home / Landing page
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, pass: string, requestedRole?: UserRole): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));

    if (!email || !pass) {
      setIsLoading(false);
      setError('Email and password are required.');
      return { success: false, message: 'Email and password are required.' };
    }

    // Role detection: requested role, demo users, or keyword detection
    let role: UserRole = requestedRole || 'USER';
    if (!requestedRole) {
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('dispatcher')) {
        role = 'ADMIN';
      } else if (email.toLowerCase().includes('director') || email.toLowerCase().includes('super')) {
        role = 'SUPER_ADMIN';
      }
    }

    const authenticatedUser: UserProfile = {
      uid: `usr_${Date.now().toString(36)}`,
      name: email.split('@')[0].replace('.', ' ').replace(/^\w/, (c) => c.toUpperCase()),
      email,
      phone: '+1 (555) 019-2834',
      role,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    saveUserSession(authenticatedUser);
    setIsLoading(false);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    phone?: string,
    role: UserRole = 'USER'
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));

    if (!email || !pass || !name) {
      setIsLoading(false);
      setError('All required fields must be filled.');
      return { success: false, message: 'All required fields must be filled.' };
    }

    if (pass.length < 6) {
      setIsLoading(false);
      setError('Password must be at least 6 characters.');
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const newUser: UserProfile = {
      uid: `usr_${Date.now().toString(36)}`,
      name,
      email,
      phone: phone || '',
      role,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = async (): Promise<void> => {
    saveUserSession(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    return { success: true, message: 'Password reset link sent to your email.' };
  };

  const resendVerification = async (): Promise<{ success: boolean; message?: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    if (user) {
      saveUserSession({ ...user, emailVerified: true });
    }
    return { success: true, message: 'Verification email sent. Account marked verified.' };
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUserSession(updated);
  };

  const switchDemoRole = (role: UserRole) => {
    saveUserSession(DEMO_USERS[role]);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        isLoading,
        error,
        login,
        register,
        logout,
        resetPassword,
        resendVerification,
        updateUserProfile,
        switchDemoRole,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
