import { useState, useCallback } from 'react';
import { realSchools, realAEOs } from '@/data/realData';

// Build school names lookup from real data
const SCHOOL_NAMES: Record<string, string> = realSchools.reduce((acc, school) => {
  acc[school.code] = school.name;
  return acc;
}, {} as Record<string, string>);

export interface ActivityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  timestamp: Date;
}

export interface ActivityReaction {
  id: string;
  type: 'like' | 'love' | 'clap' | 'celebrate';
  userId: string;
  userName: string;
}

export interface Activity {
  id: string;
  schoolId: string;
  schoolName: string;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  title: string;
  description: string;
  photos: { id: string; url: string; caption: string }[];
  comments: ActivityComment[];
  reactions: ActivityReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const mockActivities: Activity[] = [
  {
    id: 'act-1',
    schoolId: 'SCH-001',
    schoolName: SCHOOL_NAMES['SCH-001'] || 'GGPS Chakra',
    createdBy: 'teacher-1',
    createdByName: 'Teacher 1',
    createdByRole: 'TEACHER',
    title: 'Science Fair - Interactive Learning',
    description: 'Our students participated in an amazing science fair where they learned about renewable energy and created working models. Great enthusiasm and learning outcomes!',
    photos: [
      { id: 'p-1', url: 'photo1.jpg', caption: 'Students presenting renewable energy projects' },
      { id: 'p-2', url: 'photo2.jpg', caption: 'Solar panel demonstration' },
      { id: 'p-3', url: 'photo3.jpg', caption: 'Interactive learning session' },
    ],
    comments: [
      {
        id: 'c-1',
        authorId: 'aeo-1',
        authorName: realAEOs[0].name,
        authorRole: 'AEO',
        text: 'Excellent initiative! Great to see students so engaged in learning.',
        timestamp: new Date(Date.now() - 86400000),
      },
    ],
    reactions: [
      { id: 'r-1', type: 'love', userId: 'aeo-1', userName: realAEOs[0].name },
      { id: 'r-2', type: 'clap', userId: 'head-1', userName: 'Head Teacher' },
    ],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'act-2',
    schoolId: 'SCH-001',
    schoolName: SCHOOL_NAMES['SCH-001'] || 'GGPS Chakra',
    createdBy: 'teacher-2',
    createdByName: 'Teacher 2',
    createdByRole: 'TEACHER',
    title: 'Sports Day Celebrations',
    description: 'Amazing sports day with students showing great sportsmanship and team spirit. Various competitions were held.',
    photos: [
      { id: 'p-4', url: 'photo4.jpg', caption: '100m race finals' },
      { id: 'p-5', url: 'photo5.jpg', caption: 'Relay race action' },
    ],
    comments: [],
    reactions: [
      { id: 'r-3', type: 'celebrate', userId: 'head-1', userName: 'Head Teacher' },
    ],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
  },
  {
    id: 'act-3',
    schoolId: 'SCH-001',
    schoolName: SCHOOL_NAMES['SCH-001'] || 'GGPS Chakra',
    createdBy: 'teacher-1',
    createdByName: 'Teacher 1',
    createdByRole: 'TEACHER',
    title: 'Tree Plantation Drive',
    description: 'Students and staff came together for a tree plantation drive. Over 50 saplings were planted in the school premises. Students learned about environmental conservation.',
    photos: [
      { id: 'p-6', url: 'photo6.jpg', caption: 'Students planting saplings' },
      { id: 'p-7', url: 'photo7.jpg', caption: 'Group photo with planted trees' },
    ],
    comments: [
      {
        id: 'c-2',
        authorId: 'deo-1',
        authorName: 'DEO User',
        authorRole: 'DEO',
        text: 'This is exactly the kind of initiative we need! Well done team.',
        timestamp: new Date(Date.now() - 43200000),
      },
    ],
    reactions: [
      { id: 'r-4', type: 'love', userId: 'deo-1', userName: 'DEO User' },
      { id: 'r-5', type: 'clap', userId: 'aeo-1', userName: realAEOs[0].name },
      { id: 'r-6', type: 'celebrate', userId: 'ceo-1', userName: 'CEO User' },
    ],
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 345600000),
  },
  {
    id: 'act-4',
    schoolId: 'SCH-002',
    schoolName: SCHOOL_NAMES['SCH-002'] || 'GGPS Carriage Factory',
    createdBy: 'teacher-3',
    createdByName: 'Teacher 3',
    createdByRole: 'TEACHER',
    title: 'Annual Function 2024',
    description: 'Our annual function was a grand success! Students performed various cultural programs including traditional dances, poetry recitation, and drama. Parents and community members attended in large numbers.',
    photos: [
      { id: 'p-8', url: 'photo8.jpg', caption: 'Cultural dance performance' },
      { id: 'p-9', url: 'photo9.jpg', caption: 'Poetry recitation by students' },
      { id: 'p-10', url: 'photo10.jpg', caption: 'Prize distribution ceremony' },
    ],
    comments: [
      {
        id: 'c-3',
        authorId: 'ddeo-1',
        authorName: 'DDEO User',
        authorRole: 'DDEO',
        text: 'Wonderful event! Great job organizing such a comprehensive program.',
        timestamp: new Date(Date.now() - 129600000),
      },
    ],
    reactions: [
      { id: 'r-7', type: 'celebrate', userId: 'ddeo-1', userName: 'DDEO User' },
      { id: 'r-8', type: 'love', userId: 'aeo-1', userName: realAEOs[0].name },
    ],
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 432000000),
  },
  {
    id: 'act-5',
    schoolId: 'SCH-002',
    schoolName: SCHOOL_NAMES['SCH-002'] || 'GGPS Carriage Factory',
    createdBy: 'teacher-4',
    createdByName: 'Teacher 4',
    createdByRole: 'TEACHER',
    title: 'Computer Lab Inauguration',
    description: 'New computer lab with 20 computers has been inaugurated. Students are now learning basic computing skills and coding. This will greatly enhance their digital literacy.',
    photos: [
      { id: 'p-11', url: 'photo11.jpg', caption: 'Students in the new computer lab' },
      { id: 'p-12', url: 'photo12.jpg', caption: 'First coding session' },
    ],
    comments: [
      {
        id: 'c-4',
        authorId: 'ceo-1',
        authorName: 'CEO User',
        authorRole: 'CEO',
        text: 'Excellent progress! Digital education is the future.',
        timestamp: new Date(Date.now() - 216000000),
      },
      {
        id: 'c-5',
        authorId: 'deo-1',
        authorName: 'DEO User',
        authorRole: 'DEO',
        text: 'Great investment in student development!',
        timestamp: new Date(Date.now() - 215000000),
      },
    ],
    reactions: [
      { id: 'r-9', type: 'celebrate', userId: 'ceo-1', userName: 'CEO User' },
      { id: 'r-10', type: 'love', userId: 'deo-1', userName: 'DEO User' },
      { id: 'r-11', type: 'clap', userId: 'ddeo-1', userName: 'DDEO User' },
    ],
    createdAt: new Date(Date.now() - 518400000),
    updatedAt: new Date(Date.now() - 518400000),
  },
  {
    id: 'act-6',
    schoolId: 'SCH-003',
    schoolName: SCHOOL_NAMES['SCH-003'] || 'GES JAWA',
    createdBy: 'teacher-5',
    createdByName: 'Teacher 5',
    createdByRole: 'TEACHER',
    title: 'Mathematics Olympiad Winners',
    description: 'Our students won first and second prizes in the district level Mathematics Olympiad! Hard work and dedication of both students and teachers paid off.',
    photos: [
      { id: 'p-13', url: 'photo13.jpg', caption: 'Winners with their trophies' },
      { id: 'p-14', url: 'photo14.jpg', caption: 'Award ceremony moment' },
    ],
    comments: [
      {
        id: 'c-6',
        authorId: 'deo-1',
        authorName: 'DEO User',
        authorRole: 'DEO',
        text: 'Proud moment for the district! Congratulations to all.',
        timestamp: new Date(Date.now() - 302400000),
      },
    ],
    reactions: [
      { id: 'r-12', type: 'celebrate', userId: 'deo-1', userName: 'DEO User' },
      { id: 'r-13', type: 'clap', userId: 'ddeo-1', userName: 'DDEO User' },
      { id: 'r-14', type: 'love', userId: 'aeo-1', userName: realAEOs[0].name },
      { id: 'r-15', type: 'like', userId: 'ceo-1', userName: 'CEO User' },
    ],
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 604800000),
  },
  {
    id: 'act-7',
    schoolId: 'SCH-003',
    schoolName: SCHOOL_NAMES['SCH-003'] || 'GES JAWA',
    createdBy: 'teacher-6',
    createdByName: 'Teacher 6',
    createdByRole: 'TEACHER',
    title: 'Library Renovation Complete',
    description: 'Our school library has been completely renovated with new furniture, books, and a reading corner. Students now have access to over 1000 books covering various subjects.',
    photos: [
      { id: 'p-15', url: 'photo15.jpg', caption: 'Renovated library interior' },
      { id: 'p-16', url: 'photo16.jpg', caption: 'Students exploring new books' },
    ],
    comments: [],
    reactions: [
      { id: 'r-16', type: 'love', userId: 'ddeo-1', userName: 'DDEO User' },
    ],
    createdAt: new Date(Date.now() - 691200000),
    updatedAt: new Date(Date.now() - 691200000),
  },
  {
    id: 'act-8',
    schoolId: 'SCH-001',
    schoolName: SCHOOL_NAMES['SCH-001'] || 'GGPS Chakra',
    createdBy: 'head-1',
    createdByName: 'Head Teacher',
    createdByRole: 'HEAD_TEACHER',
    title: 'Parent-Teacher Meeting Success',
    description: 'Our quarterly parent-teacher meeting had excellent attendance with over 90% parents participating. Discussed student progress, upcoming events, and parent feedback.',
    photos: [
      { id: 'p-17', url: 'photo17.jpg', caption: 'Parents attending the meeting' },
      { id: 'p-18', url: 'photo18.jpg', caption: 'Teachers presenting student reports' },
    ],
    comments: [
      {
        id: 'c-7',
        authorId: 'aeo-1',
        authorName: realAEOs[0].name,
        authorRole: 'AEO',
        text: 'Excellent parent engagement! This is how schools build strong communities.',
        timestamp: new Date(Date.now() - 518400000),
      },
    ],
    reactions: [
      { id: 'r-17', type: 'clap', userId: 'aeo-1', userName: realAEOs[0].name },
      { id: 'r-18', type: 'love', userId: 'deo-1', userName: 'DEO User' },
      { id: 'r-19', type: 'like', userId: 'teacher-1', userName: 'Teacher 1' },
    ],
    createdAt: new Date(Date.now() - 777600000),
    updatedAt: new Date(Date.now() - 777600000),
  },
  {
    id: 'act-9',
    schoolId: 'SCH-002',
    schoolName: SCHOOL_NAMES['SCH-002'] || 'GGPS Carriage Factory',
    createdBy: 'teacher-3',
    createdByName: 'Teacher 3',
    createdByRole: 'TEACHER',
    title: 'Art & Craft Exhibition',
    description: 'Students displayed their creative artwork including paintings, sketches, and craft items. The exhibition showcased exceptional talent of our young artists.',
    photos: [
      { id: 'p-19', url: 'photo19.jpg', caption: 'Student artwork on display' },
      { id: 'p-20', url: 'photo20.jpg', caption: 'Creative craft projects' },
      { id: 'p-21', url: 'photo21.jpg', caption: 'Students presenting their work' },
    ],
    comments: [
      {
        id: 'c-8',
        authorId: 'ddeo-1',
        authorName: 'DDEO User',
        authorRole: 'DDEO',
        text: 'Beautiful artwork! Arts education is essential for holistic development.',
        timestamp: new Date(Date.now() - 864000000),
      },
      {
        id: 'c-9',
        authorId: 'teacher-4',
        authorName: 'Teacher 4',
        authorRole: 'TEACHER',
        text: 'Proud of our students! Their creativity is inspiring.',
        timestamp: new Date(Date.now() - 863000000),
      },
    ],
    reactions: [
      { id: 'r-20', type: 'love', userId: 'ddeo-1', userName: 'DDEO User' },
      { id: 'r-21', type: 'celebrate', userId: 'ceo-1', userName: 'CEO User' },
      { id: 'r-22', type: 'clap', userId: 'teacher-4', userName: 'Teacher 4' },
    ],
    createdAt: new Date(Date.now() - 950400000),
    updatedAt: new Date(Date.now() - 950400000),
  },
  {
    id: 'act-10',
    schoolId: 'SCH-003',
    schoolName: SCHOOL_NAMES['SCH-003'] || 'GES JAWA',
    createdBy: 'teacher-5',
    createdByName: 'Teacher 5',
    createdByRole: 'TEACHER',
    title: 'Science Lab Upgrade',
    description: 'Our science lab has been upgraded with new equipment including microscopes, lab apparatus, and safety gear. Students can now perform practical experiments more effectively.',
    photos: [
      { id: 'p-22', url: 'photo22.jpg', caption: 'New microscopes and equipment' },
      { id: 'p-23', url: 'photo23.jpg', caption: 'Students conducting experiments' },
    ],
    comments: [],
    reactions: [
      { id: 'r-23', type: 'celebrate', userId: 'deo-1', userName: 'DEO User' },
      { id: 'r-24', type: 'love', userId: 'aeo-1', userName: realAEOs[0].name },
    ],
    createdAt: new Date(Date.now() - 1036800000),
    updatedAt: new Date(Date.now() - 1036800000),
  },
  {
    id: 'act-11',
    schoolId: 'SCH-001',
    schoolName: SCHOOL_NAMES['SCH-001'] || 'GGPS Chakra',
    createdBy: 'teacher-2',
    createdByName: 'Teacher 2',
    createdByRole: 'TEACHER',
    title: 'Cleanliness Drive',
    description: 'Students and staff participated in a cleanliness campaign. The entire school premises, classrooms, and play areas were thoroughly cleaned. Students learned the importance of hygiene.',
    photos: [
      { id: 'p-24', url: 'photo24.jpg', caption: 'Students cleaning classroom' },
      { id: 'p-25', url: 'photo25.jpg', caption: 'Clean and organized school' },
    ],
    comments: [
      {
        id: 'c-10',
        authorId: 'head-1',
        authorName: 'Head Teacher',
        authorRole: 'HEAD_TEACHER',
        text: 'Great initiative! Clean environment helps in better learning.',
        timestamp: new Date(Date.now() - 1123200000),
      },
    ],
    reactions: [
      { id: 'r-25', type: 'clap', userId: 'head-1', userName: 'Head Teacher' },
      { id: 'r-26', type: 'like', userId: 'aeo-1', userName: realAEOs[0].name },
    ],
    createdAt: new Date(Date.now() - 1209600000),
    updatedAt: new Date(Date.now() - 1209600000),
  },
  {
    id: 'act-12',
    schoolId: 'SCH-002',
    schoolName: SCHOOL_NAMES['SCH-002'] || 'GGPS Carriage Factory',
    createdBy: 'head-2',
    createdByName: 'Head Teacher 2',
    createdByRole: 'HEAD_TEACHER',
    title: 'Community Service Day',
    description: 'Students visited nearby community and helped elderly people with daily tasks. This activity taught them the values of compassion and social responsibility.',
    photos: [
      { id: 'p-26', url: 'photo26.jpg', caption: 'Students helping community members' },
      { id: 'p-27', url: 'photo27.jpg', caption: 'Community appreciation' },
    ],
    comments: [
      {
        id: 'c-11',
        authorId: 'ceo-1',
        authorName: 'CEO User',
        authorRole: 'CEO',
        text: 'This is exemplary! Building socially responsible citizens.',
        timestamp: new Date(Date.now() - 1296000000),
      },
      {
        id: 'c-12',
        authorId: 'deo-1',
        authorName: 'DEO User',
        authorRole: 'DEO',
        text: 'Wonderful work! Such activities shape character.',
        timestamp: new Date(Date.now() - 1295000000),
      },
    ],
    reactions: [
      { id: 'r-27', type: 'love', userId: 'ceo-1', userName: 'CEO User' },
      { id: 'r-28', type: 'celebrate', userId: 'deo-1', userName: 'DEO User' },
      { id: 'r-29', type: 'clap', userId: 'ddeo-1', userName: 'DDEO User' },
      { id: 'r-30', type: 'love', userId: 'aeo-1', userName: realAEOs[0].name },
    ],
    createdAt: new Date(Date.now() - 1382400000),
    updatedAt: new Date(Date.now() - 1382400000),
  },
];

const STORAGE_KEY = 'taleemhub_activities';

function loadActivitiesFromStorage(): Activity[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
        comments: a.comments.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })),
      }));
    }
  } catch (e) {
    console.error('Failed to load activities from storage:', e);
  }
  return mockActivities;
}

function saveActivitiesToStorage(activities: Activity[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities to storage:', e);
  }
}

export function useMockActivities() {
  const [activities, setActivities] = useState<Activity[]>(() => loadActivitiesFromStorage());

  const getActivitiesForSchool = useCallback(
    (schoolId: string) => {
      return activities.filter((a) => a.schoolId === schoolId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    [activities]
  );

  const getActivity = useCallback(
    (activityId: string) => {
      return activities.find((a) => a.id === activityId);
    },
    [activities]
  );

  const createActivity = useCallback(
    (
      schoolId: string,
      schoolName: string,
      title: string,
      description: string,
      photos: { id: string; url: string; caption: string }[],
      userId: string,
      userName: string,
      userRole: string
    ): Activity => {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        schoolId,
        schoolName,
        createdBy: userId,
        createdByName: userName,
        createdByRole: userRole,
        title,
        description,
        photos,
        comments: [],
        reactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setActivities((prev) => {
        const updated = [newActivity, ...prev];
        saveActivitiesToStorage(updated);
        return updated;
      });
      return newActivity;
    },
    []
  );

  const addComment = useCallback(
    (activityId: string, text: string, userId: string, userName: string, userRole: string) => {
      setActivities((prev) => {
        const updated = prev.map((a) =>
          a.id === activityId
            ? {
                ...a,
                comments: [
                  ...a.comments,
                  {
                    id: `c-${Date.now()}`,
                    authorId: userId,
                    authorName: userName,
                    authorRole: userRole,
                    text,
                    timestamp: new Date(),
                  },
                ],
                updatedAt: new Date(),
              }
            : a
        );
        saveActivitiesToStorage(updated);
        return updated;
      });
    },
    []
  );

  const addReaction = useCallback(
    (activityId: string, type: 'like' | 'love' | 'clap' | 'celebrate', userId: string, userName: string) => {
      setActivities((prev) => {
        const updated = prev.map((a) => {
          if (a.id === activityId) {
            const existingReaction = a.reactions.find((r) => r.userId === userId);
            if (existingReaction) {
              return {
                ...a,
                reactions: a.reactions.map((r) => (r.userId === userId ? { ...r, type } : r)),
                updatedAt: new Date(),
              };
            } else {
              return {
                ...a,
                reactions: [...a.reactions, { id: `r-${Date.now()}`, type, userId, userName }],
                updatedAt: new Date(),
              };
            }
          }
          return a;
        });
        saveActivitiesToStorage(updated);
        return updated;
      });
    },
    []
  );

  const removeReaction = useCallback((activityId: string, userId: string) => {
    setActivities((prev) => {
      const updated = prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              reactions: a.reactions.filter((r) => r.userId !== userId),
              updatedAt: new Date(),
            }
          : a
      );
      saveActivitiesToStorage(updated);
      return updated;
    });
  }, []);

  return {
    activities,
    getActivitiesForSchool,
    getActivity,
    createActivity,
    addComment,
    addReaction,
    removeReaction,
  };
}
