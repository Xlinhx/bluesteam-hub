import { apiRequest } from './client';
import type { ActivityDto, Model3DDto } from './catalog';
export interface InteractiveGroup {
  id: string; title: string; ownerId: string | null; isSeed: boolean; visibility: 'draft' | 'published' | 'hidden'; coverMediaId: string | null; coverUrl: string | null; memberCount: number;
  previews: Array<{ id: string; title: string; kind: string; templateKey?: string; config?: Record<string, any>; coverUrl: string | null }>;
}
export function fetchInteractiveGroups(kind: string, teacher = false, cursor?: string, signal?: AbortSignal) {
  return apiRequest<{ items: InteractiveGroup[]; nextCursor: string | null }>(`/api/v1/${teacher ? 'teacher/' : ''}interactive-groups?${new URLSearchParams({ kind, ...(cursor ? { cursor } : {}) })}`, { signal });
}
export async function fetchTeacherInteractivePage(params: { kind: string; q?: string; topicIds?: string[]; groupId?: string; visibility?: string; source?: string; cursor?: string }, signal?: AbortSignal) {
  const query = new URLSearchParams({ limit: '12' });
  Object.entries(params).forEach(([key,value]) => { if (value && value !== 'all') query.set(key,Array.isArray(value) ? value.join(',') : value); });
  const page = await apiRequest<{ items: Array<ActivityDto | Model3DDto>; total: number; nextCursor: string | null }>(`/api/v1/teacher/${params.kind === 'model3d' ? 'models' : 'activities'}?${query}`,{signal});
  return { ...page, items: page.items.map(item => ({ ...item, status: item.visibility, thumbnailUrl: item.coverUrl, summary: item.description || '' })) };
}
