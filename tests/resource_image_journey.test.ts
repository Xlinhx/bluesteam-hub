import { expect, it } from 'vitest';
import { resourceJourneyId, resourceImageJourney } from '../src/shared/ui/motion/resourceImageJourney';

it('does not name a late incoming image after a failed or cancelled snapshot is disposed', () => {
  const image = { complete: true, naturalWidth: 500, style: { viewTransitionName: '' }, getAnimations: () => [], getBoundingClientRect: () => ({ width: 120, top: 40, bottom: 160 }) };
  const node = { dataset: { resourceId: 'fish' }, querySelector: () => image };
  const doc = { documentElement: { dataset: {} }, defaultView: { innerHeight: 900 }, querySelectorAll: () => [node], querySelector: () => node };
  const bridge = resourceImageJourney('/resources', '/resources/fish', doc as unknown as Document)!;
  expect(image.style.viewTransitionName).toBe('ocean-resource-image');
  bridge.dispose(); bridge.incoming();
  expect(image.style.viewTransitionName).toBe('');
  expect(doc.documentElement.dataset).toEqual({});
});
it('connects the same resource only between its catalog and detail', () => {
  expect(resourceJourneyId('/resources', '/resources/fish')).toBe('fish');
  expect(resourceJourneyId('/resources/fish', '/resources')).toBe('fish');
  for (const pair of [['/resources/a','/resources/b'],['/home','/resources/fish'],['/teacher/resources','/resources/fish'],['/resources','/resources/video/fish']]) expect(resourceJourneyId(...pair as [string,string])).toBeNull();
});
