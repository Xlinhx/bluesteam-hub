import type { CSSProperties } from 'react';

type CoverCrop = { x: number; y: number; scale: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function cropImageStyle(crop: CoverCrop): CSSProperties {
  return {
    objectPosition: `${crop.x * 100}% ${crop.y * 100}%`,
    transform: `translate(${(.5 - crop.x) * (crop.scale - 1) * 100}%, ${(.5 - crop.y) * (crop.scale - 1) * 100}%) scale(${crop.scale})`,
  };
}

export function panCoverCrop(crop: CoverCrop, dx: number, dy: number, size: number, aspect: number): CoverCrop {
  const overflowX = size * (Math.max(1, aspect) * crop.scale - 1);
  const overflowY = size * (Math.max(1, 1 / aspect) * crop.scale - 1);
  return { x: overflowX > 0 ? clamp(crop.x - dx / overflowX) : crop.x, y: overflowY > 0 ? clamp(crop.y - dy / overflowY) : crop.y, scale: crop.scale };
}
