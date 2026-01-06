import React, { createContext, useContext, useState, useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export type UserRole = 'CEO' | 'DEO' | 'DDEO' | 'AEO' | 'HEAD_TEACHER' | 'TEACHER' | 'COACH';

const USER_STORAGE_KEY = 'taleemhub_user';

export interface User {
  id: string;
  phoneNumber: string;
  password?: string;
  role: UserRole;
  name: string;
  status?: 'pending' | 'active' | 'restricted';
  schoolId?: string;
  schoolName?: string;
  clusterId?: string;
  districtId?: string;
  // Profile fields
  fatherName?: string;
  email?: string;
  residentialAddress?: string;
  cnic?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  qualification?: string;
  profilePicture?: string;
  assignedSchools?: string[];
  markaz?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Hierarchy: CEO > DEO > DDEO/AEO/COACH > HEAD_TEACHER > TEACHER
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'CEO': 5,
  'DEO': 4,
  'DDEO': 3,
  'AEO': 3,
  'COACH': 3, // Same viewing level as AEO, but read-only
  'HEAD_TEACHER': 2,
  'TEACHER': 1,
};

// Direct subordinates for each role - CEO can assign to anyone, DEO can assign to everyone except CEO
export const VALID_ASSIGNEES: Record<UserRole, UserRole[]> = {
  'CEO': ['DEO', 'DDEO', 'AEO', 'HEAD_TEACHER', 'TEACHER'], // CEO is the king - can assign to anyone
  'DEO': ['DDEO', 'AEO', 'HEAD_TEACHER', 'TEACHER'], // DEO can assign from DDEO down to Teacher
  'DDEO': ['AEO', 'HEAD_TEACHER', 'TEACHER'], // DDEO can assign to AEOs and below
  'AEO': ['HEAD_TEACHER'],
  'HEAD_TEACHER': ['TEACHER'],
  'TEACHER': [],
  'COACH': [], // Cannot assign tasks to anyone
};

interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string, role: UserRole, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage on first render
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
    return null;
  });

  // Re-identify user with PostHog when session is restored or user changes
  useEffect(() => {
    if (user && user.phoneNumber) {
      analytics.identify(user.phoneNumber, {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.schoolName,
        clusterId: user.clusterId,
        districtId: user.districtId,
      });
    }
  }, [user]);

  // Sync user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = async (phoneNumber: string, role: UserRole, password: string) => {
    // Real authentication with API - no mock fallback
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(errorData.error || 'Invalid credentials');
    }

    const userData = await response.json();
    setUser(userData);
    // Use phone number as the distinct_id for PostHog tracking
    analytics.identify(userData.phoneNumber, {
      userId: userData.id,
      phoneNumber: userData.phoneNumber,
      name: userData.name,
      role: userData.role,
      schoolId: userData.schoolId,
      schoolName: userData.schoolName,
      clusterId: userData.clusterId,
      districtId: userData.districtId,
    });
    analytics.auth.loggedIn(userData.role, 'admin');
    analytics.auth.sessionStarted(userData.role);
  };

  const logout = () => {
    analytics.auth.loggedOut();
    analytics.reset();
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
