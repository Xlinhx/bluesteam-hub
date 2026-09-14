/**
 * Teacher Sync Store (BroadcastChannel Synchronization Service)
 * BlueSTEAM v2 — Milestone 5 (Squad 8 & Squad 9)
 * 
 * Provides bi-directional and broadcast state synchronization between:
 * - TeacherLiveConsolePage (/teacher/live)
 * - PresentationPage (/presentation)
 * - Student Live views
 * 
 * Architecture:
 * - Uses native BroadcastChannel with fallback to localStorage event bus
 * - Strictly typed pedagogical lesson steps:
 *   Step 1: Story / Khởi động (Story & Warm-up)
 *   Step 2: 3D Turtle / Quan sát (Specimen Deep-Dive)
 *   Step 3: Habitat / Ghép nơi sống (Classroom Habitat Matching)
 *   Step 4: Quiz / Thử thách lớp học (Interactive Live Voting)
 *   Step 5: Wrap-up / Vinh danh & Huy hiệu (Session Wrap-up & Badges)
 */

export type LessonStepId = 1 | 2 | 3 | 4 | 5;

export const CANONICAL_LESSON_STEPS: readonly LessonStepId[] = [1, 2, 3, 4, 5] as const;

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

export interface TeacherSyncState {
  // Session Identity
  classCode: string;
  className: string;
  teacherName: string;
  topicTitle: string;
  topicSubtitle: string;

  // Active Lesson Step
  activeStep: LessonStepId;
  stepTitle: string;
  stepDescription: string;

  // Habitat Matching Step (Step 3)
  selectedCreature: CreatureId;
  placedSlots: Record<HabitatSlotId, CreatureId | null>;
  habitatCompletedCount: number;

  // Interactive Quiz Step (Step 4)
  quiz: QuizState;

  // Classroom Live Metrics
  connectedCount: number;
  totalStudents: number;
  engagementScore: number;
  isAudioPlaying: boolean;
  activeAudioText: string | null;

  // Presentation State
  isSessionEnded: boolean;
  presentationMode: 'normal' | 'cinematic' | 'focus';

  // Attention Bell Alert
  attentionAlert: boolean;
  attentionAlertTimestamp?: number;
}

export const INITIAL_SYNC_STATE: TeacherSyncState = {
  classCode: '482915',
  className: 'Lớp Sao Biển',
  teacherName: 'Cô Linh',
  topicTitle: 'Rùa Biển & Nơi Sinh Sống Diệu Kỳ',
  topicSubtitle: 'Hành trình khám phá hệ sinh thái biển ven bờ BlueSTEAM',

  activeStep: 3, // Defaults to Step 3 (Habitat matching) matching reference mockup
  stepTitle: 'Tìm nơi sống cho bạn nhỏ',
  stepDescription: 'Cả lớp hãy cùng suy nghĩ: Bạn Rùa biển thích hợp nhất ở môi trường nào dưới đây?',

  selectedCreature: 'turtle',
  placedSlots: {
    sand: null,
    seagrass: 'turtle', // Reference mockup shows turtle over seagrass bed
    coral: null,
  },
  habitatCompletedCount: 22,

  quiz: {
    questionId: 'q-turtle-respiration',
    questionText: 'Rùa biển hô hấp bằng cơ quan nào dưới đây?',
    options: [
      { id: 'opt-a', label: 'Mang cá dưới nước', votes: 2, isCorrect: false },
      { id: 'opt-b', label: 'Phổi (phải ngoi lên thở)', votes: 21, isCorrect: true },
      { id: 'opt-c', label: 'Hô hấp qua da', votes: 1, isCorrect: false },
    ],
    totalVotes: 24,
    isRevealed: false,
  },

  connectedCount: 24,
  totalStudents: 24,
  engagementScore: 96,
  isAudioPlaying: false,
  activeAudioText: null,

  isSessionEnded: false,
  presentationMode: 'normal',
  attentionAlert: false,
  attentionAlertTimestamp: undefined,
};

export const STEP_METADATA: Record<LessonStepId, { title: string; desc: string }> = {
  1: {
    title: 'Câu chuyện: Hành trình của Rùa Xanh',
    desc: 'Lắng nghe câu chuyện mở đầu về bạn Rùa Xanh vượt trùng dương tìm về bãi cát quê hương.',
  },
  2: {
    title: 'Quan sát: Giải phẫu Rùa Biển 3D',
    desc: 'Khám phá cấu tạo mai dẹp rẽ nước, vây bơi hình mái chèo và khả năng nhịn thở phi thường.',
  },
  3: {
    title: 'Tìm nơi sống cho bạn nhỏ',
    desc: 'Cả lớp hãy cùng suy nghĩ: Bạn Rùa biển thích hợp nhất ở môi trường nào dưới đây?',
  },
  4: {
    title: 'Thử thách: Đố vui tương tác cả lớp',
    desc: 'Bé hãy bình chọn trên máy của mình để giải cứu bạn sinh vật biển đang cần trợ giúp!',
  },
  5: {
    title: 'Vinh danh & Trao Huy hiệu STEAM',
    desc: 'Chúc mừng cả lớp đã xuất sắc hoàn thành 5 mục tiêu học tập và bảo vệ biển cả!',
  },
};

export class TeacherSyncStore {
  private state: TeacherSyncState;
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(state: TeacherSyncState) => void> = [];
  private readonly CHANNEL_NAME = 'bluesteam_teacher_sync_v2';
  private readonly STORAGE_KEY = 'bluesteam_teacher_sync_state';
  private bellTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.state = this.loadInitialState();
    this.initBroadcastChannel();
  }

  private loadInitialState(): TeacherSyncState {
    if (typeof window === 'undefined') return { ...INITIAL_SYNC_STATE };
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...INITIAL_SYNC_STATE, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback to default
    }
    return { ...INITIAL_SYNC_STATE };
  }

  private persistState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore quota errors
    }
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_STATE' && event.data?.payload) {
            this.state = { ...this.state, ...event.data.payload };
            this.notify();
          }
        };
      } catch {
        this.channel = null;
      }
    }

    // Fallback for storage event (cross-window on older browsers)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.STORAGE_KEY && e.newValue) {
          try {
            this.state = { ...this.state, ...JSON.parse(e.newValue) };
            this.notify();
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private broadcast(delta: Partial<TeacherSyncState>) {
    this.state = { ...this.state, ...delta };
    this.persistState();
    this.notify();

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'SYNC_STATE', payload: delta });
      } catch {
        // Ignore channel post errors
      }
    }
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.error('[TeacherSyncStore] Listener notification error:', err);
      }
    });
  }

  // --- Public API ---

  getState(): TeacherSyncState {
    return { ...this.state };
  }

  subscribe(listener: (state: TeacherSyncState) => void): () => void {
    this.listeners.push(listener);
    // Immediate callback with current state
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  setStep(step: LessonStepId) {
    const meta = STEP_METADATA[step];
    this.broadcast({
      activeStep: step,
      stepTitle: meta.title,
      stepDescription: meta.desc,
    });
  }

  nextStep() {
    if (this.state.activeStep < 5) {
      this.setStep((this.state.activeStep + 1) as LessonStepId);
    }
  }

  prevStep() {
    if (this.state.activeStep > 1) {
      this.setStep((this.state.activeStep - 1) as LessonStepId);
    }
  }

  selectCreature(creature: CreatureId) {
    this.broadcast({ selectedCreature: creature });
  }

  placeCreature(slot: HabitatSlotId, creature: CreatureId | null) {
    const nextSlots = { ...this.state.placedSlots, [slot]: creature };
    this.broadcast({ placedSlots: nextSlots });
  }

  resetHabitatPlacement() {
    this.broadcast({
      placedSlots: { sand: null, seagrass: null, coral: null },
      selectedCreature: 'turtle',
    });
  }

  submitQuizVote(optionId: string) {
    const nextOptions = this.state.quiz.options.map((opt) =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    const nextTotal = this.state.quiz.totalVotes + 1;
    this.broadcast({
      quiz: {
        ...this.state.quiz,
        options: nextOptions,
        totalVotes: nextTotal,
      },
    });
  }

  toggleQuizReveal(revealed?: boolean) {
    const isRevealed = revealed !== undefined ? revealed : !this.state.quiz.isRevealed;
    this.broadcast({
      quiz: {
        ...this.state.quiz,
        isRevealed,
      },
    });
  }

  setAudioPlaying(isPlaying: boolean, text?: string | null) {
    this.broadcast({
      isAudioPlaying: isPlaying,
      activeAudioText: text || null,
    });
  }

  setPresentationMode(mode: 'normal' | 'cinematic' | 'focus') {
    this.broadcast({ presentationMode: mode });
  }

  /**
   * Trigger classroom attention bell pulse to regain student focus.
   * Broadcasts attentionAlert: true, sets audio playing state, and automatically resets after durationMs.
   */
  triggerAttentionBell(durationMs = 3500) {
    if (this.bellTimer) {
      clearTimeout(this.bellTimer);
      this.bellTimer = null;
    }

    const timestamp = Date.now();
    this.broadcast({
      attentionAlert: true,
      attentionAlertTimestamp: timestamp,
      isAudioPlaying: true,
      activeAudioText: '🔔 Chuông chú ý: Cả lớp hướng lên màn hình cùng cô!',
    });

    if (typeof window !== 'undefined') {
      this.bellTimer = setTimeout(() => {
        if (this.state.attentionAlert) {
          this.broadcast({
            attentionAlert: false,
            attentionAlertTimestamp: undefined,
            isAudioPlaying: false,
            activeAudioText: null,
          });
        }
        this.bellTimer = null;
      }, durationMs);
    }
  }

  /**
   * Manually set attention alert state (e.g. for dismissal or sticky focus mode).
   */
  setAttentionAlert(active: boolean) {
    if (this.bellTimer) {
      clearTimeout(this.bellTimer);
      this.bellTimer = null;
    }
    this.broadcast({
      attentionAlert: active,
      attentionAlertTimestamp: active ? Date.now() : undefined,
      ...(active
        ? {
            isAudioPlaying: true,
            activeAudioText: '🔔 Chuông chú ý: Cả lớp hướng lên màn hình cùng cô!',
          }
        : {
            isAudioPlaying: false,
            activeAudioText: null,
          }),
    });
  }

  endSession() {
    this.broadcast({
      isSessionEnded: true,
      activeStep: 5,
    });
  }

  resetSession() {
    if (this.bellTimer) {
      clearTimeout(this.bellTimer);
      this.bellTimer = null;
    }
    this.state = { ...INITIAL_SYNC_STATE };
    this.persistState();
    this.notify();
    if (this.channel) {
      this.channel.postMessage({ type: 'SYNC_STATE', payload: INITIAL_SYNC_STATE });
    }
  }
}

// Global Singleton Instance
export const teacherSyncStore = new TeacherSyncStore();
