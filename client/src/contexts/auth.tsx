import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'CEO' | 'DEO' | 'DDEO' | 'AEO' | 'HEAD_TEACHER' | 'TEACHER';

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  name: string;
  schoolId?: string;
  schoolName?: string;
  clusterId?: string;
  districtId?: string;
}

// Hierarchy: CEO > DEO > DDEO/AEO > HEAD_TEACHER > TEACHER
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'CEO': 5,
  'DEO': 4,
  'DDEO': 3,
  'AEO': 3,
  'HEAD_TEACHER': 2,
  'TEACHER': 1,
};

// Direct subordinates for each role - CEO can assign to anyone in the hierarchy
export const VALID_ASSIGNEES: Record<UserRole, UserRole[]> = {
  'CEO': ['DEO', 'DDEO', 'AEO', 'HEAD_TEACHER', 'TEACHER'],
  'DEO': ['DDEO', 'AEO'],
  'DDEO': [],
  'AEO': ['HEAD_TEACHER'],
  'HEAD_TEACHER': ['TEACHER'],
  'TEACHER': [],
};

interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string, role: UserRole, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (phoneNumber: string, role: UserRole, password: string) => {
    // Real authentication with API
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
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
