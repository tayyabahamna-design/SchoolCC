import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export const OTHER_ACTIVITIES_LIST = [
  'Attending in-service/departmental training',
  'Preparing/compiling official reports or data',
  'Community mobilization/outreach activities',
  'Handling hotline/complaint resolution',
  'Supervising or coordinating office/admin work',
  'Supporting school audits/inventory',
  'Facilitating exams/assessments',
  'Curriculum review and planning',
  'Teacher capacity building sessions',
  'Community engagement activities',
  'District-level coordination meetings',
  'Quality assurance and monitoring',
];

export const MENTORING_AREAS = [
  {
    id: 'classroom-env',
    name: 'Classroom Environment',
    indicators: [
      {
        id: 'ce-1',
        name: 'Physical Setup & Organization',
        description: 'Evaluate how well the classroom space is organized',
        rating: null,
        rubric: {
          emerging: 'Classroom is disorganized with cluttered learning materials',
          developing: 'Classroom is adequately organized with some learning resources available',
          proficient: 'Classroom is well-organized with clearly arranged learning materials and displays',
        },
      },
      {
        id: 'ce-2',
        name: 'Classroom Management & Discipline',
        description: 'Assess the teacher\'s ability to maintain order',
        rating: null,
        rubric: {
          emerging: 'Poor classroom management with frequent disruptions',
          developing: 'Adequate classroom management with occasional disruptions',
          proficient: 'Excellent classroom management with consistent procedures',
        },
      },
      {
        id: 'ce-3',
        name: 'Student-Centered Learning Environment',
        description: 'Observe whether the learning environment promotes student voice',
        rating: null,
        rubric: {
          emerging: 'Teacher-dominated environment with minimal student voice',
          developing: 'Some student involvement but primarily teacher-led',
          proficient: 'Student-centered environment that encourages collaboration',
        },
      },
    ],
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Planning',
    indicators: [
      {
        id: 'lp-1',
        name: 'Clear Learning Objectives',
        description: 'Check if the lesson has well-defined learning objectives',
        rating: null,
        rubric: {
          emerging: 'Lesson lacks clear objectives',
          developing: 'Lesson has basic objectives but may be unclear to students',
          proficient: 'Lesson has SMART objectives clearly communicated to students',
        },
      },
      {
        id: 'lp-2',
        name: 'Higher-Order Thinking Integration',
        description: 'Assess whether the lesson incorporates HOTS activities',
        rating: null,
        rubric: {
          emerging: 'Limited focus on HOTS; activities focus on recall only',
          developing: 'Some HOTS elements included',
          proficient: 'Strong HOTS focus with analysis, evaluation activities',
        },
      },
    ],
  },
  {
    id: 'instructional-strategies',
    name: 'Instructional Strategies',
    indicators: [
      {
        id: 'inst-1',
        name: 'Open-ended & Thought-Provoking Questions',
        description: 'Assess the use of open-ended questions',
        rating: null,
        rubric: {
          emerging: 'Primarily uses closed-ended recall questions',
          developing: 'Mix of closed and open-ended questions',
          proficient: 'Uses diverse, thought-provoking questions',
        },
      },
      {
        id: 'inst-2',
        name: 'Scaffolding for Complex Ideas',
        description: 'Assess how well the teacher provides guidance',
        rating: null,
        rubric: {
          emerging: 'Minimal scaffolding provided',
          developing: 'Some scaffolding provided but could be better structured',
          proficient: 'Well-structured scaffolding with appropriate levels of guidance',
        },
      },
    ],
  },
  {
    id: 'student-engagement',
    name: 'Student Engagement',
    indicators: [
      {
        id: 'se-1',
        name: 'Active Participation',
        description: 'Monitor the level of student involvement',
        rating: null,
        rubric: {
          emerging: 'Few students participate; mostly passive learning',
          developing: 'Moderate participation from majority of students',
          proficient: 'High engagement with all students actively participating',
        },
      },
      {
        id: 'se-2',
        name: 'On-Task Behavior',
        description: 'Assess how well students stay focused',
        rating: null,
        rubric: {
          emerging: 'Many students off-task or disengaged',
          developing: 'Most students on-task with occasional distractions',
          proficient: 'All students remain on-task throughout the lesson',
        },
      },
    ],
  },
  {
    id: 'assessment-feedback',
    name: 'Assessment & Feedback',
    indicators: [
      {
        id: 'af-1',
        name: 'Formative Assessment Practices',
        description: 'Observe how the teacher checks for understanding',
        rating: null,
        rubric: {
          emerging: 'Limited or no formative assessment used',
          developing: 'Some formative assessment used',
          proficient: 'Consistent formative assessment throughout lesson',
        },
      },
      {
        id: 'af-2',
        name: 'Quality of Feedback',
        description: 'Evaluate the quality of feedback provided',
        rating: null,
        rubric: {
          emerging: 'Minimal feedback provided',
          developing: 'Some specific feedback but could be more constructive',
          proficient: 'Regular, actionable feedback that guides improvement',
        },
      },
    ],
  },
];

export interface MonitoringVisitData {
  id: string;
  tehsil: string;
  markaz: string;
  aeoName: string;
  schoolName: string;
  visitDate: string;
  arrivalTime: string;
  departureTime: string;
  teacherTotal: number;
  teacherPresent: number;
  teacherPercentage: number;
  headTeacherStatus: 'yes' | 'no' | 'on_duty' | 'leave' | 'other';
  studentTotal: number;
  studentPresent: number;
  studentPercentage: number;
  furnitureTotal: number;
  furnitureWith: number;
  furnitureWithout: number;
  classroomObservation: 'good' | 'average' | 'need_improvement';
  lndEnglishPercent: number;
  lndUrduPercent: number;
  lndMathsPercent: number;
  nsbAllocation: number;
  nsbExpenditure: number;
  nsbBalance: number;
  nsbUtilizationPercent: number;
  toiletStudentTotal: number;
  toiletTotal: number;
  toiletRequired: number;
  drinkingWater: 'available' | 'not_available' | 'taste_issue';
  hygieneWashrooms: 'good' | 'average' | 'poor';
  hygieneBuilding: 'good' | 'average' | 'poor';
  hygieneClassrooms: 'good' | 'average' | 'poor';
  retentionTotal: number;
  retentionRetained: number;
  retentionDropped: number;
  partialFacilityTypes: string;
  partialFacilityReason: string;
  dataHealthVariation: number;
  generalRemarks: string;
  headTeacherSignature: boolean;
  aeoSignature: boolean;
  evidence: { id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[];
  status: 'draft' | 'submitted';
  submittedAt?: Date;
}

export interface MentoringVisitIndicator {
  id: string;
  name: string;
  rating: 'emerging' | 'developing' | 'proficient' | null;
  rubricText: string;
  examples: string;
}

export interface MentoringVisitData {
  id: string;
  aeoId: string;
  aeoName: string;
  schoolName: string;
  visitDate: string;
  arrivalTime: string;
  departureTime: string;
  classObserved: string;
  teacherName: string;
  subject: string;
  indicators: MentoringVisitIndicator[];
  generalFeedback: string;
  strengthsObserved: string;
  areasForImprovement: string;
  actionItems: string;
  evidence: { id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[];
  status: 'draft' | 'submitted';
  submittedAt?: Date;
}

export interface OfficeVisitData {
  id: string;
  aeoName: string;
  visitDate: string;
  arrivalTime: string;
  departureTime: string;
  purpose: string;
  activitiesCompleted: {
    admin: boolean;
    reporting: boolean;
    meeting: boolean;
    coordination: boolean;
    oversight: boolean;
    audit: boolean;
    exams: boolean;
    other: boolean;
    otherDescription?: string;
  };
  comments: string;
  evidence: { id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[];
  status: 'draft' | 'submitted';
  submittedAt?: Date;
}

export interface OtherActivityData {
  id: string;
  aeoName: string;
  activityType: string;
  activityDate: string;
  startTime: string;
  endTime: string;
  description: string;
  comments: string;
  evidence: { id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[];
  status: 'draft' | 'submitted';
  submittedAt?: Date;
}

interface ActivitiesContextType {
  monitoringVisits: MonitoringVisitData[];
  mentoringVisits: MentoringVisitData[];
  officeVisits: OfficeVisitData[];
  otherActivities: OtherActivityData[];
  addMonitoringVisit: (visit: MonitoringVisitData) => void;
  addMentoringVisit: (visit: MentoringVisitData) => void;
  addOfficeVisit: (visit: OfficeVisitData) => void;
  addOtherActivity: (activity: OtherActivityData) => void;
  getAllActivities: () => {
    monitoring: MonitoringVisitData[];
    mentoring: MentoringVisitData[];
    office: OfficeVisitData[];
    other: OtherActivityData[];
  };
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [monitoringVisits, setMonitoringVisits] = useState<MonitoringVisitData[]>([]);
  const [mentoringVisits, setMentoringVisits] = useState<MentoringVisitData[]>([]);
  const [officeVisits, setOfficeVisits] = useState<OfficeVisitData[]>([]);
  const [otherActivities, setOtherActivities] = useState<OtherActivityData[]>([]);

  // Load activities from the API on mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const [monitoringRes, mentoringRes, officeRes, otherRes] = await Promise.all([
          fetch('/api/activities/monitoring'),
          fetch('/api/activities/mentoring'),
          fetch('/api/activities/office'),
          fetch('/api/activities/other'),
        ]);

        if (monitoringRes.ok) {
          const data = await monitoringRes.json();
          setMonitoringVisits(data);
        }
        if (mentoringRes.ok) {
          const data = await mentoringRes.json();
          setMentoringVisits(data);
        }
        if (officeRes.ok) {
          const data = await officeRes.json();
          setOfficeVisits(data);
        }
        if (otherRes.ok) {
          const data = await otherRes.json();
          setOtherActivities(data);
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
      }
    };

    loadActivities();
  }, []);

  const addMonitoringVisit = useCallback(async (visit: MonitoringVisitData) => {
    // Omit frontend-generated id - server will generate it
    const { id, ...visitData } = visit as any;
    const response = await fetch('/api/activities/monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to save monitoring visit' }));
      throw new Error(error.details || error.error || 'Failed to save monitoring visit');
    }
    const savedVisit = await response.json();
    setMonitoringVisits((prev) => [...prev, savedVisit]);
    return savedVisit;
  }, []);

  const addMentoringVisit = useCallback(async (visit: MentoringVisitData) => {
    const { id, ...visitData } = visit as any;
    const response = await fetch('/api/activities/mentoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to save mentoring visit' }));
      throw new Error(error.details || error.error || 'Failed to save mentoring visit');
    }
    const savedVisit = await response.json();
    setMentoringVisits((prev) => [...prev, savedVisit]);
    return savedVisit;
  }, []);

  const addOfficeVisit = useCallback(async (visit: OfficeVisitData) => {
    const { id, ...visitData } = visit as any;
    const response = await fetch('/api/activities/office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to save office visit' }));
      throw new Error(error.details || error.error || 'Failed to save office visit');
    }
    const savedVisit = await response.json();
    setOfficeVisits((prev) => [...prev, savedVisit]);
    return savedVisit;
  }, []);

  const addOtherActivity = useCallback(async (activity: OtherActivityData) => {
    const { id, ...activityData } = activity as any;
    const response = await fetch('/api/activities/other', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to save other activity' }));
      throw new Error(error.details || error.error || 'Failed to save other activity');
    }
    const savedActivity = await response.json();
    setOtherActivities((prev) => [...prev, savedActivity]);
    return savedActivity;
  }, []);

  const getAllActivities = useCallback(() => {
    return {
      monitoring: monitoringVisits,
      mentoring: mentoringVisits,
      office: officeVisits,
      other: otherActivities,
    };
  }, [monitoringVisits, mentoringVisits, officeVisits, otherActivities]);

  return (
    <ActivitiesContext.Provider
      value={{
        monitoringVisits,
        mentoringVisits,
        officeVisits,
        otherActivities,
        addMonitoringVisit,
        addMentoringVisit,
        addOfficeVisit,
        addOtherActivity,
        getAllActivities,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
}
