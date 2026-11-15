import { apiRequest } from './client';
import type { CatalogPage, ResourceDto } from './catalog';

export interface ResourceGroup {
  id: string;
  title: string;
  ownerId: string | null;
  isSeed: boolean;
  visibility: 'published' | 'hidden';
  coverMediaId: string | null;
  coverUrl: string | null;
  coverCrop: { x: number; y: number; scale: number };
  memberCount: number;
  libraryMemberCount?: number;
  previews: Pick<ResourceDto, 'id' | 'title' | 'kind' | 'coverUrl'>[];
}
export function fetchResourceGroups(params: { teacher?: boolean; ownedOnly?: boolean; q?: string; cursor?: string; limit?: number } = {}, signal?: AbortSignal) {
  const query = new URLSearchParams();
  if (params.q) query.set('q',params.q);
  if (params.cursor) query.set('cursor',params.cursor);
  if (params.teacher && params.ownedOnly) query.set('owned','1');
  query.set('limit',String(params.limit || 12));
  return apiRequest<CatalogPage<ResourceGroup>>(`/api/v1/${params.teacher ? 'teacher/' : ''}resource-groups?${query}`, { signal });
}
export function fetchResourceGroupById(id: string, teacher = false, signal?: AbortSignal) {
  return apiRequest<ResourceGroup>(`/api/v1/${teacher ? 'teacher/' : ''}resource-groups/${encodeURIComponent(id)}`, { signal });
}
export function saveResourceGroup(input: { title: string; coverMediaId?: string | null; coverCrop?: ResourceGroup['coverCrop']; visibility: ResourceGroup['visibility'] }, id?: string) {
  return apiRequest<{ id: string }>(`/api/v1/teacher/resource-groups${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body: JSON.stringify(input) });
}
export function changeGroupMembers(id: string, resourceIds: string[], remove = false, moveFromGroupId?: string) {
  return apiRequest<{ ok: boolean }>(`/api/v1/teacher/resource-groups/${id}/members`, { method: remove ? 'DELETE' : 'POST', body: JSON.stringify({ resourceIds, moveFromGroupId }) });
}
export function deleteResourceGroup(id: string) {
  return apiRequest(`/api/v1/teacher/resource-groups/${id}`, { method: 'DELETE' });
}
export function duplicateResourceGroup(id: string) {
  return apiRequest<{ id: string }>(`/api/v1/teacher/resource-groups/${id}/duplicate`, { method:'POST' });
}
