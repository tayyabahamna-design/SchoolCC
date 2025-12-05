import { useState, useCallback } from 'react';

export interface DataField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'file' | 'photo' | 'voice_note';
  required: boolean;
  value?: string | number | null;
  fileUrl?: string;
  fileName?: string;
  voiceUrl?: string;
}

export interface RequestAssignee {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  schoolId?: string;
  schoolName?: string;
  status: 'pending' | 'completed' | 'overdue';
  submittedAt?: Date;
  fields: DataField[];
}

export interface DataRequest {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  createdAt: Date;
  dueDate: Date;
  assignees: RequestAssignee[];
  fields: DataField[];
  status: 'draft' | 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
}

// Mock data
const mockRequests: DataRequest[] = [
  {
    id: 'req-1',
    title: 'Monthly Attendance Verification',
    description: 'Verify attendance records for December 2024',
    createdBy: 'aeo-1',
    createdByName: 'Mr. Amit Patel',
    createdByRole: 'AEO',
    createdAt: new Date('2024-12-01'),
    dueDate: new Date('2024-12-05'),
    status: 'active',
    priority: 'high',
    isArchived: false,
    fields: [
      { id: 'f1', name: 'Total Students', type: 'number', required: true },
      { id: 'f2', name: 'Present Today', type: 'number', required: true },
      { id: 'f3', name: 'Attendance Report', type: 'file', required: false },
      { id: 'f4', name: 'Photo of Register', type: 'photo', required: true },
    ],
    assignees: [
      {
        id: 'a1',
        userId: 'teacher-1',
        userName: 'Mr. Vikram Das',
        userRole: 'TEACHER',
        schoolId: 'school-1',
        schoolName: 'Government Primary School, Zone A',
        status: 'pending',
        fields: [
          { id: 'f1', name: 'Total Students', type: 'number', required: true },
          { id: 'f2', name: 'Present Today', type: 'number', required: true, value: 42 },
          { id: 'f3', name: 'Attendance Report', type: 'file', required: false },
          { id: 'f4', name: 'Photo of Register', type: 'photo', required: true },
        ],
      },
    ],
  },
  {
    id: 'req-2',
    title: 'Infrastructure Status Check',
    description: 'Report on school infrastructure - water, toilets, electricity',
    createdBy: 'aeo-1',
    createdByName: 'Mr. Amit Patel',
    createdByRole: 'AEO',
    createdAt: new Date('2024-11-28'),
    dueDate: new Date('2024-12-10'),
    status: 'active',
    priority: 'medium',
    isArchived: false,
    fields: [
      { id: 'f1', name: 'Water Available', type: 'text', required: true },
      { id: 'f2', name: 'Working Toilets (Count)', type: 'number', required: true },
      { id: 'f3', name: 'Electricity Status', type: 'text', required: true },
      { id: 'f4', name: 'Infrastructure Photos', type: 'photo', required: true },
      { id: 'f5', name: 'Issues Voice Note', type: 'voice_note', required: false },
    ],
    assignees: [
      {
        id: 'a2',
        userId: 'ht-1',
        userName: 'Mrs. Anjali Singh',
        userRole: 'HEAD_TEACHER',
        schoolId: 'school-1',
        schoolName: 'Government Primary School, Zone A',
        status: 'pending',
        fields: [
          { id: 'f1', name: 'Water Available', type: 'text', required: true, value: 'Yes, 2 taps functioning' },
          { id: 'f2', name: 'Working Toilets (Count)', type: 'number', required: true, value: 3 },
          { id: 'f3', name: 'Electricity Status', type: 'text', required: true },
          { id: 'f4', name: 'Infrastructure Photos', type: 'photo', required: true },
          { id: 'f5', name: 'Issues Voice Note', type: 'voice_note', required: false },
        ],
      },
    ],
  },
];

// Helper to load and parse requests from localStorage
const loadRequestsFromStorage = (): DataRequest[] => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('dataRequests') : null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        dueDate: new Date(req.dueDate),
        assignees: req.assignees.map((a: any) => ({
          ...a,
          submittedAt: a.submittedAt ? new Date(a.submittedAt) : undefined,
        })),
      }));
    } catch {
      return mockRequests;
    }
  }
  return mockRequests;
};

export function useMockDataRequests() {
  const [requests, setRequests] = useState<DataRequest[]>(loadRequestsFromStorage);

  const getRequestsForUser = useCallback(
    (userId: string, userRole: string) => {
      // Always read latest from localStorage
      const allRequests = loadRequestsFromStorage();
      return allRequests.filter((req) => {
        if (userRole === 'DEO' || userRole === 'DDEO') {
          return true; // See all requests
        }
        if (userRole === 'AEO') {
          // See requests they created OR requests assigned to them
          return req.createdBy === userId || req.assignees.some((a) => a.userId === userId);
        }
        // HEAD_TEACHER and TEACHER see requests assigned to them
        return req.assignees.some((a) => a.userId === userId);
      });
    },
    []
  );

  const getRequest = useCallback(
    (requestId: string) => {
      return requests.find((r) => r.id === requestId);
    },
    [requests]
  );

  const updateAssigneeFields = useCallback(
    (requestId: string, assigneeId: string, fields: DataField[]) => {
      setRequests((prev) => {
        const updated = prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              assignees: req.assignees.map((a) =>
                a.id === assigneeId ? { ...a, fields, status: 'completed' as const } : a
              ),
            };
          }
          return req;
        });
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('dataRequests', JSON.stringify(updated));
        }
        return updated;
      });
    },
    []
  );

  const createRequest = useCallback(
    (
      title: string,
      description: string,
      fields: DataField[],
      assignees: Omit<RequestAssignee, 'status' | 'fields' | 'id'>[],
      createdBy: string,
      createdByName: string,
      createdByRole: string
    ) => {
      const newRequest: DataRequest = {
        id: `req-${Date.now()}`,
        title,
        description,
        fields,
        createdBy,
        createdByName,
        createdByRole,
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignees: assignees.map((a, idx) => ({
          id: `a-${Date.now()}-${idx}`,
          ...a,
          status: 'pending' as const,
          fields: fields.map((f) => ({ ...f, value: undefined })),
        })),
        status: 'active',
        priority: 'medium',
        isArchived: false,
      };

      setRequests((prev) => {
        const updated = [newRequest, ...prev];
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('dataRequests', JSON.stringify(updated));
        }
        return updated;
      });
      return newRequest;
    },
    []
  );

  return {
    requests,
    getRequestsForUser,
    getRequest,
    updateAssigneeFields,
    createRequest,
  };
}
