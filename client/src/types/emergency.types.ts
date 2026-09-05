export type EmergencyCategory =
  | 'medical'
  | 'accident'
  | 'fire'
  | 'crime'
  | 'women_safety'
  | 'child_safety'
  | 'mental_health'
  | 'natural_disaster'
  | 'missing_person'
  | 'other'
  | 'unknown';

export type FacilityCategory =
  | 'hospital'
  | 'emergency_room'
  | 'pharmacy'
  | 'medical_clinic'
  | 'police'
  | 'fire_station'
  | 'ambulance'
  | 'blood_bank'
  | 'shelter';

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  phone?: string;
  isOpen?: boolean;
  rating?: number;
  userRatingsTotal?: number;
  recommendationScore: number;
  recommendationReasons: string[];
  isVerified: boolean;
  estimatedTravelMins?: number;
}

export type EmergencyStatus = 'draft' | 'active' | 'resolved' | 'cancelled';

export interface EmergencySession {
  id: string;
  userId: string;
  category: EmergencyCategory;
  lat: number;
  lng: number;
  accuracy: number;
  status: EmergencyStatus;
  createdAt: string;
  resolvedAt?: string;
  notifiedContactsCount: number;
  selectedFacilityId?: string;
  selectedFacilityName?: string;
  notes?: string;
  actionsTaken: string[];
}

export type ContactPriority = 'primary' | 'secondary';

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: ContactPriority;
  notifyBySms: boolean;
  createdAt: string;
}

export interface LocationShareSession {
  id: string;
  emergencyId: string;
  token: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  lat: number;
  lng: number;
  accuracy: number;
  updatedAt: string;
}

export interface EmergencyProfile {
  userId: string;
  bloodGroup?: string;
  allergies?: string;
  medications?: string;
  medicalConditions?: string;
  emergencyNote?: string;
  preferredLanguage: string;
  organDonor?: boolean;
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
