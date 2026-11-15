import { useEffect, useState } from 'react';
import { fetchPublicResourceById } from '../../../shared/api/catalog';
import { readSourceBookmarks, writeSourceBookmarks } from './useSourceBookmarks';

const STORAGE_KEY = 'bluesteam_saved_resources_v2';

function readSaved(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { return {}; }
}

export function useResourceBookmarks() {
  const [saved, setSaved] = useState(readSaved);

  useEffect(() => {
    const aliases = readSourceBookmarks().filter(id => /^flashcards-\d+$/.test(id));
    if (!aliases.length) return;
    const request = new AbortController();
    void Promise.allSettled(aliases.map(alias => fetchPublicResourceById(alias, request.signal))).then(results => {
      if (request.signal.aborted) return;
      const next = readSaved();
      const migrated = new Set<string>();
      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return;
        const { id } = result.value;
        if (!(id in next)) next[id] = true;
        migrated.add(aliases[index]);
      });
      if (!migrated.size) return;
      setSaved(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        writeSourceBookmarks(readSourceBookmarks().filter(alias => !migrated.has(alias)));
      } catch { /* Retry the migration when browser storage becomes available. */ }
    });
    return () => request.abort();
  }, []);

  function toggleSaved(id: string) {
    const next = { ...saved, [id]: !saved[id] };
    setSaved(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Device storage may be full. */ }
    return next[id];
  }

  return { saved, toggleSaved };
}
