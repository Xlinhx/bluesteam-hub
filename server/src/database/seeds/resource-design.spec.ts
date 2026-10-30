import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { withResourceDesignSeed } from './resource-design.js';
import { INITIAL_RESOURCE_GROUPS } from './resource-groups.js';

describe('Resource design content', () => {
  it('replaces the hermit crab album with the true shore crab used by the learning facts', () => {
    const source={reusableContent:{resources:[{sourceKey:'resource:crab-flashcard',kind:'flashcard',mediaUrl:'/hermit.jpg',coverUrl:'/hermit.jpg',content:{albumImages:['/hermit.jpg','/aquarium.jpg'],shortFacts:[{label:'Hai càng'}]}},{sourceKey:'resource:crab-image',kind:'image',mediaUrl:'/hermit.jpg',content:{}}]}};
    const items=withResourceDesignSeed(source).reusableContent.resources;
    expect(items[0].mediaUrl).toBe('/assets/generated/resources/shore-crab-photo.jpg');
    expect(items[0].content.albumImages).toEqual(['/assets/generated/resources/shore-crab-photo.jpg']);
    expect(items[0].content.shortFacts).toEqual([{label:'Hai càng'}]);
    expect(items[1].mediaUrl).toBe(items[0].mediaUrl);
    expect(source.reusableContent.resources[0].mediaUrl).toBe('/hermit.jpg');
  });
  it('keeps missing or mislabeled recordings hidden and uses close-up specimen images', () => {
    const source = {reusableContent:{resources:[
      {sourceKey:'resource:crab-video',kind:'video',mediaUrl:'/crab.jpg',visibility:'published'},
      {sourceKey:'resource:wave-audio',kind:'audio',mediaUrl:null,visibility:'published'},
      {sourceKey:'resource:real-video',kind:'video',mediaUrl:'/actual.mp4',visibility:'published'},
      {sourceKey:'resource:clownfish-flashcard',kind:'flashcard',mediaUrl:'/aquarium.jpg',coverUrl:'/aquarium.jpg'},
    ]}};
    const items = withResourceDesignSeed(source).reusableContent.resources;
    expect(items[0]).toMatchObject({visibility:'hidden',mediaUrl:null});
    expect(items[1].visibility).toBe('hidden');
    expect(items[2].visibility).toBe('published');
    expect(items[3].coverUrl).toBe('/assets/ocean/specimen-clownfish.jpg');
    expect(source.reusableContent.resources[0].visibility).toBe('published');
  });
  it('adds six real image resources without changing the archived source', () => {
    const source = {reusableContent:{resources:[{sourceKey:'resource:existing',title:'Giữ nguyên'}]}};
    const result = withResourceDesignSeed(source);
    expect(source.reusableContent.resources).toHaveLength(1);
    expect(result.reusableContent.resources).toHaveLength(7);
    expect(withResourceDesignSeed(result)).toEqual(result);
    for (const item of result.reusableContent.resources.slice(1)) {
      expect(item.kind).toBe('flashcard');
      expect(item.mediaUrl).toBe(item.coverUrl);
      expect(item.content.narrationText.length).toBeGreaterThan(30);
      expect(fs.existsSync(path.resolve(process.cwd(),'..','public',item.coverUrl.slice(1)))).toBe(true);
    }
  });
  it('declares four editorial previews first, independent from format links', () => {
    expect(INITIAL_RESOURCE_GROUPS.map(group=>group.members.slice(0,4))).toEqual([
      ['clownfish-flashcard','coral-flashcard','anemone-flashcard','butterflyfish-flashcard'],
      ['crab-flashcard','starfish-flashcard','seashell-flashcard','sea-snail-flashcard'],
      ['plastic-litter-flashcard','reusable-bag-flashcard','beach-cleanup-flashcard','green-turtle-flashcard'],
    ]);
  });
});
