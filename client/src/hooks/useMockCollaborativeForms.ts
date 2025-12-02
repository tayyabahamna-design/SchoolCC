import { useState, useCallback } from 'react';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'date';
  required: boolean;
}

export interface TeacherResponse {
  id: string;
  teacherId: string;
  teacherName: string;
  data: Record<string, any>;
  submittedAt?: Date;
  status: 'draft' | 'submitted';
}

export interface CollaborativeForm {
  id: string;
  schoolId: string;
  schoolName: string;
  title: string;
  description: string;
  fields: FormField[];
  responses: TeacherResponse[];
  createdBy: string;
  createdByName: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const mockForms: CollaborativeForm[] = [
  {
    id: 'form-1',
    schoolId: 'school-1',
    schoolName: 'Government Primary School, Zone A',
    title: 'Teacher Information Form',
    description: 'Collect updated teacher information including spouse details',
    fields: [
      { id: 'f-1', name: 'Teacher Name', type: 'text', required: true },
      { id: 'f-2', name: 'Employee Number', type: 'text', required: true },
      { id: 'f-3', name: 'Spouse Name', type: 'text', required: false },
      { id: 'f-4', name: 'Contact Number', type: 'text', required: true },
      { id: 'f-5', name: 'Date of Birth', type: 'date', required: true },
    ],
    responses: [
      {
        id: 'resp-1',
        teacherId: 'teacher-1',
        teacherName: 'Ms. Priya Singh',
        data: {
          'f-1': 'Ms. Priya Singh',
          'f-2': 'T-001',
          'f-3': 'Mr. Raj Singh',
          'f-4': '9876543210',
          'f-5': '1990-05-15',
        },
        status: 'submitted',
        submittedAt: new Date(Date.now() - 86400000),
      },
    ],
    createdBy: 'head-1',
    createdByName: 'Mr. Rajesh Kumar',
    status: 'active',
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 86400000),
  },
];

export function useMockCollaborativeForms() {
  const [forms, setForms] = useState<CollaborativeForm[]>(mockForms);

  const getFormsBySchool = useCallback((schoolId: string) => {
    return forms.filter((f) => f.schoolId === schoolId);
  }, [forms]);

  const getForm = useCallback((formId: string) => {
    return forms.find((f) => f.id === formId);
  }, [forms]);

  const createForm = useCallback(
    (
      schoolId: string,
      schoolName: string,
      title: string,
      description: string,
      fields: FormField[],
      userId: string,
      userName: string
    ): CollaborativeForm => {
      const newForm: CollaborativeForm = {
        id: `form-${Date.now()}`,
        schoolId,
        schoolName,
        title,
        description,
        fields,
        responses: [],
        createdBy: userId,
        createdByName: userName,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setForms((prev) => [newForm, ...prev]);
      return newForm;
    },
    []
  );

  const submitResponse = useCallback(
    (formId: string, teacherId: string, teacherName: string, data: Record<string, any>) => {
      setForms((prev) =>
        prev.map((f) => {
          if (f.id === formId) {
            const existingResponse = f.responses.find((r) => r.teacherId === teacherId);
            if (existingResponse) {
              return {
                ...f,
                responses: f.responses.map((r) =>
                  r.teacherId === teacherId
                    ? {
                        ...r,
                        data,
                        status: 'submitted' as const,
                        submittedAt: new Date(),
                      }
                    : r
                ),
                updatedAt: new Date(),
              };
            } else {
              return {
                ...f,
                responses: [
                  ...f.responses,
                  {
                    id: `resp-${Date.now()}`,
                    teacherId,
                    teacherName,
                    data,
                    status: 'submitted',
                    submittedAt: new Date(),
                  },
                ],
                updatedAt: new Date(),
              };
            }
          }
          return f;
        })
      );
    },
    []
  );

  const saveAsDraft = useCallback(
    (formId: string, teacherId: string, teacherName: string, data: Record<string, any>) => {
      setForms((prev) =>
        prev.map((f) => {
          if (f.id === formId) {
            const existingResponse = f.responses.find((r) => r.teacherId === teacherId);
            if (existingResponse) {
              return {
                ...f,
                responses: f.responses.map((r) =>
                  r.teacherId === teacherId ? { ...r, data, status: 'draft' as const } : r
                ),
                updatedAt: new Date(),
              };
            } else {
              return {
                ...f,
                responses: [
                  ...f.responses,
                  {
                    id: `resp-${Date.now()}`,
                    teacherId,
                    teacherName,
                    data,
                    status: 'draft',
                  },
                ],
                updatedAt: new Date(),
              };
            }
          }
          return f;
        })
      );
    },
    []
  );

  const closeForm = useCallback((formId: string) => {
    setForms((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, status: 'closed' as const } : f))
    );
  }, []);

  return {
    forms,
    getFormsBySchool,
    getForm,
    createForm,
    submitResponse,
    saveAsDraft,
    closeForm,
  };
}
