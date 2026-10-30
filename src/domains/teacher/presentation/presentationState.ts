export type LessonStepId = 1 | 2 | 3 | 4 | 5;


export type CreatureId = 'turtle' | 'crab' | 'clownfish';
export type HabitatSlotId = 'sand' | 'seagrass' | 'coral';

export interface QuizOption {
  id: string;
  label: string;
  votes: number;
  isCorrect?: boolean;
}

export interface QuizState {
  questionId: string;
  questionText: string;
  options: QuizOption[];
  totalVotes: number;
  isRevealed: boolean;
}

export interface PresentationState {
  topicTitle: string;

  stepDescription: string;

  // Habitat Matching Step (Step 3)
  selectedCreature: CreatureId;
  placedSlots: Record<HabitatSlotId, CreatureId | null>;

  // Interactive Quiz Step (Step 4)
  quiz: QuizState;



}

export const INITIAL_PRESENTATION_STATE: PresentationState = {
  topicTitle: 'Rùa Biển & Nơi Sinh Sống Diệu Kỳ',

  stepDescription: 'Cả lớp hãy cùng suy nghĩ: Bạn Rùa biển thích hợp nhất ở môi trường nào dưới đây?',

  selectedCreature: 'turtle',
  placedSlots: {
    sand: null,
    seagrass: 'turtle', // Reference mockup shows turtle over seagrass bed
    coral: null,
  },

  quiz: {
    questionId: 'q-turtle-respiration',
    questionText: 'Rùa biển hô hấp bằng cơ quan nào dưới đây?',
    options: [
      { id: 'opt-a', label: 'Mang cá dưới nước', votes: 0, isCorrect: false },
      { id: 'opt-b', label: 'Phổi (phải ngoi lên thở)', votes: 0, isCorrect: true },
      { id: 'opt-c', label: 'Hô hấp qua da', votes: 0, isCorrect: false },
    ],
    totalVotes: 0,
    isRevealed: false,
  },


};
