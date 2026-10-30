import { apiRequest } from './client';

export interface TeacherProfile {
  id: string;
  email: string;
  displayName: string;
  avatarKey?: string | null;
  avatarMediaId?: string | null;
  avatarUrl?: string | null;
}

const TEACHER_CACHE_KEY = 'bluesteam_teacher_session';

export function getCachedTeacherProfile(): TeacherProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(TEACHER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.email === 'string') {
      return {
        id: parsed.id || 'teacher-session',
        email: parsed.email,
        displayName: parsed.displayName || parsed.name || 'Giáo viên',
        avatarKey: parsed.avatarKey, avatarMediaId: parsed.avatarMediaId, avatarUrl: parsed.avatarUrl,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

export function setCachedTeacherProfile(profile: TeacherProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!profile) {
      window.sessionStorage.removeItem(TEACHER_CACHE_KEY);
    } else {
      window.sessionStorage.setItem(
        TEACHER_CACHE_KEY,
        JSON.stringify({
          id: profile.id,
          email: profile.email,
          name: profile.displayName,
          displayName: profile.displayName,
          avatarKey: profile.avatarKey, avatarMediaId: profile.avatarMediaId, avatarUrl: profile.avatarUrl,
        }),
      );
    }
  } catch {
    // Ignore storage write errors
  }
  if (typeof window.dispatchEvent === 'function') window.dispatchEvent(new Event('bluesteam:teacher-updated'));
}

export async function updateTeacherProfileApi(input: { displayName: string; avatarKey: string | null; avatarMediaId: string | null }): Promise<TeacherProfile> {
  const result = await apiRequest<{ teacher: TeacherProfile }>('/api/v1/auth/me', {
    method: 'PATCH', body: JSON.stringify(input),
  });
  setCachedTeacherProfile(result.teacher);
  return result.teacher;
}

export async function fetchCurrentTeacherApi(): Promise<TeacherProfile | null> {
  try {
    const res = await apiRequest<{ teacher: TeacherProfile }>('/api/v1/auth/me');
    setCachedTeacherProfile(res.teacher);
    return res.teacher;
  } catch {
    setCachedTeacherProfile(null);
    return null;
  }
}
