import { describe, expect, it } from 'vitest';
import { getLinkedChoices, preferLinkedChoice } from '../src/shared/api/resourceLinks';

describe('Linked resource choices', () => {
  const variants = [
    {id:'video-2',kind:'video',title:'Cua bò',coverUrl:null},
    {id:'audio-1',kind:'audio',title:'Nghe về cua',coverUrl:null},
    {id:'video-1',kind:'video',title:'Cua ăn',coverUrl:null},
    {id:'video-2',kind:'video',title:'Duplicate',coverUrl:null},
  ];
  it('keeps every authored video in order, with no duplicates', () => {
    expect(getLinkedChoices(variants,'video').map(item=>item.id)).toEqual(['video-2','video-1']);
  });
  it('does not invent unavailable media', () => {
    expect(getLinkedChoices(undefined,'audio')).toEqual([]);
    expect(getLinkedChoices(variants,'coloring')).toEqual([]);
  });
  it('changes the preferred item within its format, preserving other formats and input', () => {
    const result=preferLinkedChoice(variants.slice(0,3),'video-1');
    expect(result.map(v=>v.id)).toEqual(['video-1','audio-1','video-2']);
    expect(variants[0].id).toBe('video-2');
    expect(preferLinkedChoice(result,'missing')).toEqual(result);
  });
  it('treats photos and flashcards as one visual choice', () => {
    const visual=[{id:'photo',kind:'image',title:'Ảnh',coverUrl:null},{id:'card',kind:'flashcard',title:'Thẻ',coverUrl:null}];
    expect(getLinkedChoices(visual,'image').map(v=>v.id)).toEqual(['photo','card']);
    expect(getLinkedChoices(visual,'flashcard').map(v=>v.id)).toEqual(['photo','card']);
  });
});
