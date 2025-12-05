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

// Direct subordinates for each role
export const VALID_ASSIGNEES: Record<UserRole, UserRole[]> = {
  'CEO': ['DEO'],
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
    // Mock authentication
    if (password.length >= 4) {
      const mockUsers: Record<UserRole, Omit<User, 'phoneNumber'>> = {
        CEO: {
          id: 'ceo-1',
          role: 'CEO',
          name: 'Mr. Suresh Desai',
          districtId: 'district-1',
        },
        DEO: {
          id: 'deo-1',
          role: 'DEO',
          name: 'Dr. Rajesh Kumar',
          districtId: 'district-1',
        },
        DDEO: {
          id: 'ddeo-1',
          role: 'DDEO',
          name: 'Ms. Priya Sharma',
          districtId: 'district-1',
        },
        AEO: {
          id: 'aeo-1',
          role: 'AEO',
          name: 'Mr. Amit Patel',
          clusterId: 'cluster-1',
          districtId: 'district-1',
        },
        HEAD_TEACHER: {
          id: 'ht-1',
          role: 'HEAD_TEACHER',
          name: 'Mrs. Anjali Singh',
          schoolId: 'school-1',
          schoolName: 'Government Primary School, Zone A',
          clusterId: 'cluster-1',
          districtId: 'district-1',
        },
        TEACHER: {
          id: 'teacher-1',
          role: 'TEACHER',
          name: 'Mr. Vikram Das',
          schoolId: 'school-1',
          schoolName: 'Government Primary School, Zone A',
          clusterId: 'cluster-1',
          districtId: 'district-1',
        },
      };

      const userData = mockUsers[role];
      setUser({
        ...userData,
        phoneNumber,
      });
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
