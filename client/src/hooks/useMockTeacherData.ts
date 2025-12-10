import { useState, useCallback } from 'react';

export interface Teacher {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  status: 'present' | 'on_leave' | 'absent';
}

export interface LeaveRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  leaveType: 'sick' | 'casual' | 'earned' | 'special';
  startDate: Date;
  endDate: Date;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
  school: string;
}

export interface SchoolData {
  id: string;
  name: string;
  district: string;
  block: string;
  principalName: string;
  totalStudents: number;
  totalTeachers: number;
  infrastructure: {
    classrooms: number;
    toilets: number;
    waterSource: boolean;
    electricity: boolean;
  };
  enrollment: {
    boys: number;
    girls: number;
  };
  compliance: number; // percentage
}

const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Teacher 1', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'Mathematics', status: 'present' },
  { id: 't2', name: 'Teacher 2', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'English', status: 'present' },
  { id: 't3', name: 'Teacher 3', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'Science', status: 'on_leave' },
  { id: 't4', name: 'Teacher 4', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'Social Studies', status: 'present' },
  { id: 't5', name: 'Teacher 5', schoolId: 'SCH-002', schoolName: 'GGPS Carriage Factory', subject: 'Urdu', status: 'absent' },
  { id: 't6', name: 'Teacher 6', schoolId: 'SCH-002', schoolName: 'GGPS Carriage Factory', subject: 'Mathematics', status: 'present' },
  { id: 't7', name: 'Teacher 7', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Physics', status: 'on_leave' },
  { id: 't8', name: 'Teacher 8', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Chemistry', status: 'present' },
  { id: 't9', name: 'Teacher 9', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Biology', status: 'present' },
  { id: 't10', name: 'Teacher 10', schoolId: 'SCH-002', schoolName: 'GGPS Carriage Factory', subject: 'English', status: 'on_leave' },
];

const mockLeaves: LeaveRecord[] = [
  { id: 'l1', teacherId: 't3', teacherName: 'Teacher 3', leaveType: 'sick', startDate: new Date('2024-12-02'), endDate: new Date('2024-12-03'), status: 'approved', reason: 'Fever', school: 'GGPS Chakra' },
  { id: 'l2', teacherId: 't7', teacherName: 'Teacher 7', leaveType: 'earned', startDate: new Date('2024-12-02'), endDate: new Date('2024-12-02'), status: 'approved', reason: 'Personal', school: 'GES JAWA' },
  { id: 'l3', teacherId: 't10', teacherName: 'Teacher 10', leaveType: 'casual', startDate: new Date('2024-12-02'), endDate: new Date('2024-12-04'), status: 'approved', reason: 'Family work', school: 'GGPS Carriage Factory' },
  { id: 'l4', teacherId: 't1', teacherName: 'Teacher 1', leaveType: 'casual', startDate: new Date('2024-12-05'), endDate: new Date('2024-12-06'), status: 'pending', reason: 'Travel', school: 'GGPS Chakra' },
];

const mockSchools: SchoolData[] = [
  {
    id: 'SCH-001',
    name: 'GGPS Chakra',
    district: 'Rawalpindi',
    block: 'Cluster 1',
    principalName: 'Headmaster - GGPS Chakra',
    totalStudents: 345,
    totalTeachers: 12,
    infrastructure: { classrooms: 8, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 185, girls: 160 },
    compliance: 92,
  },
  {
    id: 'SCH-002',
    name: 'GGPS Carriage Factory',
    district: 'Rawalpindi',
    block: 'Cluster 2',
    principalName: 'Headmaster - GGPS Carriage Factory',
    totalStudents: 512,
    totalTeachers: 18,
    infrastructure: { classrooms: 12, toilets: 6, waterSource: true, electricity: true },
    enrollment: { boys: 280, girls: 232 },
    compliance: 88,
  },
  {
    id: 'SCH-003',
    name: 'GES JAWA',
    district: 'Rawalpindi',
    block: 'Cluster 3',
    principalName: 'Headmaster - GES JAWA',
    totalStudents: 687,
    totalTeachers: 25,
    infrastructure: { classrooms: 18, toilets: 10, waterSource: true, electricity: true },
    enrollment: { boys: 375, girls: 312 },
    compliance: 95,
  },
];

export function useMockTeacherData() {
  const [teachers] = useState<Teacher[]>(mockTeachers);
  const [leaves] = useState<LeaveRecord[]>(mockLeaves);
  const [schools] = useState<SchoolData[]>(mockSchools);

  const getTeacherStats = useCallback(() => {
    const today = new Date();
    const totalTeachers = teachers.length;
    const presentToday = teachers.filter((t) => t.status === 'present').length;
    const onLeaveToday = teachers.filter((t) => t.status === 'on_leave').length;
    const absentToday = teachers.filter((t) => t.status === 'absent').length;

    return { totalTeachers, presentToday, onLeaveToday, absentToday };
  }, [teachers]);

  const getLeavesByDate = useCallback(
    (date: Date) => {
      return leaves.filter((l) => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date >= start && date <= end;
      });
    },
    [leaves]
  );

  const getPendingLeaves = useCallback(() => {
    return leaves.filter((l) => l.status === 'pending');
  }, [leaves]);

  const getSchoolData = useCallback(() => {
    return schools;
  }, [schools]);

  const getSchoolById = useCallback(
    (schoolId: string) => {
      return schools.find((s) => s.id === schoolId);
    },
    [schools]
  );

  return {
    teachers,
    leaves,
    schools,
    getTeacherStats,
    getLeavesByDate,
    getPendingLeaves,
    getSchoolData,
    getSchoolById,
  };
}
