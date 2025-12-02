import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'DEO' | 'DDEO' | 'AEO' | 'HEAD_TEACHER' | 'TEACHER';

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  name: string;
  schoolId?: string;
  schoolName?: string;
  clusterId?: string;
}

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
        DEO: {
          id: 'deo-1',
          role: 'DEO',
          name: 'Dr. Rajesh Kumar',
        },
        DDEO: {
          id: 'ddeo-1',
          role: 'DDEO',
          name: 'Ms. Priya Sharma',
        },
        AEO: {
          id: 'aeo-1',
          role: 'AEO',
          name: 'Mr. Amit Patel',
          clusterId: 'cluster-1',
        },
        HEAD_TEACHER: {
          id: 'ht-1',
          role: 'HEAD_TEACHER',
          name: 'Mrs. Anjali Singh',
          schoolId: 'school-1',
          schoolName: 'Government Primary School, Zone A',
        },
        TEACHER: {
          id: 'teacher-1',
          role: 'TEACHER',
          name: 'Mr. Vikram Das',
          schoolId: 'school-1',
          schoolName: 'Government Primary School, Zone A',
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
