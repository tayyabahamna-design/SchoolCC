import { useState, useCallback } from 'react';

export interface Teacher {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  status: 'present' | 'on_leave' | 'absent';
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'AEO' | 'HEAD_TEACHER' | 'TEACHER';
  schoolId?: string;
  schoolName?: string;
  clusterId?: string;
  clusterName?: string;
  subject?: string;
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
  // Excellent Performance (90%+) - 4 schools
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
    compliance: 95,
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
    compliance: 93,
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
    compliance: 92,
  },
  {
    id: 'SCH-004',
    name: 'GGPS Dhok Munshi',
    district: 'Rawalpindi',
    block: 'Cluster 4',
    principalName: 'Headmaster - GGPS Dhok Munshi',
    totalStudents: 420,
    totalTeachers: 15,
    infrastructure: { classrooms: 10, toilets: 5, waterSource: true, electricity: true },
    enrollment: { boys: 220, girls: 200 },
    compliance: 91,
  },

  // Good Performance (80-89%) - 8 schools
  {
    id: 'SCH-005',
    name: 'GPS Millat Islamia',
    district: 'Rawalpindi',
    block: 'Cluster 5',
    principalName: 'Headmaster - GPS Millat Islamia',
    totalStudents: 380,
    totalTeachers: 14,
    infrastructure: { classrooms: 9, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 200, girls: 180 },
    compliance: 88,
  },
  {
    id: 'SCH-006',
    name: 'GGPS Banni',
    district: 'Rawalpindi',
    block: 'Cluster 6',
    principalName: 'Headmaster - GGPS Banni',
    totalStudents: 290,
    totalTeachers: 11,
    infrastructure: { classrooms: 7, toilets: 3, waterSource: true, electricity: false },
    enrollment: { boys: 155, girls: 135 },
    compliance: 86,
  },
  {
    id: 'SCH-007',
    name: 'GGPS Dhoke Syedan',
    district: 'Rawalpindi',
    block: 'Cluster 7',
    principalName: 'Headmaster - GGPS Dhoke Syedan',
    totalStudents: 325,
    totalTeachers: 13,
    infrastructure: { classrooms: 8, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 170, girls: 155 },
    compliance: 85,
  },
  {
    id: 'SCH-008',
    name: 'GPS Sihala',
    district: 'Rawalpindi',
    block: 'Cluster 8',
    principalName: 'Headmaster - GPS Sihala',
    totalStudents: 455,
    totalTeachers: 16,
    infrastructure: { classrooms: 11, toilets: 5, waterSource: true, electricity: true },
    enrollment: { boys: 240, girls: 215 },
    compliance: 84,
  },
  {
    id: 'SCH-009',
    name: 'GGPS Misrial',
    district: 'Rawalpindi',
    block: 'Cluster 9',
    principalName: 'Headmaster - GGPS Misrial',
    totalStudents: 310,
    totalTeachers: 12,
    infrastructure: { classrooms: 8, toilets: 3, waterSource: true, electricity: false },
    enrollment: { boys: 165, girls: 145 },
    compliance: 83,
  },
  {
    id: 'SCH-010',
    name: 'GPS Dhoke Kashmirian',
    district: 'Rawalpindi',
    block: 'Cluster 10',
    principalName: 'Headmaster - GPS Dhoke Kashmirian',
    totalStudents: 275,
    totalTeachers: 10,
    infrastructure: { classrooms: 7, toilets: 3, waterSource: true, electricity: true },
    enrollment: { boys: 145, girls: 130 },
    compliance: 82,
  },
  {
    id: 'SCH-011',
    name: 'GGPS Kotha Kalan',
    district: 'Rawalpindi',
    block: 'Cluster 11',
    principalName: 'Headmaster - GGPS Kotha Kalan',
    totalStudents: 340,
    totalTeachers: 13,
    infrastructure: { classrooms: 9, toilets: 4, waterSource: false, electricity: true },
    enrollment: { boys: 180, girls: 160 },
    compliance: 81,
  },
  {
    id: 'SCH-012',
    name: 'GPS Sadiqabad',
    district: 'Rawalpindi',
    block: 'Cluster 12',
    principalName: 'Headmaster - GPS Sadiqabad',
    totalStudents: 395,
    totalTeachers: 14,
    infrastructure: { classrooms: 10, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 210, girls: 185 },
    compliance: 80,
  },

  // Needs Attention (<80%) - 4 schools
  {
    id: 'SCH-013',
    name: 'GGPS Dhok Ratta',
    district: 'Rawalpindi',
    block: 'Cluster 13',
    principalName: 'Headmaster - GGPS Dhok Ratta',
    totalStudents: 245,
    totalTeachers: 9,
    infrastructure: { classrooms: 6, toilets: 2, waterSource: false, electricity: false },
    enrollment: { boys: 130, girls: 115 },
    compliance: 78,
  },
  {
    id: 'SCH-014',
    name: 'GPS Dhoke Hassu',
    district: 'Rawalpindi',
    block: 'Cluster 1',
    principalName: 'Headmaster - GPS Dhoke Hassu',
    totalStudents: 220,
    totalTeachers: 8,
    infrastructure: { classrooms: 6, toilets: 2, waterSource: true, electricity: false },
    enrollment: { boys: 115, girls: 105 },
    compliance: 75,
  },
  {
    id: 'SCH-015',
    name: 'GGPS Dhok Awan',
    district: 'Rawalpindi',
    block: 'Cluster 2',
    principalName: 'Headmaster - GGPS Dhok Awan',
    totalStudents: 195,
    totalTeachers: 7,
    infrastructure: { classrooms: 5, toilets: 2, waterSource: false, electricity: false },
    enrollment: { boys: 100, girls: 95 },
    compliance: 72,
  },
  {
    id: 'SCH-016',
    name: 'GPS Mohra Noor',
    district: 'Rawalpindi',
    block: 'Cluster 3',
    principalName: 'Headmaster - GPS Mohra Noor',
    totalStudents: 180,
    totalTeachers: 7,
    infrastructure: { classrooms: 5, toilets: 1, waterSource: false, electricity: false },
    enrollment: { boys: 95, girls: 85 },
    compliance: 70,
  },
];

// Mock staff data including AEOs and Head Teachers
const mockStaff: StaffMember[] = [
  // AEOs
  { id: 'aeo1', name: 'AEO Ahmed', role: 'AEO', clusterId: 'CLUS-001', clusterName: 'Cluster 1', status: 'present' },
  { id: 'aeo2', name: 'AEO Sara', role: 'AEO', clusterId: 'CLUS-002', clusterName: 'Cluster 2', status: 'present' },
  { id: 'aeo3', name: 'AEO Bilal', role: 'AEO', clusterId: 'CLUS-003', clusterName: 'Cluster 3', status: 'on_leave' },
  { id: 'aeo4', name: 'AEO Fatima', role: 'AEO', clusterId: 'CLUS-004', clusterName: 'Cluster 4', status: 'present' },
  { id: 'aeo5', name: 'AEO Kamran', role: 'AEO', clusterId: 'CLUS-005', clusterName: 'Cluster 5', status: 'present' },

  // Head Teachers
  { id: 'ht1', name: 'Headmaster - GGPS Chakra', role: 'HEAD_TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', status: 'present' },
  { id: 'ht2', name: 'Headmaster - GGPS Carriage Factory', role: 'HEAD_TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS Carriage Factory', status: 'on_leave' },
  { id: 'ht3', name: 'Headmaster - GES JAWA', role: 'HEAD_TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', status: 'present' },

  // Teachers (converted from existing mock data)
  { id: 't1', name: 'Teacher 1', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'Mathematics', status: 'present' },
  { id: 't2', name: 'Teacher 2', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'English', status: 'present' },
  { id: 't3', name: 'Teacher 3', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'Science', status: 'on_leave' },
  { id: 't4', name: 'Teacher 4', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS Chakra', subject: 'Social Studies', status: 'present' },
  { id: 't5', name: 'Teacher 5', role: 'TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS Carriage Factory', subject: 'Urdu', status: 'absent' },
  { id: 't6', name: 'Teacher 6', role: 'TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS Carriage Factory', subject: 'Mathematics', status: 'present' },
  { id: 't7', name: 'Teacher 7', role: 'TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Physics', status: 'on_leave' },
  { id: 't8', name: 'Teacher 8', role: 'TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Chemistry', status: 'present' },
  { id: 't9', name: 'Teacher 9', role: 'TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Biology', status: 'present' },
  { id: 't10', name: 'Teacher 10', role: 'TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS Carriage Factory', subject: 'English', status: 'on_leave' },
];

export function useMockTeacherData() {
  const [teachers] = useState<Teacher[]>(mockTeachers);
  const [leaves] = useState<LeaveRecord[]>(mockLeaves);
  const [schools] = useState<SchoolData[]>(mockSchools);
  const [staff] = useState<StaffMember[]>(mockStaff);

  const getTeacherStats = useCallback(() => {
    const today = new Date();
    const totalTeachers = teachers.length;
    const presentToday = teachers.filter((t) => t.status === 'present').length;
    const onLeaveToday = teachers.filter((t) => t.status === 'on_leave').length;
    const absentToday = teachers.filter((t) => t.status === 'absent').length;

    return { totalTeachers, presentToday, onLeaveToday, absentToday };
  }, [teachers]);

  const getStaffStats = useCallback(() => {
    const aeos = staff.filter((s) => s.role === 'AEO');
    const headTeachers = staff.filter((s) => s.role === 'HEAD_TEACHER');
    const teachersFromStaff = staff.filter((s) => s.role === 'TEACHER');

    return {
      aeos: {
        total: aeos.length,
        present: aeos.filter((a) => a.status === 'present').length,
        onLeave: aeos.filter((a) => a.status === 'on_leave').length,
        absent: aeos.filter((a) => a.status === 'absent').length,
      },
      headTeachers: {
        total: headTeachers.length,
        present: headTeachers.filter((h) => h.status === 'present').length,
        onLeave: headTeachers.filter((h) => h.status === 'on_leave').length,
        absent: headTeachers.filter((h) => h.status === 'absent').length,
      },
      teachers: {
        total: teachersFromStaff.length,
        present: teachersFromStaff.filter((t) => t.status === 'present').length,
        onLeave: teachersFromStaff.filter((t) => t.status === 'on_leave').length,
        absent: teachersFromStaff.filter((t) => t.status === 'absent').length,
      },
    };
  }, [staff]);

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
    staff,
    getTeacherStats,
    getStaffStats,
    getLeavesByDate,
    getPendingLeaves,
    getSchoolData,
    getSchoolById,
  };
}
