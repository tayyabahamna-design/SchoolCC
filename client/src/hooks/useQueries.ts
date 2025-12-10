import { useState, useCallback } from 'react';

export interface Query {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderSchoolId?: string;
  senderSchoolName?: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryResponse {
  id: string;
  queryId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdAt: Date;
}

const initialQueries: Query[] = [
  {
    id: 'q1',
    ticketNumber: 'TKT-001',
    subject: 'Request for Classroom Repair',
    message: 'The ceiling fan in Class 3 is not working and needs immediate repair. Students are facing difficulty due to heat.',
    senderId: 'teacher-1',
    senderName: 'Teacher 1',
    senderRole: 'TEACHER',
    senderSchoolId: 'SCH-001',
    senderSchoolName: 'GGPS Chakra',
    recipientId: 'ht-1',
    recipientName: 'Headmaster - GGPS Chakra',
    recipientRole: 'HEAD_TEACHER',
    status: 'open',
    priority: 'high',
    category: 'infrastructure',
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-08'),
  },
  {
    id: 'q2',
    ticketNumber: 'TKT-002',
    subject: 'Leave Application Query',
    message: 'I submitted my leave application last week but have not received any update. Please advise on the status.',
    senderId: 'teacher-2',
    senderName: 'Teacher 2',
    senderRole: 'TEACHER',
    senderSchoolId: 'SCH-001',
    senderSchoolName: 'GGPS Chakra',
    recipientId: 'aeo-1',
    recipientName: 'Abdul Mateen Mughal',
    recipientRole: 'AEO',
    status: 'in_progress',
    priority: 'medium',
    category: 'leave',
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-07'),
  },
  {
    id: 'q3',
    ticketNumber: 'TKT-003',
    subject: 'Salary Discrepancy',
    message: 'My salary for November was less than expected. There seems to be an incorrect deduction. Please look into this matter.',
    senderId: 'teacher-3',
    senderName: 'Teacher 3',
    senderRole: 'TEACHER',
    senderSchoolId: 'SCH-002',
    senderSchoolName: 'GGPS Carriage Factory',
    recipientId: 'deo-1',
    recipientName: 'DEO User',
    recipientRole: 'DEO',
    status: 'resolved',
    priority: 'high',
    category: 'general',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-06'),
  },
];

const initialResponses: QueryResponse[] = [
  {
    id: 'r1',
    queryId: 'q2',
    senderId: 'aeo-1',
    senderName: 'Abdul Mateen Mughal',
    senderRole: 'AEO',
    message: 'I have received your query. I am looking into the leave application status and will update you soon.',
    createdAt: new Date('2024-12-06'),
  },
  {
    id: 'r2',
    queryId: 'q3',
    senderId: 'deo-1',
    senderName: 'DEO User',
    senderRole: 'DEO',
    message: 'The salary discrepancy has been identified. It was due to a system error. The correction will be made in the next month salary.',
    createdAt: new Date('2024-12-06'),
  },
];

let ticketCounter = 4;

export function useQueries() {
  const [queries, setQueries] = useState<Query[]>(initialQueries);
  const [responses, setResponses] = useState<QueryResponse[]>(initialResponses);

  const generateTicketNumber = useCallback(() => {
    const num = ticketCounter++;
    return `TKT-${String(num).padStart(3, '0')}`;
  }, []);

  const getQueriesBySender = useCallback((senderId: string) => {
    return queries.filter(q => q.senderId === senderId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [queries]);

  const getQueriesByRecipient = useCallback((recipientId: string) => {
    return queries.filter(q => q.recipientId === recipientId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [queries]);

  const getQueriesBySchool = useCallback((schoolId: string) => {
    return queries.filter(q => q.senderSchoolId === schoolId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [queries]);

  const getAllQueries = useCallback(() => {
    return [...queries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [queries]);

  const getQueryById = useCallback((queryId: string) => {
    return queries.find(q => q.id === queryId);
  }, [queries]);

  const getResponsesByQuery = useCallback((queryId: string) => {
    return responses.filter(r => r.queryId === queryId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [responses]);

  const createQuery = useCallback((query: Omit<Query, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newQuery: Query = {
      ...query,
      id: `q${Date.now()}`,
      ticketNumber: generateTicketNumber(),
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setQueries(prev => [newQuery, ...prev]);
    return newQuery;
  }, [generateTicketNumber]);

  const updateQueryStatus = useCallback((queryId: string, status: Query['status']) => {
    setQueries(prev => prev.map(q => {
      if (q.id === queryId) {
        return { ...q, status, updatedAt: new Date() };
      }
      return q;
    }));
  }, []);

  const addResponse = useCallback((response: Omit<QueryResponse, 'id' | 'createdAt'>) => {
    const newResponse: QueryResponse = {
      ...response,
      id: `r${Date.now()}`,
      createdAt: new Date(),
    };
    setResponses(prev => [...prev, newResponse]);
    
    setQueries(prev => prev.map(q => {
      if (q.id === response.queryId) {
        return { ...q, status: 'in_progress' as const, updatedAt: new Date() };
      }
      return q;
    }));
    
    return newResponse;
  }, []);

  return {
    queries,
    responses,
    getQueriesBySender,
    getQueriesByRecipient,
    getQueriesBySchool,
    getAllQueries,
    getQueryById,
    getResponsesByQuery,
    createQuery,
    updateQueryStatus,
    addResponse,
  };
}
