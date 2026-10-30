import { describe, expect, it } from 'vitest';
import { cropImageStyle, panCoverCrop } from '../src/shared/ui/visuals/resourceCoverCrop';

describe('Group cover framing', () => {
  it('pans a zoomed square to both edges without leaving a gap', () => {
    expect(cropImageStyle({ x: 0, y: 1, scale: 3 })).toEqual({ objectPosition: '0% 100%', transform: 'translate(100%, -100%) scale(3)' });
    expect(panCoverCrop({ x: .5, y: .5, scale: 3 }, 100, -100, 100, 1)).toEqual({ x: 0, y: 1, scale: 3 });
  });
  it('accounts for landscape overflow even without zoom', () => {
    expect(panCoverCrop({ x: .5, y: .5, scale: 1 }, -50, 80, 100, 2)).toEqual({ x: 1, y: .5, scale: 1 });
  });
  it('clamps dragging and keeps scale unchanged', () => {
    expect(panCoverCrop({ x: .5, y: .5, scale: 2 }, 1000, -1000, 100, .5)).toEqual({ x: 0, y: 1, scale: 2 });
  });
});
