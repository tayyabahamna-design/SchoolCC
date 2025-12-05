import { useState, useCallback } from 'react';

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

export interface MentoringVisitArea {
  id: string;
  name: string;
  indicators: Array<{
    id: string;
    name: string;
    rating: 'emerging' | 'developing' | 'proficient' | null;
    rubric: {
      emerging: string;
      developing: string;
      proficient: string;
    };
  }>;
}

export interface MentoringVisitData {
  id: string;
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

const MENTORING_AREAS = [
  {
    id: 'classroom-env',
    name: 'Classroom Environment',
    indicators: [
      {
        id: 'ce-1',
        name: 'Physical Setup & Organization',
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
        rating: null,
        rubric: {
          emerging: 'Poor classroom management with frequent disruptions and off-task behavior',
          developing: 'Adequate classroom management with occasional disruptions',
          proficient: 'Excellent classroom management with consistent procedures and positive student behavior',
        },
      },
      {
        id: 'ce-3',
        name: 'Student-Centered Learning Environment',
        rating: null,
        rubric: {
          emerging: 'Teacher-dominated environment with minimal student voice',
          developing: 'Some student involvement but primarily teacher-led',
          proficient: 'Student-centered environment that encourages collaboration and peer learning',
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
        rating: null,
        rubric: {
          emerging: 'Limited focus on HOTS; activities focus on recall only',
          developing: 'Some HOTS elements included with mix of recall and analysis activities',
          proficient: 'Strong HOTS focus with analysis, evaluation, and synthesis activities',
        },
      },
      {
        id: 'lp-3',
        name: 'Resource & Material Planning',
        rating: null,
        rubric: {
          emerging: 'Few or inadequate resources planned for the lesson',
          developing: 'Basic resources planned but not optimally utilized',
          proficient: 'Well-planned, varied resources effectively integrated into lesson',
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
        name: 'Direct Instruction Effectiveness',
        rating: null,
        rubric: {
          emerging: 'Instruction is unclear or difficult to follow',
          developing: 'Instruction is generally clear with some areas lacking detail',
          proficient: 'Clear, well-structured instruction that builds understanding systematically',
        },
      },
      {
        id: 'inst-2',
        name: 'Questioning Techniques',
        rating: null,
        rubric: {
          emerging: 'Primarily uses closed-ended recall questions',
          developing: 'Mix of closed and open-ended questions with some depth',
          proficient: 'Uses diverse questioning strategies to promote critical thinking',
        },
      },
      {
        id: 'inst-3',
        name: 'Interactive & Collaborative Methods',
        rating: null,
        rubric: {
          emerging: 'Limited use of group work or collaborative learning',
          developing: 'Some collaborative activities but not optimally structured',
          proficient: 'Regular use of well-structured collaborative and interactive learning strategies',
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
        rating: null,
        rubric: {
          emerging: 'Many students off-task or disengaged',
          developing: 'Most students on-task with occasional distractions',
          proficient: 'All students remain on-task throughout the lesson',
        },
      },
      {
        id: 'se-3',
        name: 'Critical Thinking & Problem-Solving',
        rating: null,
        rubric: {
          emerging: 'Limited evidence of student problem-solving or critical thinking',
          developing: 'Some students engage in problem-solving activities',
          proficient: 'Students actively engage in critical thinking and solve complex problems',
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
        rating: null,
        rubric: {
          emerging: 'Limited or no formative assessment used',
          developing: 'Some formative assessment used to check understanding',
          proficient: 'Consistent formative assessment throughout lesson to guide instruction',
        },
      },
      {
        id: 'af-2',
        name: 'Quality of Feedback',
        rating: null,
        rubric: {
          emerging: 'Minimal feedback or only correctness feedback provided',
          developing: 'Some specific feedback but could be more constructive',
          proficient: 'Regular, actionable feedback that guides student improvement',
        },
      },
      {
        id: 'af-3',
        name: 'Student Self & Peer Assessment',
        rating: null,
        rubric: {
          emerging: 'No opportunities for student self or peer assessment',
          developing: 'Limited opportunities for self or peer assessment',
          proficient: 'Regular opportunities for students to assess themselves and peers',
        },
      },
    ],
  },
];

export function useMockAEOActivities() {
  const [monitoringVisits, setMonitoringVisits] = useState<MonitoringVisitData[]>([]);
  const [mentoringVisits, setMentoringVisits] = useState<MentoringVisitData[]>([]);
  const [officeVisits, setOfficeVisits] = useState<OfficeVisitData[]>([]);
  const [otherActivities, setOtherActivities] = useState<OtherActivityData[]>([]);

  const addMonitoringVisit = useCallback((visit: MonitoringVisitData) => {
    setMonitoringVisits((prev) => [...prev, visit]);
  }, []);

  const addMentoringVisit = useCallback((visit: MentoringVisitData) => {
    setMentoringVisits((prev) => [...prev, visit]);
  }, []);

  const addOfficeVisit = useCallback((visit: OfficeVisitData) => {
    setOfficeVisits((prev) => [...prev, visit]);
  }, []);

  const addOtherActivity = useCallback((activity: OtherActivityData) => {
    setOtherActivities((prev) => [...prev, activity]);
  }, []);

  const getAllActivities = useCallback(() => {
    return {
      monitoring: monitoringVisits,
      mentoring: mentoringVisits,
      office: officeVisits,
      other: otherActivities,
    };
  }, [monitoringVisits, mentoringVisits, officeVisits, otherActivities]);

  return {
    addMonitoringVisit,
    monitoringVisits,
    addMentoringVisit,
    mentoringVisits,
    addOfficeVisit,
    officeVisits,
    addOtherActivity,
    otherActivities,
    getAllActivities,
    mentoringAreas: MENTORING_AREAS,
  };
}
