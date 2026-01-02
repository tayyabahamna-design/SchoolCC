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
  furniture?: {
    desks: { new: number; old: number; inUse: number; broken: number };
    chairs: { new: number; old: number; inUse: number; broken: number };
    benches: { new: number; old: number; inUse: number; broken: number };
    blackboards: { new: number; old: number; inUse: number; broken: number };
    whiteboards: { new: number; old: number; inUse: number; broken: number };
    fans: { new: number; old: number; inUse: number; broken: number };
    computers: { new: number; old: number; inUse: number; broken: number };
    cupboards: { new: number; old: number; inUse: number; broken: number };
  };
}

const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Teacher 1', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'Mathematics', status: 'present' },
  { id: 't2', name: 'Teacher 2', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'English', status: 'present' },
  { id: 't3', name: 'Teacher 3', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'Science', status: 'on_leave' },
  { id: 't4', name: 'Teacher 4', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'Social Studies', status: 'present' },
  { id: 't5', name: 'Teacher 5', schoolId: 'SCH-002', schoolName: 'GGPS CARRIAGE FACTORY', subject: 'Urdu', status: 'absent' },
  { id: 't6', name: 'Teacher 6', schoolId: 'SCH-002', schoolName: 'GGPS CARRIAGE FACTORY', subject: 'Mathematics', status: 'present' },
  { id: 't7', name: 'Teacher 7', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Physics', status: 'on_leave' },
  { id: 't8', name: 'Teacher 8', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Chemistry', status: 'present' },
  { id: 't9', name: 'Teacher 9', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Biology', status: 'present' },
  { id: 't10', name: 'Teacher 10', schoolId: 'SCH-002', schoolName: 'GGPS CARRIAGE FACTORY', subject: 'English', status: 'on_leave' },
];

const mockLeaves: LeaveRecord[] = [
  { id: 'l1', teacherId: 't3', teacherName: 'Teacher 3', leaveType: 'sick', startDate: new Date('2024-12-02'), endDate: new Date('2024-12-03'), status: 'approved', reason: 'Fever', school: 'GGPS CHAKRA' },
  { id: 'l2', teacherId: 't7', teacherName: 'Teacher 7', leaveType: 'earned', startDate: new Date('2024-12-02'), endDate: new Date('2024-12-02'), status: 'approved', reason: 'Personal', school: 'GES JAWA' },
  { id: 'l3', teacherId: 't10', teacherName: 'Teacher 10', leaveType: 'casual', startDate: new Date('2024-12-02'), endDate: new Date('2024-12-04'), status: 'approved', reason: 'Family work', school: 'GGPS CARRIAGE FACTORY' },
  { id: 'l4', teacherId: 't1', teacherName: 'Teacher 1', leaveType: 'casual', startDate: new Date('2024-12-05'), endDate: new Date('2024-12-06'), status: 'pending', reason: 'Travel', school: 'GGPS CHAKRA' },
];

const mockSchools: SchoolData[] = [
  // Excellent Performance (90%+) - 4 schools
  {
    id: 'SCH-001',
    name: 'GGPS CHAKRA',
    district: 'Rawalpindi',
    block: 'Cluster 1',
    principalName: 'HEADMASTER - GGPS CHAKRA',
    totalStudents: 345,
    totalTeachers: 12,
    infrastructure: { classrooms: 8, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 185, girls: 160 },
    compliance: 95,
    furniture: {
      desks: { new: 45, old: 80, inUse: 120, broken: 5 },
      chairs: { new: 50, old: 95, inUse: 140, broken: 5 },
      benches: { new: 20, old: 35, inUse: 50, broken: 5 },
      blackboards: { new: 4, old: 4, inUse: 8, broken: 0 },
      whiteboards: { new: 2, old: 1, inUse: 3, broken: 0 },
      fans: { new: 12, old: 8, inUse: 18, broken: 2 },
      computers: { new: 10, old: 5, inUse: 12, broken: 3 },
      cupboards: { new: 6, old: 4, inUse: 10, broken: 0 },
    },
  },
  {
    id: 'SCH-002',
    name: 'GGPS CARRIAGE FACTORY',
    district: 'Rawalpindi',
    block: 'Cluster 2',
    principalName: 'HEADMASTER - GGPS CARRIAGE FACTORY',
    totalStudents: 512,
    totalTeachers: 18,
    infrastructure: { classrooms: 12, toilets: 6, waterSource: true, electricity: true },
    enrollment: { boys: 280, girls: 232 },
    compliance: 93,
    furniture: {
      desks: { new: 75, old: 120, inUse: 180, broken: 15 },
      chairs: { new: 80, old: 140, inUse: 210, broken: 10 },
      benches: { new: 30, old: 50, inUse: 75, broken: 5 },
      blackboards: { new: 6, old: 6, inUse: 12, broken: 0 },
      whiteboards: { new: 3, old: 2, inUse: 5, broken: 0 },
      fans: { new: 18, old: 12, inUse: 25, broken: 5 },
      computers: { new: 20, old: 8, inUse: 25, broken: 3 },
      cupboards: { new: 8, old: 6, inUse: 14, broken: 0 },
    },
  },
  {
    id: 'SCH-003',
    name: 'GES JAWA',
    district: 'Rawalpindi',
    block: 'Cluster 3',
    principalName: 'HEADMASTER - GES JAWA',
    totalStudents: 687,
    totalTeachers: 25,
    infrastructure: { classrooms: 18, toilets: 10, waterSource: true, electricity: true },
    enrollment: { boys: 375, girls: 312 },
    compliance: 92,
    furniture: {
      desks: { new: 100, old: 180, inUse: 260, broken: 20 },
      chairs: { new: 120, old: 200, inUse: 300, broken: 20 },
      benches: { new: 45, old: 70, inUse: 110, broken: 5 },
      blackboards: { new: 9, old: 9, inUse: 18, broken: 0 },
      whiteboards: { new: 5, old: 3, inUse: 8, broken: 0 },
      fans: { new: 25, old: 18, inUse: 38, broken: 5 },
      computers: { new: 30, old: 15, inUse: 40, broken: 5 },
      cupboards: { new: 12, old: 8, inUse: 20, broken: 0 },
    },
  },
  {
    id: 'SCH-004',
    name: 'GGPS DHOK MUNSHI',
    district: 'Rawalpindi',
    block: 'Cluster 4',
    principalName: 'HEADMASTER - GGPS DHOK MUNSHI',
    totalStudents: 420,
    totalTeachers: 15,
    infrastructure: { classrooms: 10, toilets: 5, waterSource: true, electricity: true },
    enrollment: { boys: 220, girls: 200 },
    compliance: 91,
    furniture: {
      desks: { new: 60, old: 95, inUse: 145, broken: 10 },
      chairs: { new: 65, old: 110, inUse: 165, broken: 10 },
      benches: { new: 25, old: 42, inUse: 62, broken: 5 },
      blackboards: { new: 5, old: 5, inUse: 10, broken: 0 },
      whiteboards: { new: 3, old: 2, inUse: 5, broken: 0 },
      fans: { new: 15, old: 10, inUse: 22, broken: 3 },
      computers: { new: 12, old: 6, inUse: 15, broken: 3 },
      cupboards: { new: 7, old: 5, inUse: 12, broken: 0 },
    },
  },

  // Good Performance (80-89%) - 8 schools
  {
    id: 'SCH-005',
    name: 'GPS MILLAT ISLAMIA',
    district: 'Rawalpindi',
    block: 'Cluster 5',
    principalName: 'HEADMASTER - GPS MILLAT ISLAMIA',
    totalStudents: 380,
    totalTeachers: 14,
    infrastructure: { classrooms: 9, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 200, girls: 180 },
    compliance: 88,
    furniture: {
      desks: { new: 55, old: 85, inUse: 130, broken: 10 },
      chairs: { new: 60, old: 100, inUse: 150, broken: 10 },
      benches: { new: 22, old: 38, inUse: 55, broken: 5 },
      blackboards: { new: 4, old: 5, inUse: 9, broken: 0 },
      whiteboards: { new: 2, old: 2, inUse: 4, broken: 0 },
      fans: { new: 14, old: 9, inUse: 20, broken: 3 },
      computers: { new: 10, old: 5, inUse: 13, broken: 2 },
      cupboards: { new: 6, old: 4, inUse: 10, broken: 0 },
    },
  },
  {
    id: 'SCH-006',
    name: 'GGPS BANNI',
    district: 'Rawalpindi',
    block: 'Cluster 6',
    principalName: 'HEADMASTER - GGPS BANNI',
    totalStudents: 290,
    totalTeachers: 11,
    infrastructure: { classrooms: 7, toilets: 3, waterSource: true, electricity: false },
    enrollment: { boys: 155, girls: 135 },
    compliance: 86,
    furniture: {
      desks: { new: 40, old: 65, inUse: 95, broken: 10 },
      chairs: { new: 45, old: 75, inUse: 110, broken: 10 },
      benches: { new: 18, old: 30, inUse: 45, broken: 3 },
      blackboards: { new: 3, old: 4, inUse: 7, broken: 0 },
      whiteboards: { new: 1, old: 1, inUse: 2, broken: 0 },
      fans: { new: 10, old: 7, inUse: 14, broken: 3 },
      computers: { new: 5, old: 3, inUse: 6, broken: 2 },
      cupboards: { new: 5, old: 3, inUse: 8, broken: 0 },
    },
  },
  {
    id: 'SCH-007',
    name: 'GGPS DHOKE SYEDAN',
    district: 'Rawalpindi',
    block: 'Cluster 7',
    principalName: 'HEADMASTER - GGPS DHOKE SYEDAN',
    totalStudents: 325,
    totalTeachers: 13,
    infrastructure: { classrooms: 8, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 170, girls: 155 },
    compliance: 85,
    furniture: {
      desks: { new: 48, old: 72, inUse: 110, broken: 10 },
      chairs: { new: 52, old: 82, inUse: 125, broken: 9 },
      benches: { new: 20, old: 33, inUse: 48, broken: 5 },
      blackboards: { new: 4, old: 4, inUse: 8, broken: 0 },
      whiteboards: { new: 2, old: 1, inUse: 3, broken: 0 },
      fans: { new: 12, old: 8, inUse: 18, broken: 2 },
      computers: { new: 8, old: 4, inUse: 10, broken: 2 },
      cupboards: { new: 6, old: 4, inUse: 10, broken: 0 },
    },
  },
  {
    id: 'SCH-008',
    name: 'GPS SIHALA',
    district: 'Rawalpindi',
    block: 'Cluster 8',
    principalName: 'HEADMASTER - GPS SIHALA',
    totalStudents: 455,
    totalTeachers: 16,
    infrastructure: { classrooms: 11, toilets: 5, waterSource: true, electricity: true },
    enrollment: { boys: 240, girls: 215 },
    compliance: 84,
    furniture: {
      desks: { new: 68, old: 102, inUse: 160, broken: 10 },
      chairs: { new: 72, old: 115, inUse: 180, broken: 7 },
      benches: { new: 28, old: 45, inUse: 68, broken: 5 },
      blackboards: { new: 5, old: 6, inUse: 11, broken: 0 },
      whiteboards: { new: 3, old: 2, inUse: 5, broken: 0 },
      fans: { new: 16, old: 11, inUse: 24, broken: 3 },
      computers: { new: 15, old: 7, inUse: 19, broken: 3 },
      cupboards: { new: 7, old: 5, inUse: 12, broken: 0 },
    },
  },
  {
    id: 'SCH-009',
    name: 'GGPS MISRIAL',
    district: 'Rawalpindi',
    block: 'Cluster 9',
    principalName: 'HEADMASTER - GGPS MISRIAL',
    totalStudents: 310,
    totalTeachers: 12,
    infrastructure: { classrooms: 8, toilets: 3, waterSource: true, electricity: false },
    enrollment: { boys: 165, girls: 145 },
    compliance: 83,
    furniture: {
      desks: { new: 45, old: 68, inUse: 105, broken: 8 },
      chairs: { new: 48, old: 78, inUse: 118, broken: 8 },
      benches: { new: 19, old: 32, inUse: 47, broken: 4 },
      blackboards: { new: 4, old: 4, inUse: 8, broken: 0 },
      whiteboards: { new: 2, old: 1, inUse: 3, broken: 0 },
      fans: { new: 11, old: 8, inUse: 16, broken: 3 },
      computers: { new: 6, old: 3, inUse: 8, broken: 1 },
      cupboards: { new: 5, old: 4, inUse: 9, broken: 0 },
    },
  },
  {
    id: 'SCH-010',
    name: 'GPS DHOKE KASHMIRIAN',
    district: 'Rawalpindi',
    block: 'Cluster 10',
    principalName: 'HEADMASTER - GPS DHOKE KASHMIRIAN',
    totalStudents: 275,
    totalTeachers: 10,
    infrastructure: { classrooms: 7, toilets: 3, waterSource: true, electricity: true },
    enrollment: { boys: 145, girls: 130 },
    compliance: 82,
    furniture: {
      desks: { new: 38, old: 60, inUse: 90, broken: 8 },
      chairs: { new: 42, old: 70, inUse: 105, broken: 7 },
      benches: { new: 16, old: 28, inUse: 40, broken: 4 },
      blackboards: { new: 3, old: 4, inUse: 7, broken: 0 },
      whiteboards: { new: 1, old: 1, inUse: 2, broken: 0 },
      fans: { new: 10, old: 6, inUse: 14, broken: 2 },
      computers: { new: 5, old: 2, inUse: 6, broken: 1 },
      cupboards: { new: 5, old: 3, inUse: 8, broken: 0 },
    },
  },
  {
    id: 'SCH-011',
    name: 'GGPS KOTHA KALAN',
    district: 'Rawalpindi',
    block: 'Cluster 11',
    principalName: 'HEADMASTER - GGPS KOTHA KALAN',
    totalStudents: 340,
    totalTeachers: 13,
    infrastructure: { classrooms: 9, toilets: 4, waterSource: false, electricity: true },
    enrollment: { boys: 180, girls: 160 },
    compliance: 81,
    furniture: {
      desks: { new: 50, old: 75, inUse: 115, broken: 10 },
      chairs: { new: 54, old: 85, inUse: 130, broken: 9 },
      benches: { new: 21, old: 34, inUse: 50, broken: 5 },
      blackboards: { new: 4, old: 5, inUse: 9, broken: 0 },
      whiteboards: { new: 2, old: 2, inUse: 4, broken: 0 },
      fans: { new: 13, old: 8, inUse: 19, broken: 2 },
      computers: { new: 7, old: 4, inUse: 9, broken: 2 },
      cupboards: { new: 6, old: 4, inUse: 10, broken: 0 },
    },
  },
  {
    id: 'SCH-012',
    name: 'GPS SADIQABAD',
    district: 'Rawalpindi',
    block: 'Cluster 12',
    principalName: 'HEADMASTER - GPS SADIQABAD',
    totalStudents: 395,
    totalTeachers: 14,
    infrastructure: { classrooms: 10, toilets: 4, waterSource: true, electricity: true },
    enrollment: { boys: 210, girls: 185 },
    compliance: 80,
    furniture: {
      desks: { new: 58, old: 88, inUse: 135, broken: 11 },
      chairs: { new: 62, old: 98, inUse: 150, broken: 10 },
      benches: { new: 24, old: 38, inUse: 58, broken: 4 },
      blackboards: { new: 5, old: 5, inUse: 10, broken: 0 },
      whiteboards: { new: 2, old: 2, inUse: 4, broken: 0 },
      fans: { new: 14, old: 9, inUse: 21, broken: 2 },
      computers: { new: 9, old: 5, inUse: 12, broken: 2 },
      cupboards: { new: 6, old: 5, inUse: 11, broken: 0 },
    },
  },

  // Needs Attention (<80%) - 4 schools
  {
    id: 'SCH-013',
    name: 'GGPS DHOK RATTA',
    district: 'Rawalpindi',
    block: 'Cluster 13',
    principalName: 'HEADMASTER - GGPS DHOK RATTA',
    totalStudents: 245,
    totalTeachers: 9,
    infrastructure: { classrooms: 6, toilets: 2, waterSource: false, electricity: false },
    enrollment: { boys: 130, girls: 115 },
    compliance: 78,
    furniture: {
      desks: { new: 25, old: 50, inUse: 65, broken: 10 },
      chairs: { new: 28, old: 58, inUse: 75, broken: 11 },
      benches: { new: 12, old: 24, inUse: 32, broken: 4 },
      blackboards: { new: 2, old: 4, inUse: 6, broken: 0 },
      whiteboards: { new: 0, old: 1, inUse: 1, broken: 0 },
      fans: { new: 6, old: 4, inUse: 8, broken: 2 },
      computers: { new: 2, old: 1, inUse: 2, broken: 1 },
      cupboards: { new: 4, old: 2, inUse: 6, broken: 0 },
    },
  },
  {
    id: 'SCH-014',
    name: 'GPS DHOKE HASSU',
    district: 'Rawalpindi',
    block: 'Cluster 1',
    principalName: 'HEADMASTER - GPS DHOKE HASSU',
    totalStudents: 220,
    totalTeachers: 8,
    infrastructure: { classrooms: 6, toilets: 2, waterSource: true, electricity: false },
    enrollment: { boys: 115, girls: 105 },
    compliance: 75,
    furniture: {
      desks: { new: 22, old: 45, inUse: 60, broken: 7 },
      chairs: { new: 25, old: 52, inUse: 70, broken: 7 },
      benches: { new: 10, old: 22, inUse: 30, broken: 2 },
      blackboards: { new: 2, old: 4, inUse: 6, broken: 0 },
      whiteboards: { new: 0, old: 1, inUse: 1, broken: 0 },
      fans: { new: 5, old: 3, inUse: 7, broken: 1 },
      computers: { new: 2, old: 0, inUse: 2, broken: 0 },
      cupboards: { new: 3, old: 2, inUse: 5, broken: 0 },
    },
  },
  {
    id: 'SCH-015',
    name: 'GGPS DHOK AWAN',
    district: 'Rawalpindi',
    block: 'Cluster 2',
    principalName: 'HEADMASTER - GGPS DHOK AWAN',
    totalStudents: 195,
    totalTeachers: 7,
    infrastructure: { classrooms: 5, toilets: 2, waterSource: false, electricity: false },
    enrollment: { boys: 100, girls: 95 },
    compliance: 72,
    furniture: {
      desks: { new: 18, old: 40, inUse: 52, broken: 6 },
      chairs: { new: 20, old: 45, inUse: 60, broken: 5 },
      benches: { new: 8, old: 18, inUse: 24, broken: 2 },
      blackboards: { new: 2, old: 3, inUse: 5, broken: 0 },
      whiteboards: { new: 0, old: 0, inUse: 0, broken: 0 },
      fans: { new: 4, old: 2, inUse: 5, broken: 1 },
      computers: { new: 0, old: 1, inUse: 1, broken: 0 },
      cupboards: { new: 3, old: 2, inUse: 5, broken: 0 },
    },
  },
  {
    id: 'SCH-016',
    name: 'GPS MOHRA NOOR',
    district: 'Rawalpindi',
    block: 'Cluster 3',
    principalName: 'HEADMASTER - GPS MOHRA NOOR',
    totalStudents: 180,
    totalTeachers: 7,
    infrastructure: { classrooms: 5, toilets: 1, waterSource: false, electricity: false },
    enrollment: { boys: 95, girls: 85 },
    compliance: 70,
    furniture: {
      desks: { new: 15, old: 38, inUse: 48, broken: 5 },
      chairs: { new: 18, old: 42, inUse: 55, broken: 5 },
      benches: { new: 7, old: 16, inUse: 22, broken: 1 },
      blackboards: { new: 1, old: 4, inUse: 5, broken: 0 },
      whiteboards: { new: 0, old: 0, inUse: 0, broken: 0 },
      fans: { new: 3, old: 2, inUse: 4, broken: 1 },
      computers: { new: 0, old: 0, inUse: 0, broken: 0 },
      cupboards: { new: 2, old: 2, inUse: 4, broken: 0 },
    },
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
  { id: 'ht1', name: 'HEADMASTER - GGPS CHAKRA', role: 'HEAD_TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', status: 'present' },
  { id: 'ht2', name: 'HEADMASTER - GGPS CARRIAGE FACTORY', role: 'HEAD_TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS CARRIAGE FACTORY', status: 'on_leave' },
  { id: 'ht3', name: 'HEADMASTER - GES JAWA', role: 'HEAD_TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', status: 'present' },

  // Teachers (converted from existing mock data)
  { id: 't1', name: 'Teacher 1', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'Mathematics', status: 'present' },
  { id: 't2', name: 'Teacher 2', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'English', status: 'present' },
  { id: 't3', name: 'Teacher 3', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'Science', status: 'on_leave' },
  { id: 't4', name: 'Teacher 4', role: 'TEACHER', schoolId: 'SCH-001', schoolName: 'GGPS CHAKRA', subject: 'Social Studies', status: 'present' },
  { id: 't5', name: 'Teacher 5', role: 'TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS CARRIAGE FACTORY', subject: 'Urdu', status: 'absent' },
  { id: 't6', name: 'Teacher 6', role: 'TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS CARRIAGE FACTORY', subject: 'Mathematics', status: 'present' },
  { id: 't7', name: 'Teacher 7', role: 'TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Physics', status: 'on_leave' },
  { id: 't8', name: 'Teacher 8', role: 'TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Chemistry', status: 'present' },
  { id: 't9', name: 'Teacher 9', role: 'TEACHER', schoolId: 'SCH-003', schoolName: 'GES JAWA', subject: 'Biology', status: 'present' },
  { id: 't10', name: 'Teacher 10', role: 'TEACHER', schoolId: 'SCH-002', schoolName: 'GGPS CARRIAGE FACTORY', subject: 'English', status: 'on_leave' },
];

export function useMockTeacherData(assignedSchools?: string[]) {
  const [teachers] = useState<Teacher[]>(mockTeachers);
  const [leaves] = useState<LeaveRecord[]>(mockLeaves);
  const [schools] = useState<SchoolData[]>(mockSchools);
  const [staff] = useState<StaffMember[]>(mockStaff);

  // Filter schools based on assigned schools for AEO (by name or ID)
  const filteredSchools = assignedSchools && assignedSchools.length > 0
    ? schools.filter(school => 
        assignedSchools.includes(school.name) || assignedSchools.includes(school.id)
      )
    : schools;

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
    return filteredSchools;
  }, [filteredSchools]);

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
