import { IAStrategy, ThemeStrategy, VariantId } from '../../domain/variant/types';
import { StudentProgress } from '../../domain/progress/types';
import { LessonPlan, SEED_LESSONS } from '../../content/seed/lessons';
import { Session } from '../../domain/session/types';
import { SEED_STUDENTS } from '../../content/seed/students';

const SCHEMA_VERSION = 2;

export interface StoredVariantState {
  schemaVersion: number;
  variantId: VariantId;
  ia: IAStrategy;
  theme: ThemeStrategy;
}

export interface StoredUserProfile {
  schemaVersion: number;
  role: 'teacher' | 'student' | 'guest';
  id: string;
  name: string;
  avatarKey?: string;
  gender?: 'boy' | 'girl';
  age?: string;
}

export interface StoredPreferences {
  schemaVersion: number;
  audioMuted: boolean;
  volume: number;
  reducedMotion: boolean;
  contrastHigh: boolean;
  locale: 'vi' | 'en';
}

export interface BlueSteamProgressV2 {
  schemaVersion: number;
  completedStations: number[];
  currentStation: number;
  unlockedCreatures: string[];
  completedActivities: string[];
  badges: string[];
}

const KEYS = {
  VARIANT: 'ocean-demo:v1:variant',
  PROFILE: 'ocean-demo:v2:profile',
  PROGRESS: 'ocean-demo:v2:progress',
  PROGRESS_V1: 'ocean-demo:v1:progress',
  LESSONS: 'ocean-demo:v1:lessons',
  SESSIONS: 'ocean-demo:v1:sessions',
  PREFERENCES: 'ocean-demo:v2:preferences',
  STATIONS: 'ocean-demo:v2:stations',
} as const;

const inMemoryStore: Record<string, string> = {};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    let raw: string | null = null;
    if (typeof localStorage !== 'undefined') {
      raw = localStorage.getItem(key);
    } else {
      raw = inMemoryStore[key] || null;
    }
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.schemaVersion === SCHEMA_VERSION) {
      return parsed as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, serialized);
    } else {
      inMemoryStore[key] = serialized;
    }
  } catch {
    try {
      inMemoryStore[key] = JSON.stringify(data);
    } catch {
      // ignore
    }
  }
}

// Initial default state factories
export function getDefaultVariantState(): StoredVariantState {
  return {
    schemaVersion: SCHEMA_VERSION,
    variantId: 'v1',
    ia: 'journey',
    theme: 'editorial',
  };
}

export function getDefaultProfile(): StoredUserProfile {
  return {
    schemaVersion: SCHEMA_VERSION,
    role: 'teacher',
    id: 'teacher-demo',
    name: 'Dr. Coralie Vance (Science Lead)',
  };
}

export function getDefaultProgress(): StudentProgress {
  return {
    studentId: SEED_STUDENTS[0].id,
    studentName: SEED_STUDENTS[0].name,
    avatarIconKey: SEED_STUDENTS[0].avatarKey,
    units: {
      'unit-ocean-depth': {
        unitId: 'unit-ocean-depth',
        completedExperienceIds: ['exp-video-descent'],
        maxDepthReachedMeters: 1200,
        unlockedSpecimenIds: ['asset-specimen-lanternfish'],
        lastExploredAt: Date.now() - 1000 * 60 * 30,
      },
    },
    discoveries: [
      {
        id: 'asset-specimen-lanternfish',
        name: 'Myctophidae Lanternfish',
        category: 'twilight',
        depthMeters: 650,
        iconKey: 'lanternfish',
        discoveredAt: Date.now() - 1000 * 60 * 30,
      },
    ],
    totalSimulationsRun: 3,
    totalObservationsMade: 8,
  };
}

export function getDefaultPreferences(): StoredPreferences {
  return {
    schemaVersion: SCHEMA_VERSION,
    audioMuted: false,
    volume: 0.8,
    reducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    contrastHigh: false,
    locale: 'vi',
  };
}

// Public API
export const demoStore = {
  getVariant(): StoredVariantState {
    return safeGet(KEYS.VARIANT, getDefaultVariantState());
  },
  setVariant(state: Omit<StoredVariantState, 'schemaVersion'>): void {
    safeSet(KEYS.VARIANT, { schemaVersion: SCHEMA_VERSION, ...state });
  },

  getProfile(): StoredUserProfile {
    const prof = safeGet(KEYS.PROFILE, getDefaultProfile());
    if (prof.role === 'student') {
      if (!prof.avatarKey || (!prof.avatarKey.startsWith('/') && !prof.avatarKey.startsWith('http') && !prof.avatarKey.startsWith('data:'))) {
        prof.avatarKey = prof.gender === 'girl' ? '/assets/avatar_mai.png' : '/assets/avatar_an.png';
      }
    }
    return prof;
  },
  setProfile(profile: Omit<StoredUserProfile, 'schemaVersion'>): void {
    safeSet(KEYS.PROFILE, { schemaVersion: SCHEMA_VERSION, ...profile });
  },

  getProgress(): StudentProgress {
    return safeGet(KEYS.PROGRESS, getDefaultProgress());
  },
  setProgress(progress: StudentProgress): void {
    safeSet(KEYS.PROGRESS, { schemaVersion: SCHEMA_VERSION, ...progress });
  },

  getLessons(): LessonPlan[] {
    return safeGet(KEYS.LESSONS, SEED_LESSONS);
  },
  setLessons(lessons: LessonPlan[]): void {
    safeSet(KEYS.LESSONS, lessons);
  },

  getActiveSession(): Session | null {
    return safeGet<Session | null>(KEYS.SESSIONS, null);
  },
  setActiveSession(session: Session | null): void {
    safeSet(KEYS.SESSIONS, session);
  },

  getPreferences(): StoredPreferences {
    return safeGet(KEYS.PREFERENCES, getDefaultPreferences());
  },
  setPreferences(prefs: Omit<StoredPreferences, 'schemaVersion'>): void {
    safeSet(KEYS.PREFERENCES, { schemaVersion: SCHEMA_VERSION, ...prefs });
  },

  // BlueSTEAM v2 Journey & Activities
  getBlueSteamProgress(): BlueSteamProgressV2 {
    const defaultProgress: BlueSteamProgressV2 = {
      schemaVersion: SCHEMA_VERSION,
      completedStations: [1], // Station 1 is explored by default as intro
      currentStation: 2, // Station 2 (Coral Reef) is active
      unlockedCreatures: ['asset-specimen-turtle'],
      completedActivities: [],
      badges: ['badge-ocean-explorer'],
    };

    return safeGet<BlueSteamProgressV2>(KEYS.STATIONS, defaultProgress);
  },

  setBlueSteamProgress(progress: BlueSteamProgressV2): void {
    safeSet(KEYS.STATIONS, { ...progress, schemaVersion: SCHEMA_VERSION });
  },

  completeStation(stationNumber: number): void {
    const current = this.getBlueSteamProgress();
    if (!current.completedStations.includes(stationNumber)) {
      current.completedStations.push(stationNumber);
    }
    if (current.currentStation <= stationNumber && stationNumber < 5) {
      current.currentStation = stationNumber + 1;
    }
    this.setBlueSteamProgress(current);
  },

  completeActivity(activityId: string): void {
    const current = this.getBlueSteamProgress();
    if (!current.completedActivities.includes(activityId)) {
      current.completedActivities.push(activityId);
      this.setBlueSteamProgress(current);
    }
  },

  unlockCreature(creatureId: string): void {
    const current = this.getBlueSteamProgress();
    if (!current.unlockedCreatures.includes(creatureId)) {
      current.unlockedCreatures.push(creatureId);
      this.setBlueSteamProgress(current);
    }
  },

  unlockBadge(badgeId: string): void {
    const current = this.getBlueSteamProgress();
    if (!current.badges.includes(badgeId)) {
      current.badges.push(badgeId);
      this.setBlueSteamProgress(current);
    }
  },

  resetDemo(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(KEYS.PROGRESS);
        localStorage.removeItem(KEYS.LESSONS);
        localStorage.removeItem(KEYS.SESSIONS);
        localStorage.removeItem(KEYS.PREFERENCES);
        localStorage.removeItem(KEYS.STATIONS);
      }
      delete inMemoryStore[KEYS.PROGRESS];
      delete inMemoryStore[KEYS.LESSONS];
      delete inMemoryStore[KEYS.SESSIONS];
      delete inMemoryStore[KEYS.PREFERENCES];
      delete inMemoryStore[KEYS.STATIONS];

      // Re-seed defaults
      safeSet(KEYS.PROGRESS, getDefaultProgress());
      safeSet(KEYS.LESSONS, SEED_LESSONS);
      safeSet(KEYS.SESSIONS, null);
      safeSet(KEYS.PREFERENCES, getDefaultPreferences());

      // Broadcast reset event so other open tabs update
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('ocean-demo:reset'));
      }
    } catch (err) {
      console.error('[demoStore] Error during resetDemo:', err);
    }
  },
};
