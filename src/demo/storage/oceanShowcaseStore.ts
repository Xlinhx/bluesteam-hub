// Ocean Showcase Demo State & BroadcastChannel Sync

export type WindDirection = 'left' | 'right';
export type WindStrength = 'gentle' | 'moderate' | 'strong';

export interface StudentRecord {
  id: string;
  name: string;
  prediction: string;
  completed: boolean;
  audioRecorded: boolean;
  time: string;
}

export interface OceanLiveSessionState {
  classCode: string;
  className: string;
  teacherName: string;
  activeStep: number; // 1: Xem, 2: Khám phá, 3: Dự đoán, 4: Thử nghiệm, 5: Chia sẻ
  isSimulationRunning: boolean;
  windDirection: WindDirection;
  windStrength: WindStrength;
  showArrows: boolean;
  rightVotes: number;
  leftVotes: number;
  connectedCount: number;
  totalStudents: number;
  isSessionEnded: boolean;
}

const DEFAULT_SESSION_STATE: OceanLiveSessionState = {
  classCode: '482915',
  className: 'Lớp Sao Biển',
  teacherName: 'Cô Linh',
  activeStep: 4,
  isSimulationRunning: false,
  windDirection: 'right',
  windStrength: 'gentle',
  showArrows: true,
  rightVotes: 20,
  leftVotes: 4,
  connectedCount: 24,
  totalStudents: 24,
  isSessionEnded: false,
};

export const DEMO_STUDENTS: StudentRecord[] = [
  { id: '1', name: 'An', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:12' },
  { id: '2', name: 'Bình', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:15' },
  { id: '3', name: 'Chi', prediction: 'Sang trái', completed: true, audioRecorded: true, time: '09:18' },
  { id: '4', name: 'Duy', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:20' },
  { id: '5', name: 'Hà', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:21' },
  { id: '6', name: 'Huy', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:22' },
  { id: '7', name: 'Khánh', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:22' },
  { id: '8', name: 'Linh', prediction: 'Sang trái', completed: true, audioRecorded: true, time: '09:23' },
  { id: '9', name: 'Mai', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:24' },
  { id: '10', name: 'Minh', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:25' },
  { id: '11', name: 'Nam', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:25' },
  { id: '12', name: 'Ngọc', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:26' },
  { id: '13', name: 'Phong', prediction: 'Sang trái', completed: true, audioRecorded: true, time: '09:26' },
  { id: '14', name: 'Phúc', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:27' },
  { id: '15', name: 'Quân', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:27' },
  { id: '16', name: 'Sơn', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:28' },
  { id: '17', name: 'Tâm', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:28' },
  { id: '18', name: 'Thảo', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:29' },
  { id: '19', name: 'Trang', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:29' },
  { id: '20', name: 'Tuấn', prediction: 'Sang trái', completed: true, audioRecorded: true, time: '09:30' },
  { id: '21', name: 'Vinh', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:30' },
  { id: '22', name: 'Vy', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:31' },
  { id: '23', name: 'Yến', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:31' },
  { id: '24', name: 'Bảo', prediction: 'Sang phải', completed: true, audioRecorded: true, time: '09:32' },
];

class OceanShowcaseStore {
  private sessionState: OceanLiveSessionState;
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(state: OceanLiveSessionState) => void> = [];

  constructor() {
    this.sessionState = this.loadState();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('ocean_showcase_live_sync');
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_STATE') {
          this.sessionState = { ...this.sessionState, ...event.data.payload };
          this.notify();
        }
      };
    }
  }

  private loadState(): OceanLiveSessionState {
    try {
      const stored = localStorage.getItem('ocean_showcase_live_state');
      if (stored) return { ...DEFAULT_SESSION_STATE, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return { ...DEFAULT_SESSION_STATE };
  }

  private saveState() {
    try {
      localStorage.setItem('ocean_showcase_live_state', JSON.stringify(this.sessionState));
    } catch {
      // ignore
    }
  }

  private broadcast(payload: Partial<OceanLiveSessionState>) {
    this.sessionState = { ...this.sessionState, ...payload };
    this.saveState();
    this.notify();
    try {
      this.channel?.postMessage({ type: 'SYNC_STATE', payload });
    } catch {
      // ignore
    }
  }

  getState(): OceanLiveSessionState {
    return { ...this.sessionState };
  }

  subscribe(fn: (state: OceanLiveSessionState) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.sessionState }));
  }

  // Action methods
  setWindDirection(direction: WindDirection) {
    this.broadcast({ windDirection: direction });
  }

  setWindStrength(strength: WindStrength) {
    this.broadcast({ windStrength: strength });
  }

  toggleArrows(show: boolean) {
    this.broadcast({ showArrows: show });
  }

  setSimulationRunning(running: boolean) {
    this.broadcast({ isSimulationRunning: running });
  }

  setActiveStep(step: number) {
    this.broadcast({ activeStep: step });
  }

  endSession() {
    this.broadcast({ isSessionEnded: true });
  }

  resetAll() {
    this.sessionState = { ...DEFAULT_SESSION_STATE };
    this.saveState();
    this.broadcast(DEFAULT_SESSION_STATE);
  }
}

export const oceanShowcaseStore = new OceanShowcaseStore();
