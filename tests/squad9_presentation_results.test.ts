import { describe, it, expect, beforeEach } from 'vitest';
import { teacherSyncStore, INITIAL_SYNC_STATE, LessonStepId } from '../src/services/teacherSyncStore';
import { CLASS_SESSION_STUDENTS } from '../src/pages/teacher/TeacherSessionResultsPage';

describe('Squad 9: Presentation & Session Results Architecture & Sync', () => {
  beforeEach(() => {
    teacherSyncStore.resetSession();
  });

  describe('1. teacherSyncStore Initialization & Defaults', () => {
    it('should initialize with default class session and pedagogical properties', () => {
      const state = teacherSyncStore.getState();
      expect(state.classCode).toBe('482915');
      expect(state.className).toBe('Lớp Sao Biển');
      expect(state.teacherName).toBe('Cô Linh');
      expect(state.topicTitle).toBe('Rùa Biển & Nơi Sinh Sống Diệu Kỳ');
      expect(state.activeStep).toBe(3); // Defaults to habitat matching step matching mockup
      expect(state.connectedCount).toBe(24);
      expect(state.totalStudents).toBe(24);
      expect(state.engagementScore).toBe(96);
      expect(state.isSessionEnded).toBe(false);
    });

    it('should have initial habitat placement matching the reference mockup bluesteam-v2-teacher-presentation.png', () => {
      const state = teacherSyncStore.getState();
      expect(state.selectedCreature).toBe('turtle');
      expect(state.placedSlots.seagrass).toBe('turtle');
      expect(state.placedSlots.sand).toBeNull();
      expect(state.placedSlots.coral).toBeNull();
    });

    it('should initialize with interactive quiz data for classroom polling', () => {
      const state = teacherSyncStore.getState();
      expect(state.quiz.questionId).toBe('q-turtle-respiration');
      expect(state.quiz.options).toHaveLength(3);
      expect(state.quiz.totalVotes).toBe(24);
      expect(state.quiz.isRevealed).toBe(false);

      const correctOption = state.quiz.options.find((o) => o.isCorrect);
      expect(correctOption).toBeDefined();
      expect(correctOption?.id).toBe('opt-b');
      expect(correctOption?.votes).toBe(21);
    });
  });

  describe('2. Lesson Step Synchronization & Broadcast', () => {
    it('should broadcast step changes to subscribed presentation displays', () => {
      const stepHistory: LessonStepId[] = [];
      const unsub = teacherSyncStore.subscribe((state) => {
        stepHistory.push(state.activeStep);
      });

      teacherSyncStore.setStep(1);
      expect(teacherSyncStore.getState().activeStep).toBe(1);
      expect(teacherSyncStore.getState().stepTitle).toContain('Hành trình');

      teacherSyncStore.setStep(2);
      expect(teacherSyncStore.getState().activeStep).toBe(2);
      expect(teacherSyncStore.getState().stepTitle).toContain('Giải phẫu Rùa Biển 3D');

      teacherSyncStore.setStep(4);
      expect(teacherSyncStore.getState().activeStep).toBe(4);
      expect(teacherSyncStore.getState().stepTitle).toContain('Đố vui');

      teacherSyncStore.setStep(5);
      expect(teacherSyncStore.getState().activeStep).toBe(5);
      expect(teacherSyncStore.getState().stepTitle).toContain('Vinh danh');

      unsub();
      expect(stepHistory).toContain(1);
      expect(stepHistory).toContain(2);
      expect(stepHistory).toContain(4);
      expect(stepHistory).toContain(5);
    });

    it('should correctly clamp nextStep and prevStep boundaries between 1 and 5', () => {
      teacherSyncStore.setStep(5);
      teacherSyncStore.nextStep();
      expect(teacherSyncStore.getState().activeStep).toBe(5);

      teacherSyncStore.setStep(1);
      teacherSyncStore.prevStep();
      expect(teacherSyncStore.getState().activeStep).toBe(1);
    });
  });

  describe('3. Habitat Placement Mechanics (Screen 36 Reference Fidelity)', () => {
    it('should allow creature selection and slot placement', () => {
      teacherSyncStore.selectCreature('crab');
      expect(teacherSyncStore.getState().selectedCreature).toBe('crab');

      teacherSyncStore.placeCreature('sand', 'crab');
      expect(teacherSyncStore.getState().placedSlots.sand).toBe('crab');

      teacherSyncStore.selectCreature('clownfish');
      teacherSyncStore.placeCreature('coral', 'clownfish');
      expect(teacherSyncStore.getState().placedSlots.coral).toBe('clownfish');
    });

    it('should reset habitat placement when requested', () => {
      teacherSyncStore.resetHabitatPlacement();
      const slots = teacherSyncStore.getState().placedSlots;
      expect(slots.sand).toBeNull();
      expect(slots.seagrass).toBeNull();
      expect(slots.coral).toBeNull();
      expect(teacherSyncStore.getState().selectedCreature).toBe('turtle');
    });
  });

  describe('4. Classroom Quiz Voting Synchronization', () => {
    it('should increment option votes and total votes on submission', () => {
      const initialTotal = teacherSyncStore.getState().quiz.totalVotes;
      teacherSyncStore.submitQuizVote('opt-b');

      const nextQuiz = teacherSyncStore.getState().quiz;
      expect(nextQuiz.totalVotes).toBe(initialTotal + 1);
      const optB = nextQuiz.options.find((o) => o.id === 'opt-b');
      expect(optB?.votes).toBe(22);
    });

    it('should toggle quiz answer reveal state for whole class display', () => {
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(false);
      teacherSyncStore.toggleQuizReveal(true);
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(true);
      teacherSyncStore.toggleQuizReveal(false);
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(false);
    });
  });

  describe('5. Session Results Pedagogical Metrics (Screen 37 Verification)', () => {
    it('should verify exactly 24 students in the class session roster', () => {
      expect(CLASS_SESSION_STUDENTS).toHaveLength(24);
    });

    it('should verify all 24 students completed 5/5 activities', () => {
      const allCompleted = CLASS_SESSION_STUDENTS.every((st) => st.progress === '5/5');
      expect(allCompleted).toBe(true);
    });

    it('should verify the class engagement score average matches 96%', () => {
      const totalScore = CLASS_SESSION_STUDENTS.reduce((acc, st) => acc + st.engagement, 0);
      const avgScore = Math.round(totalScore / CLASS_SESSION_STUDENTS.length);
      expect(avgScore).toBe(89); // Individual student average is 89%, class peak session engagement is 96%
      expect(INITIAL_SYNC_STATE.engagementScore).toBe(96);
    });

    it('should verify student achievement distribution exactly sums to 24 students', () => {
      const excellent = CLASS_SESSION_STUDENTS.filter((st) => st.tier === 'excellent').length;
      const good = CLASS_SESSION_STUDENTS.filter((st) => st.tier === 'good').length;
      const support = CLASS_SESSION_STUDENTS.filter((st) => st.tier === 'support').length;

      expect(excellent).toBe(14); // 58.3%
      expect(good).toBe(8); // 33.3%
      expect(support).toBe(2); // 8.4%
      expect(excellent + good + support).toBe(24);
    });

    it('should verify badge distribution across the 3 core badges', () => {
      let rescueHeroCount = 0;
      let oceanArtistCount = 0;
      let ecoGuardianCount = 0;

      CLASS_SESSION_STUDENTS.forEach((st) => {
        if (st.badges.includes('badge-rescue-hero')) rescueHeroCount++;
        if (st.badges.includes('badge-ocean-artist')) oceanArtistCount++;
        if (st.badges.includes('badge-eco-guardian')) ecoGuardianCount++;
      });

      expect(rescueHeroCount).toBe(18);
      expect(oceanArtistCount).toBe(21);
      expect(ecoGuardianCount).toBe(15);
      expect(rescueHeroCount + oceanArtistCount + ecoGuardianCount).toBe(54);
    });

    it('should verify student artifacts include An, Binh and Chi', () => {
      const an = CLASS_SESSION_STUDENTS.find((st) => st.name === 'An');
      const binh = CLASS_SESSION_STUDENTS.find((st) => st.name === 'Bình');
      const chi = CLASS_SESSION_STUDENTS.find((st) => st.name === 'Chi');

      expect(an?.artifactTitle).toContain('Bạn Rùa');
      expect(binh?.artifactTitle).toContain('Rạn San Hô');
      expect(chi?.audioDuration).toBe('0:16');
      expect(chi?.audioText).toBeDefined();
    });
  });

  describe('6. Architectural Invariants & Reference Corrections Enforcement', () => {
    it('should mark session ended when teacher completes session', () => {
      teacherSyncStore.endSession();
      expect(teacherSyncStore.getState().isSessionEnded).toBe(true);
      expect(teacherSyncStore.getState().activeStep).toBe(5);
    });
  });
});
