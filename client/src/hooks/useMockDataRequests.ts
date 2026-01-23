import { useState, useCallback, useRef } from 'react';
import { ROLE_HIERARCHY, UserRole } from '@/contexts/auth';

// Module-level flag to prevent duplicate submissions across all hook instances
let isCreatingRequest = false;

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
  descriptionVoiceUrl?: string;
  descriptionVoiceFileName?: string;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  createdBySchoolId?: string;
  createdByClusterId?: string;
  createdByDistrictId?: string;
  createdAt: Date;
  dueDate: Date;
  assignees: RequestAssignee[];
  fields: DataField[];
  status: 'draft' | 'active' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isArchived: boolean;
}

// No mock data - all requests will come from the API/database

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
      return [];
    }
  }
  return [];
};

export function useMockDataRequests() {
  // Keep mock data for fallback
  const [requests, setRequests] = useState<DataRequest[]>(loadRequestsFromStorage);

  const getRequestsForUser = useCallback(
    async (userId: string, userRole: string, userSchoolId?: string, userClusterId?: string, userDistrictId?: string) => {
      try {
        // Call the API to get requests from the database
        const params = new URLSearchParams({
          userId,
          userRole,
          ...(userSchoolId && { schoolId: userSchoolId }),
          ...(userClusterId && { clusterId: userClusterId }),
          ...(userDistrictId && { districtId: userDistrictId }),
        });

        const response = await fetch(`/api/requests?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }

        const data = await response.json();
        // Convert date strings to Date objects
        return data.map((req: any) => ({
          ...req,
          createdAt: new Date(req.createdAt),
          dueDate: new Date(req.dueDate),
          assignees: req.assignees?.map((a: any) => ({
            ...a,
            submittedAt: a.submittedAt ? new Date(a.submittedAt) : undefined,
          })) || [],
        }));
      } catch (error) {
        console.error('Error fetching requests:', error);
        // Fallback to localStorage
        const allRequests = loadRequestsFromStorage();
        return allRequests.filter((req) => {
          if (req.createdBy === userId) return true;
          if (req.assignees.some((a) => a.userId === userId)) return true;

          const creatorHierarchy = ROLE_HIERARCHY[req.createdByRole as UserRole] || 0;
          const userHierarchyLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;

          if (userHierarchyLevel > creatorHierarchy) {
            if (userRole === 'CEO') return true;
            if (userRole === 'DEO') return userDistrictId === req.createdByDistrictId;
            if (userRole === 'DDEO') return userDistrictId === req.createdByDistrictId;
            if (userRole === 'AEO') return userClusterId === req.createdByClusterId;
            if (userRole === 'HEAD_TEACHER') return userSchoolId === (req.createdBySchoolId || req.assignees[0]?.schoolId);
          }
          return false;
        });
      }
    },
    []
  );

  const getRequest = useCallback(
    async (requestId: string) => {
      try {
        // Call the API to get request from the database
        const response = await fetch(`/api/requests/${requestId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch request');
        }

        const data = await response.json();
        // Convert date strings to Date objects
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          dueDate: new Date(data.dueDate),
          assignees: data.assignees?.map((a: any) => ({
            ...a,
            submittedAt: a.submittedAt ? new Date(a.submittedAt) : undefined,
          })) || [],
        };
      } catch (error) {
        console.error('Error fetching request:', error);
        // Fallback to localStorage
        return requests.find((r) => r.id === requestId);
      }
    },
    [requests]
  );

  const updateAssigneeFields = useCallback(
    async (requestId: string, assigneeId: string, fields: DataField[]) => {
      try {
        // Call the API to update assignee in the database
        const response = await fetch(`/api/assignees/${assigneeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fieldResponses: fields,
            status: 'completed',
            submittedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update assignee');
        }

        // Update local state
        setRequests((prev) => {
          const updated = prev.map((req) => {
            if (req.id === requestId) {
              return {
                ...req,
                assignees: req.assignees.map((a) =>
                  a.id === assigneeId ? { ...a, fields, status: 'completed' as const, submittedAt: new Date() } : a
                ),
              };
            }
            return req;
          });
          return updated;
        });
      } catch (error) {
        console.error('Error updating assignee:', error);
        // Fallback to localStorage
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
          if (typeof window !== 'undefined') {
            localStorage.setItem('dataRequests', JSON.stringify(updated));
          }
          return updated;
        });
      }
    },
    []
  );

  const createRequest = useCallback(
    async (
      title: string,
      description: string,
      fields: DataField[],
      assignees: Omit<RequestAssignee, 'status' | 'fields' | 'id'>[],
      createdBy: string,
      createdByName: string,
      createdByRole: string,
      createdBySchoolId?: string,
      createdByClusterId?: string,
      createdByDistrictId?: string,
      descriptionVoiceUrl?: string,
      descriptionVoiceFileName?: string
    ) => {
      // Module-level protection against duplicate submissions
      if (isCreatingRequest) {
        console.log('[useMockDataRequests] Blocked duplicate request creation - already in progress');
        return null;
      }
      
      isCreatingRequest = true;
      console.log('[useMockDataRequests] Starting request creation');
      
      try {
        // Create the data request object
        const requestData = {
          title,
          description,
          descriptionVoiceUrl,
          descriptionVoiceFileName,
          fields,
          createdBy,
          createdByName,
          createdByRole,
          createdBySchoolId,
          createdByClusterId,
          createdByDistrictId,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          priority: 'medium',
          isArchived: false,
        };

        // Call the API to create request in the database
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Failed to create request');
        }

        const createdRequest = await response.json();

        // Create assignees for the request
        for (const assignee of assignees) {
          try {
            await fetch(`/api/requests/${createdRequest.id}/assignees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: assignee.userId,
                userName: assignee.userName,
                userRole: assignee.userRole,
                schoolId: assignee.schoolId,
                schoolName: assignee.schoolName,
                status: 'pending',
                fieldResponses: fields.map((f) => ({ ...f, value: undefined })),
              }),
            });
          } catch (error) {
            console.error('Error creating assignee:', error);
          }
        }

        // Convert date strings to Date objects
        const newRequest: DataRequest = {
          ...createdRequest,
          createdAt: new Date(createdRequest.createdAt),
          dueDate: new Date(createdRequest.dueDate),
          assignees: assignees.map((a) => ({
            id: `a-${Date.now()}-${assignees.indexOf(a)}`,
            ...a,
            status: 'pending' as const,
            fields: fields.map((f) => ({ ...f, value: undefined })),
          })),
        };

        // Update local state
        setRequests((prev) => [newRequest, ...prev]);

        return newRequest;
      } catch (error) {
        console.error('Error creating request:', error);

        // Fallback to localStorage
        const newRequest: DataRequest = {
          id: `req-${Date.now()}`,
          title,
          description,
          descriptionVoiceUrl,
          descriptionVoiceFileName,
          fields,
          createdBy,
          createdByName,
          createdByRole,
          createdBySchoolId,
          createdByClusterId,
          createdByDistrictId,
          createdAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
          if (typeof window !== 'undefined') {
            localStorage.setItem('dataRequests', JSON.stringify(updated));
          }
          return updated;
        });
        return newRequest;
      } finally {
        // Always reset the flag
        isCreatingRequest = false;
        console.log('[useMockDataRequests] Request creation completed, flag reset');
      }
    },
    []
  );

  const deleteRequest = useCallback(
    async (requestId: string) => {
      try {
        // Call the API to delete request from the database
        const response = await fetch(`/api/requests/${requestId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete request');
        }

        // Update local state
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
      } catch (error) {
        console.error('Error deleting request:', error);
        // Fallback to localStorage
        setRequests((prev) => {
          const updated = prev.filter((req) => req.id !== requestId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('dataRequests', JSON.stringify(updated));
          }
          return updated;
        });
      }
    },
    []
  );

  const updateRequest = useCallback(
    async (requestId: string, updates: Partial<DataRequest>) => {
      try {
        // Call the API to update request in the database
        const response = await fetch(`/api/requests/${requestId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update request');
        }

        // Update local state
        setRequests((prev) => {
          const updated = prev.map((req) =>
            req.id === requestId ? { ...req, ...updates } : req
          );
          return updated;
        });
      } catch (error) {
        console.error('Error updating request:', error);
        // Fallback to localStorage
        setRequests((prev) => {
          const updated = prev.map((req) =>
            req.id === requestId ? { ...req, ...updates } : req
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem('dataRequests', JSON.stringify(updated));
          }
          return updated;
        });
      }
    },
    []
  );

  return {
    requests,
    getRequestsForUser,
    getRequest,
    updateAssigneeFields,
    createRequest,
    deleteRequest,
    updateRequest,
  };
}
