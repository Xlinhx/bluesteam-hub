import {describe,it,expect} from 'vitest';
import {resolveTemplateReference} from '../src/shared/creative/templateReference';
import {deterministicUuid} from '../server/src/database/seeds/import-seed';
describe('legacy creative references',()=>{
 it('resolves preserved source keys to their seeded API identity',async()=>{
  for(const key of ['template:drawing-ocean-friend','template:drawing-crab','template:drawing-clownfish'])expect(await resolveTemplateReference(key)).toBe(deterministicUuid(key));
  expect(await resolveTemplateReference('template:drawing-turtle')).toBe(deterministicUuid('template:drawing-ocean-friend'));
 });
 it('preserves real IDs and rejects unknown references instead of a blank drawing',async()=>{
  const id='1a938ef0-18fc-41b9-b7c1-d4a324671159';expect(await resolveTemplateReference(id)).toBe(id);
  await expect(resolveTemplateReference('missing-template')).rejects.toThrow();
 });
});
