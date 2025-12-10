import { useState, useCallback } from 'react';

export interface LeaveRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolName: string;
  leaveType: 'sick' | 'casual' | 'earned' | 'special';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  evidenceUrl?: string;
  evidenceFileName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  createdAt: Date;
}

const initialLeaves: LeaveRecord[] = [
  {
    id: 'l1',
    teacherId: 't1',
    teacherName: 'Teacher 1',
    schoolId: 'SCH-001',
    schoolName: 'GGPS Chakra',
    leaveType: 'sick',
    startDate: new Date('2024-12-10'),
    endDate: new Date('2024-12-12'),
    numberOfDays: 3,
    reason: 'Medical treatment required',
    status: 'approved',
    approvedBy: 'ht-1',
    approvedByName: 'Headmaster - GGPS Chakra',
    approvedAt: new Date('2024-12-09'),
    createdAt: new Date('2024-12-08'),
  },
  {
    id: 'l2',
    teacherId: 't2',
    teacherName: 'Teacher 2',
    schoolId: 'SCH-001',
    schoolName: 'GGPS Chakra',
    leaveType: 'casual',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-16'),
    numberOfDays: 2,
    reason: 'Family function',
    status: 'pending',
    createdAt: new Date('2024-12-09'),
  },
  {
    id: 'l3',
    teacherId: 't3',
    teacherName: 'Teacher 3',
    schoolId: 'SCH-002',
    schoolName: 'GGPS Carriage Factory',
    leaveType: 'earned',
    startDate: new Date('2024-12-20'),
    endDate: new Date('2024-12-25'),
    numberOfDays: 6,
    reason: 'Annual vacation',
    status: 'approved',
    approvedBy: 'ht-2',
    approvedByName: 'Headmaster - GGPS Carriage Factory',
    approvedAt: new Date('2024-12-15'),
    createdAt: new Date('2024-12-14'),
  },
  {
    id: 'l4',
    teacherId: 't4',
    teacherName: 'Teacher 4',
    schoolId: 'SCH-001',
    schoolName: 'GGPS Chakra',
    leaveType: 'special',
    startDate: new Date('2024-12-18'),
    endDate: new Date('2024-12-18'),
    numberOfDays: 1,
    reason: 'Emergency',
    status: 'pending',
    createdAt: new Date('2024-12-10'),
  },
];

export function useLeaveRecords() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>(initialLeaves);

  const getApprovedLeaves = useCallback(() => {
    return leaves.filter(l => l.status === 'approved');
  }, [leaves]);

  const getPendingLeaves = useCallback((schoolId?: string) => {
    return leaves.filter(l => {
      if (schoolId && l.schoolId !== schoolId) return false;
      return l.status === 'pending';
    });
  }, [leaves]);

  const getLeavesBySchool = useCallback((schoolId: string) => {
    return leaves.filter(l => l.schoolId === schoolId);
  }, [leaves]);

  const getLeavesByDate = useCallback((date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return leaves.filter(l => {
      if (l.status !== 'approved') return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
  }, [leaves]);

  const addLeave = useCallback((leave: Omit<LeaveRecord, 'id' | 'createdAt'>) => {
    const newLeave: LeaveRecord = {
      ...leave,
      id: `l${Date.now()}`,
      createdAt: new Date(),
    };
    setLeaves(prev => [...prev, newLeave]);
    return newLeave;
  }, []);

  const approveLeave = useCallback((leaveId: string, approvedBy: string, approvedByName: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        return {
          ...l,
          status: 'approved' as const,
          approvedBy,
          approvedByName,
          approvedAt: new Date(),
        };
      }
      return l;
    }));
  }, []);

  const rejectLeave = useCallback((leaveId: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        return { ...l, status: 'rejected' as const };
      }
      return l;
    }));
  }, []);

  const updateLeave = useCallback((leaveId: string, updates: Partial<LeaveRecord>) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        return { ...l, ...updates };
      }
      return l;
    }));
  }, []);

  return {
    leaves,
    getApprovedLeaves,
    getPendingLeaves,
    getLeavesBySchool,
    getLeavesByDate,
    addLeave,
    approveLeave,
    rejectLeave,
    updateLeave,
  };
}
