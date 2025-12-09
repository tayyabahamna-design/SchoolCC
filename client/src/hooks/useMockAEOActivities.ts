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
    description?: string;
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
        description: 'Evaluate how well the classroom space is organized, including arrangement of furniture, availability of learning materials, and overall classroom aesthetics.',
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
        description: 'Assess the teacher\'s ability to maintain order, implement consistent procedures, and manage student behavior effectively throughout the lesson.',
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
        description: 'Observe whether the learning environment promotes student voice, choice, and active participation in meaningful learning activities.',
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
        description: 'Check if the lesson has well-defined learning objectives that are specific, measurable, achievable, relevant, and time-bound (SMART).',
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
        description: 'Assess whether the lesson incorporates activities that promote analysis, evaluation, synthesis, and creative problem-solving beyond simple recall.',
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
        description: 'Evaluate the quality, variety, and appropriate use of teaching materials and resources to support student learning.',
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
        name: 'Open-ended & Thought-Provoking Questions',
        description: 'Assess the use of open-ended questions by the teacher to promote critical thinking and deeper understanding.',
        rating: null,
        rubric: {
          emerging: 'Primarily uses closed-ended recall questions',
          developing: 'Mix of closed and open-ended questions with some depth',
          proficient: 'Uses diverse, thought-provoking questions to promote critical thinking',
        },
      },
      {
        id: 'inst-2',
        name: 'Student Analysis, Critique & Argumentation',
        description: 'Evaluate opportunities for students to analyze, critique, and construct arguments about content.',
        rating: null,
        rubric: {
          emerging: 'Limited opportunities for student analysis or critique',
          developing: 'Some analysis tasks present but critique/argumentation is limited',
          proficient: 'Regular opportunities for students to analyze, critique, and build arguments',
        },
      },
      {
        id: 'inst-3',
        name: 'Problem-Solving & Creativity Demonstration',
        description: 'Observe the teacher demonstrating and modeling problem-solving approaches and creative thinking strategies.',
        rating: null,
        rubric: {
          emerging: 'Limited demonstration of problem-solving or creative approaches',
          developing: 'Some demonstration of problem-solving with limited variety',
          proficient: 'Clear modeling of multiple problem-solving and creative thinking strategies',
        },
      },
      {
        id: 'inst-4',
        name: 'Scaffolding for Complex Ideas',
        description: 'Assess how well the teacher provides varying levels of guidance and support to help students understand complex concepts.',
        rating: null,
        rubric: {
          emerging: 'Minimal scaffolding provided; complex ideas presented without support',
          developing: 'Some scaffolding provided but could be better structured or sequenced',
          proficient: 'Well-structured scaffolding with appropriate levels of guidance for complex learning',
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
        description: 'Monitor the level and quality of student involvement in classroom discussions, activities, and responses to questions.',
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
        description: 'Assess how well students stay focused on learning tasks and maintain engagement with the lesson content.',
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
        description: 'Evaluate evidence of students applying higher-order thinking skills to analyze, evaluate, and solve problems.',
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
        description: 'Observe how the teacher checks for student understanding during the lesson through informal methods like questioning and observation.',
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
        description: 'Evaluate the quality and specificity of feedback provided to students to guide their learning and improvement.',
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
        description: 'Assess opportunities provided for students to reflect on their own learning and evaluate peer work.',
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
