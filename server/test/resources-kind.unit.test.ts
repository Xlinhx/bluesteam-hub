import { describe, expect, it, vi } from 'vitest';
import { ResourcesService } from '../src/content/resources/resources.service.js';

describe('ResourcesService visual kind filter', () => {
  it('queries flashcards and images together while preserving the normal resource filters', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ total: 2 }] })
      .mockResolvedValueOnce({ rows: [] });
    const service = new ResourcesService({ query } as never);

    const page = await service.listResources({ isTeacher: false, kind: 'visual' });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain('r.kind = ANY');
    expect(query.mock.calls[0][1]).toEqual([['flashcard', 'card', 'image']]);
    expect(page.total).toBe(2);
  });
});
