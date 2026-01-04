import React, { createContext, useContext, useState } from 'react';
import { analytics } from '@/lib/analytics';

export type UserRole = 'CEO' | 'DEO' | 'DDEO' | 'AEO' | 'HEAD_TEACHER' | 'TEACHER' | 'COACH';

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
  'DDEO': [],
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
      analytics.identify(userData.id, {
        userId: userData.id,
        role: userData.role,
        schoolId: userData.schoolId,
        clusterId: userData.clusterId,
        districtId: userData.districtId,
      });
      analytics.auth.loggedIn(userData.role, 'admin');
      analytics.auth.sessionStarted(userData.role);
    } catch (error) {
      console.error('Login failed, using mock authentication:', error);

      // TEMPORARY: Mock authentication fallback when database is unavailable
      // This allows testing the DEO dashboard without database connection

      // Import real data for EMIS-based login
      const { realSchools, realHeadmasters } = await import('../data/realData');

      // Check if this is an EMIS-based login (password field contains EMIS number)
      const isEmisLogin = password && !['admin123'].includes(password);

      if (isEmisLogin) {
        // EMIS + Phone login for teachers and headmasters
        const emisNumber = password; // In this mode, password field contains EMIS

        // Find school by EMIS
        const school = realSchools.find(s => s.emisNumber === emisNumber);
        if (!school) {
          throw new Error('Invalid EMIS number');
        }

        // Find headmaster by EMIS and phone
        const headmaster = realHeadmasters.find(
          hm => hm.schoolEmisNumber === emisNumber && hm.phoneNumber === phoneNumber
        );

        if (headmaster) {
          // Head Teacher login
          const user: User = {
            id: headmaster.id,
            phoneNumber: headmaster.phoneNumber,
            role: 'HEAD_TEACHER',
            name: headmaster.name,
            schoolId: headmaster.schoolId,
            schoolName: headmaster.schoolName,
            clusterId: headmaster.clusterId,
            districtId: headmaster.districtId,
          };
          console.log('✓ Mock EMIS authentication successful for Head Teacher:', user.name);
          setUser(user);
          analytics.identify(user.id, {
            userId: user.id,
            role: user.role,
            schoolId: user.schoolId,
            clusterId: user.clusterId,
            districtId: user.districtId,
          });
          analytics.auth.loggedIn(user.role, 'school');
          analytics.auth.sessionStarted(user.role);
          return;
        }

        // If not headmaster, check if it's a teacher from this school
        // Format: Teacher phone numbers are 03003XXXXXX (starting from 03003000001)
        if (phoneNumber.startsWith('03003')) {
          const user: User = {
            id: `teacher-${phoneNumber}`,
            phoneNumber: phoneNumber,
            role: 'TEACHER',
            name: `Teacher - ${school.name}`,
            schoolId: school.code,
            schoolName: school.name,
            clusterId: school.clusterId,
            districtId: school.districtId,
          };
          console.log('✓ Mock EMIS authentication successful for Teacher:', user.name);
          setUser(user);
          analytics.identify(user.id, {
            userId: user.id,
            role: user.role,
            schoolId: user.schoolId,
            clusterId: user.clusterId,
            districtId: user.districtId,
          });
          analytics.auth.loggedIn(user.role, 'school');
          analytics.auth.sessionStarted(user.role);
          return;
        }

        throw new Error('Invalid phone number for this school');
      } else {
        // Standard phone + password login for admin roles
        // Check if this is an AEO phone number (starts with 03001)
        if (phoneNumber.startsWith('03001') && password === 'admin123') {
          const { realAEOs, getSchoolsByCluster } = await import('../data/realData');
          const aeo = realAEOs.find(a => a.phoneNumber === phoneNumber);
          
          if (aeo) {
            // Get schools assigned to this AEO's cluster
            const clusterSchools = getSchoolsByCluster(aeo.clusterId || '');
            const assignedSchoolIds = clusterSchools.map(s => s.code);
            
            const user: User = {
              id: aeo.id,
              phoneNumber: aeo.phoneNumber,
              role: 'AEO',
              name: aeo.name,
              clusterId: aeo.clusterId,
              districtId: 'Rawalpindi',
              assignedSchools: assignedSchoolIds,
            };
            console.log('✓ Mock authentication successful for AEO:', user.name, 'with schools:', assignedSchoolIds);
            setUser(user);
            analytics.identify(user.id, {
              userId: user.id,
              role: user.role,
              clusterId: user.clusterId,
              districtId: user.districtId,
            });
            analytics.auth.loggedIn(user.role, 'admin');
            analytics.auth.sessionStarted(user.role);
            return;
          }
        }

        const mockUsers: Record<string, User> = {
          '03000000001': {
            id: 'mock-ceo-1',
            phoneNumber: '03000000001',
            role: 'CEO',
            name: 'CEO - Chief Executive Officer',
            districtId: 'Rawalpindi',
          },
          '03000000002': {
            id: 'mock-deo-1',
            phoneNumber: '03000000002',
            role: 'DEO',
            name: 'Dr Hajira',
            districtId: 'Rawalpindi',
          },
          '03000000003': {
            id: 'mock-ddeo-1',
            phoneNumber: '03000000003',
            role: 'DDEO',
            name: 'DDEO - Deputy District Education Officer',
            districtId: 'Rawalpindi',
          },
          '03000000004': {
            id: 'mock-coach-1',
            phoneNumber: '03000000004',
            role: 'COACH',
            name: 'Coach - Education Monitor',
            districtId: 'Rawalpindi',
          },
        };

        const mockUser = mockUsers[phoneNumber];

        if (mockUser && password === 'admin123') {
          console.log('✓ Mock authentication successful for:', mockUser.role);
          setUser(mockUser);
          analytics.identify(mockUser.id, {
            userId: mockUser.id,
            role: mockUser.role,
            districtId: mockUser.districtId,
          });
          analytics.auth.loggedIn(mockUser.role, 'admin');
          analytics.auth.sessionStarted(mockUser.role);
        } else {
          throw new Error('Invalid credentials - use phone numbers from seed script with password: admin123');
        }
      }
    }
  };

  const logout = () => {
    analytics.auth.loggedOut();
    analytics.reset();
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
