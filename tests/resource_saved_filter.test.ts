import { afterEach, expect, it, vi } from 'vitest';
import { fetchPublicResources } from '../src/shared/api/catalog';

afterEach(() => vi.unstubAllGlobals());
it('treats an empty saved collection as empty instead of removing its filter', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [{ id: 'unrelated' }], total: 1, nextCursor: null }), { headers: { 'Content-Type': 'application/json' } }));
  vi.stubGlobal('fetch', fetch);
  expect(await fetchPublicResources({ savedIds: [] })).toEqual({ items: [], total: 0, nextCursor: null });
  expect(fetch).not.toHaveBeenCalled();
});
