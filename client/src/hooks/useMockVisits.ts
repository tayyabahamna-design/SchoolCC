import { useState, useCallback } from 'react';

export interface VisitIndicator {
  id: string;
  name: string;
  type: 'boolean' | 'count' | 'scale' | 'text';
  value?: boolean | number | string;
  observation?: string;
}

export interface SchoolVisit {
  id: string;
  schoolId: string;
  schoolName: string;
  visitDate: Date;
  visitType: 'administrative' | 'academic' | 'monitoring';
  conductedBy: string;
  conductedByName: string;
  conductedByRole: string;
  status: 'planned' | 'in_progress' | 'completed';
  gpsLocation?: { lat: number; lng: number };
  indicators: VisitIndicator[];
  comments: string;
  photoCount: number;
  voiceNotesCount: number;
  voiceNotes?: { id: string; name: string; url: string; duration: number }[];
  photos?: { id: string; name: string; url: string }[];
  duration?: number;
}

const mockIndicators: VisitIndicator[] = [
  { id: 'ind-1', name: 'Head Teacher Present', type: 'boolean' },
  { id: 'ind-2', name: 'Lesson Plan Posted', type: 'boolean' },
  { id: 'ind-3', name: 'Working Toilets', type: 'count' },
  { id: 'ind-4', name: 'Water Availability', type: 'scale' },
  { id: 'ind-5', name: 'Infrastructure Issues', type: 'text' },
];

const mockVisits: SchoolVisit[] = [
  {
    id: 'v1',
    schoolId: 'school-1',
    schoolName: 'Government Primary School, Zone A',
    visitDate: new Date('2024-11-28'),
    visitType: 'monitoring',
    conductedBy: 'aeo-1',
    conductedByName: 'Mr. Amit Patel',
    conductedByRole: 'AEO',
    status: 'completed',
    gpsLocation: { lat: 28.6139, lng: 77.209 },
    indicators: [
      { id: 'ind-1', name: 'Head Teacher Present', type: 'boolean', value: true },
      { id: 'ind-2', name: 'Lesson Plan Posted', type: 'boolean', value: true },
      { id: 'ind-3', name: 'Working Toilets', type: 'count', value: 3 },
      { id: 'ind-4', name: 'Water Availability', type: 'scale', value: 3 },
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
  },
  {
    id: 'v2',
    schoolId: 'school-2',
    schoolName: 'Government Upper Primary School',
    visitDate: new Date('2024-12-01'),
    visitType: 'academic',
    conductedBy: 'aeo-1',
    conductedByName: 'Mr. Amit Patel',
    conductedByRole: 'AEO',
    status: 'completed',
    gpsLocation: { lat: 28.5244, lng: 77.1855 },
    indicators: [
      { id: 'ind-1', name: 'Head Teacher Present', type: 'boolean', value: true },
      { id: 'ind-2', name: 'Lesson Plan Posted', type: 'boolean', value: false },
      { id: 'ind-3', name: 'Working Toilets', type: 'count', value: 4 },
    ],
    comments: 'Discussed curriculum implementation. Need to focus on lesson planning.',
    photoCount: 3,
    voiceNotesCount: 1,
    duration: 90,
  },
];

export function useMockVisits() {
  const [visits, setVisits] = useState<SchoolVisit[]>(mockVisits);

  const getVisitsForUser = useCallback(
    (userId: string, userRole: string) => {
      if (userRole === 'DEO' || userRole === 'DDEO') {
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

  const addIndicator = useCallback(
    (visitId: string, indicator: VisitIndicator) => {
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? { ...v, indicators: [...v.indicators, indicator] }
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

  const completeVisit = useCallback(
    (visitId: string, comments: string) => {
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? {
                ...v,
                status: 'completed',
                comments,
                duration: Math.floor(Math.random() * 120) + 30,
              }
            : v
        )
      );
    },
    []
  );

  const getIndicators = useCallback(() => {
    return mockIndicators;
  }, []);

  return {
    visits,
    getVisitsForUser,
    getVisit,
    updateVisit,
    updateVisitIndicators,
    addIndicator,
    addVoiceNote,
    addPhoto,
    completeVisit,
    getIndicators,
  };
}
