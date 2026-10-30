import { useCallback, useEffect, useRef, useState } from 'react';
import { creativeStorage, CREATIVE_ARTWORKS_CHANGED_EVENT, CreativeDatabaseBlockedError, type CreativeArtwork } from '../../../shared/creative/creativeStorage';
import type { ProfileArtworkPage } from './profileCollection';
import { readCollectionLimit, rememberCollectionLimit } from './collectionViewState';

const kinds = ['drawing', 'scan', 'habitat'] as const;
export function useProfileArtworks() {
  const [records, setRecords] = useState<ProfileArtworkPage[] | null>(null);
  const current = useRef(records); current.current = records;
  const [error, setError] = useState(false), [refreshing, setRefreshing] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const request = useRef(0), active = useRef(false);
  const refreshingRef = useRef(false);
  const pending = useRef(new Map<CreativeArtwork['type'], number>());
  const update = useCallback((value: ProfileArtworkPage[] | null) => { current.current = value; setRecords(value); }, []);
  const reload = useCallback(async () => {
    const version = ++request.current; refreshingRef.current = true; setRefreshing(true);
    try {
      const result = await Promise.all(kinds.map(async kind => ({ kind, ...await creativeStorage.getCompletedArtworkPage(kind, { limit: Math.max(readCollectionLimit(kind), current.current?.find(s => s.kind === kind)?.items.length || 0) }), loadingMore: false, moreError: false })));
      if (active.current && version === request.current) { update(result); setError(false); setBlocked(false); }
    } catch (error) {
      if (active.current && version === request.current) {
        setError(true);
        setBlocked(error instanceof CreativeDatabaseBlockedError);
        update(current.current?.map(section => ({ ...section, loadingMore: false })) || null);
      }
    } finally { if (active.current && version === request.current) { refreshingRef.current = false; setRefreshing(false); } }
  }, [update]);
  const loadMore = useCallback(async (kind: CreativeArtwork['type']) => {
    const section = current.current?.find(s => s.kind === kind), version = request.current;
    if (refreshingRef.current || !section?.nextCursor || pending.current.get(kind) === version) return false;
    pending.current.set(kind, version);
    update(current.current!.map(s => s.kind === kind ? { ...s, loadingMore: true, moreError: false } : s));
    try {
      const page = await creativeStorage.getCompletedArtworkPage(kind, { cursor: section.nextCursor, limit: 6 });
      if (!active.current || request.current !== version) return false;
      const ids = new Set(section.items.map(art => art.id));
      const items = [...section.items, ...page.items.filter(art => !ids.has(art.id))];
      rememberCollectionLimit(kind, items.length);
      update(current.current!.map(s => s.kind === kind ? { ...s, ...page, items, loadingMore: false, moreError: false } : s));
      return true;
    } catch {
      if (active.current && request.current === version) update(current.current!.map(s => s.kind === kind ? { ...s, loadingMore: false, moreError: true } : s));
      return false;
    } finally { if (pending.current.get(kind) === version) pending.current.delete(kind); }
  }, [update]);
  useEffect(() => {
    active.current = true; void reload();
    const refresh = () => { void reload(); };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refresh); window.addEventListener(CREATIVE_ARTWORKS_CHANGED_EVENT, refresh);
    document.addEventListener('visibilitychange', visible);
    return () => {
      active.current = false; request.current++;
      window.removeEventListener('focus', refresh); window.removeEventListener(CREATIVE_ARTWORKS_CHANGED_EVENT, refresh);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [reload]);
  return { records, error, blocked, refreshing, reload, loadMore };
}
