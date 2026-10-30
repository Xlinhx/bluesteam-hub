import { describe, expect, it } from 'vitest';
import { parseResourceInput } from './resource-input.js';

describe('Resource input validation', () => {
  it('rejects retired draft visibility for both creation and partial updates', () => {
    expect(() => parseResourceInput({title:'Cá',kind:'flashcard',visibility:'draft'})).toThrow();
    expect(() => parseResourceInput({visibility:'draft'},true)).toThrow();
    expect(parseResourceInput({visibility:'hidden'},true)).toEqual({visibility:'hidden'});
  });
  it('rejects malformed payloads before touching the database', () => {
    for (const input of [{title:5,kind:'video'},{title:'Cua',kind:'unknown'},{title:'Cua',kind:'image',visibility:'seed'},{title:'Cua',kind:'image',linkedVariantIds:'not-an-array'}]) {
      expect(() => parseResourceInput(input)).toThrow();
    }
  });
  it('allows partial edits, trims titles and preserves content fields', () => {
    expect(parseResourceInput({title:' Cua ',content:{shortFacts:[]}},true)).toEqual({title:'Cua',content:{shortFacts:[]}});
    expect(() => parseResourceInput({},false)).toThrow();
  });
});
