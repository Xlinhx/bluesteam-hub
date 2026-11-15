import { useEffect, useState } from 'react';
import { ApiClientError, apiRequest } from './client';
import type { ResourceVariantLink } from './catalog';
import type { ProfileRecord } from '@bluesteam/contracts';

export type OceanZone = {
  id: string; axis: 'vertical' | 'horizontal'; title: string; depth: string; intro: string; distance?: string;
  audio?: string; spokenText?: string; inquiry?: { text:string; audio?:string };
};
export type OceanItem = {
  foodChain?: string;
  id: string; kind: string; zone?: string; title: string; group: string; image?: string;
  learned: boolean; images?: string[]; audio?: string; facts?: { label: string; text: string; spokenText?: string; audio?: string }[];
  pages?: number[]; file?: string; note?: string;
  drawingTemplateKey?: string;
  variants?: ResourceVariantLink[];
};
export type OceanItemPage = { items: OceanItem[]; total?: number; nextCursor: string | null; previousCursor: string | null };
export type StudyContext = { id: string; school: string; schoolYear: string; className: string; classId?:string|null; archived?:boolean; enrollmentStatus?:string|null };
export type OceanProfile = {
  name: string; contextId: string | null; personalContextId?: string | null; contexts: StudyContext[]; total: number; learned: number;
  first?: string | null; points?: number; games?: { id: string; title: string; coverUrl?: string | null }[];
};
export type LearnerProfileJourney = {
  species: ProfileRecord[];
  games: ProfileRecord[];
  creations: ProfileRecord[];
  timeline: ProfileRecord[];
  resourceCount: number;
  achievementCount: number;
};
export const oceanApi = <T,>(path: string, options?: RequestInit) =>
  apiRequest<T>('/api/v1/learner-ocean/' + path, options);

export function oceanPath(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  return path + (search.size ? '?' + search : '');
}

export function useOceanData<T>(path: string | null, scope = '', keepWhileRefreshing = false) {
  const [retry, setRetry] = useState(0);
  const resource = path && JSON.stringify([scope, path]);
  const key = resource && JSON.stringify([resource, retry]);
  const [state, setState] = useState<{ key: string; resource: string; data?: T; error?: string; errorStatus?: number }>();
  useEffect(() => {
    if (!path || !key || !resource) return;
    const abort = new AbortController();
    oceanApi<T>(path, { signal: abort.signal }).then(data => {
      if (!abort.signal.aborted) setState({ key, resource, data });
    }, error => {
      if (!abort.signal.aborted) setState(previous => ({ key, resource, data: keepWhileRefreshing && previous?.resource === resource ? previous.data : undefined, error: error.message, errorStatus: error instanceof ApiClientError ? error.status : undefined }));
    });
    return () => abort.abort();
  }, [path, key, resource, keepWhileRefreshing]);
  const current = key && state?.key === key ? state : undefined;
  return { data: current?.data ?? (keepWhileRefreshing && resource && state?.resource === resource ? state.data : undefined), error: current?.error, errorStatus:current?.errorStatus, loading: Boolean(key && !current), reload: () => setRetry(n => n+1) };
}
