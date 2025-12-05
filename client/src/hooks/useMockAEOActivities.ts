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
    id: 'classroom-env',
    name: 'Classroom Environment',
    rubric: {
      emerging: 'Disorganized environment with poor classroom management and minimal student engagement',
      developing: 'Fairly organized environment with adequate classroom management and moderate student engagement',
      proficient: 'Well-organized, positive learning environment with strong classroom management and active student participation',
    },
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Planning',
    rubric: {
      emerging: 'Lessons lack clear objectives and structured planning',
      developing: 'Lessons have some objectives and basic structure but could be more comprehensive',
      proficient: 'Well-planned lessons with clear objectives, structured activities, and alignment with curriculum standards',
    },
  },
  {
    id: 'instructional-strategies',
    name: 'Instructional Strategies',
    rubric: {
      emerging: 'Relies primarily on lecture and passive teaching methods',
      developing: 'Mix of traditional and some interactive teaching methods with limited differentiation',
      proficient: 'Diverse, interactive strategies including group work, critical thinking, and differentiated instruction',
    },
  },
  {
    id: 'student-engagement',
    name: 'Student Engagement',
    rubric: {
      emerging: 'Low student participation and engagement with learning activities',
      developing: 'Moderate engagement with some students participating actively',
      proficient: 'High engagement across all students with active participation in meaningful learning activities',
    },
  },
  {
    id: 'assessment-feedback',
    name: 'Assessment & Feedback',
    rubric: {
      emerging: 'Limited assessment practices and minimal feedback to students',
      developing: 'Some formative assessment and basic feedback provided to guide learning',
      proficient: 'Comprehensive assessment strategies with constructive feedback and clear guidance for improvement',
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
