export interface MockClass {
  id: string;
  name: string;
  gradeBand: string;
  roomNumber: string;
  enrolledStudentIds: string[];
  activeLessonId?: string;
  scheduleTime: string;
  totalStudents: number;
}

export const SEED_CLASSES: MockClass[] = [
  {
    id: 'class-kindergarten-blue',
    name: 'Early Marine Explorers (Section A)',
    gradeBand: 'Kindergarten',
    roomNumber: 'Studio 104',
    enrolledStudentIds: ['student-elena', 'student-marcus', 'student-kai', 'student-zara', 'student-maya'],
    activeLessonId: 'lesson-depth-expedition',
    scheduleTime: '09:30 AM - 10:15 AM',
    totalStudents: 5,
  },
  {
    id: 'class-grade1-discovery',
    name: 'Geological Discovery Group (Section B)',
    gradeBand: 'Grade 1',
    roomNumber: 'Lab 202',
    enrolledStudentIds: ['student-ananya', 'student-lucas', 'student-noah'],
    activeLessonId: 'lesson-sediment-dynamics',
    scheduleTime: '01:15 PM - 02:00 PM',
    totalStudents: 3,
  },
];
