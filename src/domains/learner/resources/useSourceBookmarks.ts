import { useState } from 'react';

const STORAGE_KEY = 'bluesteam_ocean_source_bookmarks_v1';

export function readSourceBookmarks(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter(id => typeof id === 'string') : [];
  } catch { return []; }
}

export function writeSourceBookmarks(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useSourceBookmarks() {
  const [saved, setSaved] = useState(readSourceBookmarks);

  function toggle(id: string) {
    const next = saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
    setSaved(next);
    try { writeSourceBookmarks(next); } catch { /* Storage may be disabled. */ }
  }

  return { saved, toggle };
}
