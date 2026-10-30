import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchInteractiveActivitiesPage } from '../src/shared/api/catalog';
import { normalizeSortingConfig, SortingGameRuntime } from '../src/shared/activities/templates/SortingGameRuntime';

afterEach(() => vi.unstubAllGlobals());

describe('Interactive catalog and spatial game contracts', () => {
  it('starts standalone sorting with observation rather than fabricated completed placements', () => {
    const html = renderToStaticMarkup(<SortingGameRuntime context="standalone" title="Về nhà" templateKey="sorting" config={{ targets: [], objects: [{id:'fish',label:'Cá do cô soạn',imageUrl:'/fish.png',acceptedTargetIds:[]}] }} />);
    expect(html).toContain('Bắt đầu tìm nhà');
    expect(html).toContain('Cá do cô soạn');
    expect(html).not.toContain('sorting-complete-banner');
  });
  it('forwards cancellation and the selected kind to the real catalog request', async () => {
    const controller = new AbortController();
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], total: 0, nextCursor: null }), { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', request);
    await fetchInteractiveActivitiesPage({ kind: 'game', topicIds: ['species'], limit: 9 }, controller.signal);
    expect(request.mock.calls[0][0]).toContain('kind=game');
    expect(request.mock.calls[0][0]).toContain('species');
    expect(request.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('does not replace a network failure with sample activities', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
    await expect(fetchInteractiveActivitiesPage({ kind: 'game' })).rejects.toThrow('Network unavailable');
  });

  it('preserves deliberately incomplete drafts without inventing correct answers', () => {
    const config = normalizeSortingConfig({ targets: [{ id: 'reef', label: 'Rạn san hô' }], objects: [{ id: 'fish', label: 'Cá', imageUrl: '/fish.png', scale: 1.4 }] });
    expect(config.objects[0].acceptedTargetIds).toEqual([]);
    expect(config.objects[0]).toMatchObject({ scale: 1.4 });
  });

  it('renders teacher-defined target bounds instead of moving every target into a grid', () => {
    const html = renderToStaticMarkup(<SortingGameRuntime context="preview" title="Về đúng nhà" templateKey="sorting" config={{ targets: [{ id: 'reef', label: 'Rạn san hô', bounds: { x: .12, y: .45, width: .25, height: .2 } }], objects: [] }} />);
    expect(html).toContain('left:12%');
    expect(html).toContain('top:45%');
    expect(html).toContain('width:25%');
  });
});
