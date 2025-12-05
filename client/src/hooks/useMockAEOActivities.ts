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

const MENTORING_INDICATORS = [
  {
    id: 'class-env',
    name: 'Classroom Environment',
    rubric: {
      emerging: 'Teacher-dominated discussions with minimal student participation',
      developing: 'Some student involvement in discussions with basic collaboration',
      proficient: 'Student-led discussions, active collaboration, strong critical thinking',
    },
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Planning',
    rubric: {
      emerging: 'Limited HOTS objectives, activities focus on recall/understanding',
      developing: 'Some HOTS objectives included, mix of recall and analysis activities',
      proficient: 'Clear HOTS objectives, activities for analysis, evaluation, synthesis, real-world integration',
    },
  },
  {
    id: 'instruction',
    name: 'Instructional Strategies',
    rubric: {
      emerging: 'Primarily direct instruction with closed-ended questions',
      developing: 'Mix of direct and inquiry-based instruction with some open-ended questions',
      proficient: 'Diverse strategies including open-ended questions, student analysis, problem-solving demonstrations',
    },
  },
  {
    id: 'student-engage',
    name: 'Student Engagement',
    rubric: {
      emerging: 'Limited student participation, passive learning',
      developing: 'Moderate student engagement in individual and small group tasks',
      proficient: 'High engagement in problem-solving, multiple perspectives explored, creative solutions valued',
    },
  },
  {
    id: 'assessment',
    name: 'Assessment & Feedback',
    rubric: {
      emerging: 'Limited feedback, focus on correctness only',
      developing: 'Some specific feedback provided, some self-assessment opportunities',
      proficient: 'Actionable feedback, peer and self-assessment practices, higher-order assignments',
    },
  },
  {
    id: 'resources',
    name: 'Resources for Collaboration',
    rubric: {
      emerging: 'Few or no resources available for student collaboration',
      developing: 'Basic resources available but organization could be improved',
      proficient: 'Well-organized, diverse resources readily available for collaborative problem-solving',
    },
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
    addMentoringVisit,
    addOfficeVisit,
    addOtherActivity,
    getAllActivities,
    mentoringIndicators: MENTORING_INDICATORS,
  };
}
