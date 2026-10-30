import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { withCreativeDesignSeed } from '../server/src/database/seeds/creative-design';
import { deterministicUuid } from '../server/src/database/seeds/import-seed';
import { validateCreativeConfig } from '../packages/contracts/src/creative';

describe('Creative design seed', () => {
  it('provides real, publishable templates, material references and habitat artwork scenes without changing the archive', () => {
    const source=JSON.parse(fs.readFileSync('server/seed-data/data.json','utf8'));
    const before=JSON.stringify(source);
    const data=withCreativeDesignSeed(source,deterministicUuid);
    expect(JSON.stringify(source)).toBe(before);
    expect(data.reusableContent.creativeTemplates.length).toBeGreaterThan(6);
    const materials=data.reusableContent.creativeMaterials;
    for(const t of data.reusableContent.creativeTemplates){
      expect(validateCreativeConfig(t.kind,t.payload),t.title).toEqual([]);
      expect(t.payload.materials.map((m:any)=>m.id)).toEqual(t.payload.materialIds);
      for(const id of t.payload.materialIds) expect(materials.some((m:any)=>deterministicUuid(m.sourceKey)===id)).toBe(true);
      if(t.payload.outlineUrl) expect(fs.existsSync(`public${t.payload.outlineUrl}`)).toBe(true);
    }
    for(const room of data.demoFixtures.rooms) for(const art of room.artworks) if(art.kind==='habitat') expect(art.scenePayload.items.length).toBeGreaterThan(0);
    expect(withCreativeDesignSeed(data,deterministicUuid)).toEqual(data);
  });
});
