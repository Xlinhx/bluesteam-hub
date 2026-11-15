import React from 'react';
import {renderToString} from 'react-dom/server';
import {expect,it} from 'vitest';
import {ResourceSurface} from '../src/shared/ui/visuals/ResourceSurface';

it('gives every layout role a distinct scalable contour instead of stretching painted bitmaps',()=>{
 const variants=['shelf-lagoon','shelf-sandbank','shelf-inlet','group','index','observation'] as const;
 const paths=variants.map(variant=>{
  const html=renderToString(<ResourceSurface variant={variant}/>);
  expect(html).toContain(`data-surface="${variant}"`);
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('resource-surface-contour');
  expect(html).not.toMatch(/<image|<img|tabindex|background-image/);
  return html.match(/class="resource-surface-fill" d="([^"]+)"/)?.[1];
 });
 expect(paths.every(Boolean)).toBe(true);
 expect(new Set(paths).size).toBe(variants.length);
});
