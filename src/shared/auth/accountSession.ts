import { apiRequest, ApiClientError } from '../api/client';
import { setCachedTeacherProfile, type TeacherProfile } from '../api/auth';
import { demoStore } from '../realtime/demoStore';

export type AccountRole = 'teacher' | 'student';
export type Account = TeacherProfile & { role: AccountRole };

export function applyAccountIdentity(account: Account) {
  const previous = demoStore.getProfile();
  demoStore.setProfile({
    role: account.role, id: account.id, name: account.displayName,
    avatarKey: account.avatarKey || (previous.id === account.id ? previous.avatarKey : undefined) || 'turtle',
  });
  setCachedTeacherProfile(account.role === 'teacher' ? account : null);
  window.sessionStorage.removeItem('bluesteam_teacher_authenticated');
}

export async function authenticateAccount(mode: 'login' | 'register', input: {
  role: AccountRole; email: string; password: string; displayName?: string;
}, signal?: AbortSignal) {
  const result = await apiRequest<{ account: Account }>(`/api/v1/auth/${mode}`, {
    method: 'POST', body: JSON.stringify(input), signal,
  });
  signal?.throwIfAborted();
  applyAccountIdentity(result.account);
  return result.account;
}

export async function fetchAccountSession(): Promise<Account | null> {
  try {
    const result = await apiRequest<{ account: Account }>('/api/v1/auth/session');
    return result.account;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) return null;
    throw error;
  }
}

export async function logoutAccount() {
  await apiRequest('/api/v1/auth/logout', { method: 'POST' });
  setCachedTeacherProfile(null);
  window.sessionStorage.removeItem('bluesteam_teacher_authenticated');
  demoStore.setProfile({ role: 'guest', id: 'guest', name: '' });
}
