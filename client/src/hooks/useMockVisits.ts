import { useState, useCallback } from 'react';

export interface VisitIndicator {
  id: string;
  name: string;
  type: 'boolean' | 'count' | 'scale' | 'text';
  value?: boolean | number | string;
}

export interface SchoolVisit {
  id: string;
  schoolId: string;
  schoolName: string;
  visitDate: Date;
  plannedDate?: Date;
  visitType: 'monitoring' | 'mentoring';
  conductedBy: string;
  conductedByName: string;
  conductedByRole: string;
  status: 'planned' | 'in_progress' | 'completed';
  gpsLocation?: { lat: number; lng: number };
  gpsStartLocation?: { lat: number; lng: number };
  gpsEndLocation?: { lat: number; lng: number };
  indicators: VisitIndicator[];
  comments: string;
  objectives?: string;
  classesToObserve?: string[];
  photoCount: number;
  voiceNotesCount: number;
  voiceNotes?: { id: string; name: string; url: string; duration: number }[];
  photos?: { id: string; name: string; url: string }[];
  duration?: number;
  startTime?: Date;
  endTime?: Date;
}

// Monitoring Visit Indicators
const monitoringIndicators: VisitIndicator[] = [
  { id: 'm-1', name: 'Head Teacher Present', type: 'boolean' },
  { id: 'm-2', name: 'Teacher Attendance', type: 'count' },
  { id: 'm-3', name: 'Student Attendance', type: 'count' },
  { id: 'm-4', name: 'Furniture Availability', type: 'scale' },
  { id: 'm-5', name: 'Working Toilets', type: 'count' },
  { id: 'm-6', name: 'Water Availability', type: 'boolean' },
  { id: 'm-7', name: 'Electricity Available', type: 'boolean' },
  { id: 'm-8', name: 'Infrastructure Issues', type: 'text' },
];

// Mentoring Visit Indicators (HOTS Competencies)
const mentoringIndicators: VisitIndicator[] = [
  { id: 'h-1', name: 'Classroom Management', type: 'scale' },
  { id: 'h-2', name: 'Subject Knowledge', type: 'scale' },
  { id: 'h-3', name: 'Pedagogical Skills', type: 'scale' },
  { id: 'h-4', name: 'Student Engagement', type: 'scale' },
  { id: 'h-5', name: 'Assessment Practices', type: 'scale' },
  { id: 'h-6', name: 'Use of Teaching Aids', type: 'scale' },
  { id: 'h-7', name: 'Lesson Plan Compliance', type: 'scale' },
  { id: 'h-8', name: 'Critical Thinking Promotion', type: 'scale' },
  { id: 'h-9', name: 'Inclusive Teaching', type: 'scale' },
  { id: 'h-10', name: 'Feedback & Remediation', type: 'scale' },
  { id: 'h-11', name: 'Digital Resources Usage', type: 'scale' },
  { id: 'h-12', name: 'Student-Teacher Interaction', type: 'scale' },
  { id: 'h-13', name: 'Class Hygiene & Safety', type: 'scale' },
  { id: 'h-14', name: 'Overall Performance', type: 'scale' },
];

const mockVisits: SchoolVisit[] = [
  {
    id: 'v1',
    schoolId: 'school-1',
    schoolName: 'Demo School',
    visitDate: new Date('2024-11-28'),
    plannedDate: new Date('2024-11-28'),
    visitType: 'monitoring',
    conductedBy: 'aeo-1',
    conductedByName: 'AEO User',
    conductedByRole: 'AEO',
    status: 'completed',
    gpsStartLocation: { lat: 28.6139, lng: 77.209 },
    gpsEndLocation: { lat: 28.6139, lng: 77.209 },
    gpsLocation: { lat: 28.6139, lng: 77.209 },
    objectives: 'Check school infrastructure and teacher attendance',
    indicators: [
      { id: 'm-1', name: 'Head Teacher Present', type: 'boolean', value: true },
      { id: 'm-2', name: 'Teacher Attendance', type: 'count', value: 8 },
      { id: 'm-3', name: 'Student Attendance', type: 'count', value: 180 },
      { id: 'm-4', name: 'Furniture Availability', type: 'scale', value: 3 },
    ],
    comments: 'School in good condition. Minor repairs needed in block B.',
    photoCount: 5,
    voiceNotesCount: 2,
    voiceNotes: [
      { id: 'v1-1', name: 'Observations', url: 'voice1.m4a', duration: 45 },
      { id: 'v1-2', name: 'Recommendations', url: 'voice2.m4a', duration: 30 },
    ],
    photos: [
      { id: 'p1-1', name: 'Classroom.jpg', url: 'photo1.jpg' },
      { id: 'p1-2', name: 'Playground.jpg', url: 'photo2.jpg' },
    ],
    duration: 120,
    startTime: new Date('2024-11-28T09:00:00'),
    endTime: new Date('2024-11-28T11:00:00'),
  },
  {
    id: 'v2',
    schoolId: 'school-2',
    schoolName: 'Demo School 2',
    visitDate: new Date('2024-12-01'),
    plannedDate: new Date('2024-12-01'),
    visitType: 'mentoring',
    conductedBy: 'aeo-1',
    conductedByName: 'AEO User',
    conductedByRole: 'AEO',
    status: 'completed',
    gpsStartLocation: { lat: 28.5244, lng: 77.1855 },
    gpsEndLocation: { lat: 28.5244, lng: 77.1855 },
    gpsLocation: { lat: 28.5244, lng: 77.1855 },
    objectives: 'Mentoring session for Grade 5 Science teacher - Focus on HOTS',
    classesToObserve: ['Class 5-A', 'Class 5-B'],
    indicators: [
      { id: 'h-1', name: 'Classroom Management', type: 'scale', value: 3 },
      { id: 'h-2', name: 'Subject Knowledge', type: 'scale', value: 3 },
      { id: 'h-3', name: 'Pedagogical Skills', type: 'scale', value: 2 },
    ],
    comments: 'Good foundation. Need to work on student engagement and critical thinking promotion.',
    photoCount: 3,
    voiceNotesCount: 1,
    duration: 90,
    startTime: new Date('2024-12-01T10:00:00'),
    endTime: new Date('2024-12-01T11:30:00'),
  },
];

export function useMockVisits() {
  const [visits, setVisits] = useState<SchoolVisit[]>(mockVisits);

  const getVisitsForUser = useCallback(
    (userId: string, userRole: string) => {
      if (userRole === 'CEO' || userRole === 'DEO' || userRole === 'DDEO') {
        return visits;
      }
      if (userRole === 'AEO') {
        return visits.filter((v) => v.conductedBy === userId);
      }
      if (userRole === 'HEAD_TEACHER') {
        return visits.filter((v) => v.schoolId === userId);
      }
      return [];
    },
    [visits]
  );

  const getVisit = useCallback(
    (visitId: string) => {
      return visits.find((v) => v.id === visitId);
    },
    [visits]
  );

  const createVisit = useCallback(
    (
      schoolId: string,
      schoolName: string,
      visitType: 'monitoring' | 'mentoring',
      objectives: string,
      classesToObserve: string[] | undefined,
      conductedBy: string,
      conductedByName: string,
      conductedByRole: string
    ): SchoolVisit => {
      const newVisit: SchoolVisit = {
        id: `v-${Date.now()}`,
        schoolId,
        schoolName,
        visitDate: new Date(),
        plannedDate: new Date(),
        visitType,
        conductedBy,
        conductedByName,
        conductedByRole,
        status: 'planned',
        objectives,
        classesToObserve,
        gpsStartLocation: { lat: 28.6139 + Math.random() * 0.1, lng: 77.209 + Math.random() * 0.1 },
        indicators: visitType === 'monitoring' 
          ? monitoringIndicators.map((ind) => ({ ...ind }))
          : mentoringIndicators.map((ind) => ({ ...ind })),
        comments: '',
        photoCount: 0,
        voiceNotesCount: 0,
        voiceNotes: [],
        photos: [],
      };

      setVisits((prev) => [newVisit, ...prev]);
      return newVisit;
    },
    []
  );

  const updateVisit = useCallback(
    (visitId: string, updates: Partial<SchoolVisit>) => {
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, ...updates } : v))
      );
    },
    []
  );

  const updateVisitIndicators = useCallback(
    (visitId: string, indicators: VisitIndicator[]) => {
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, indicators } : v))
      );
    },
    []
  );

  const startVisit = useCallback((visitId: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status: 'in_progress',
              startTime: new Date(),
              gpsStartLocation: { lat: 28.6139 + Math.random() * 0.1, lng: 77.209 + Math.random() * 0.1 },
            }
          : v
      )
    );
  }, []);

  const completeVisit = useCallback(
    (visitId: string, comments: string) => {
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? {
                ...v,
                status: 'completed',
                comments,
                endTime: new Date(),
                gpsEndLocation: { lat: 28.6139 + Math.random() * 0.1, lng: 77.209 + Math.random() * 0.1 },
                duration: Math.floor(Math.random() * 120) + 30,
              }
            : v
        )
      );
    },
    []
  );

  const addVoiceNote = useCallback(
    (visitId: string, name: string) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id === visitId) {
            const voiceNotes = v.voiceNotes || [];
            return {
              ...v,
              voiceNotes: [
                ...voiceNotes,
                { id: `v-${Date.now()}`, name, url: `voice_${Date.now()}.m4a`, duration: 30 },
              ],
              voiceNotesCount: voiceNotes.length + 1,
            };
          }
          return v;
        })
      );
    },
    []
  );

  const addPhoto = useCallback(
    (visitId: string, name: string) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id === visitId) {
            const photos = v.photos || [];
            return {
              ...v,
              photos: [...photos, { id: `p-${Date.now()}`, name, url: `photo_${Date.now()}.jpg` }],
              photoCount: photos.length + 1,
            };
          }
          return v;
        })
      );
    },
    []
  );

  return {
    visits,
    getVisitsForUser,
    getVisit,
    createVisit,
    updateVisit,
    updateVisitIndicators,
    startVisit,
    completeVisit,
    addVoiceNote,
    addPhoto,
    getMonitoringIndicators: () => monitoringIndicators,
    getMentoringIndicators: () => mentoringIndicators,
  };
}
