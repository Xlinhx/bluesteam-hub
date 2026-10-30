import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {DrawingPalette} from '../src/shared/creative/DrawingPalette';

describe('C04 reference palette',()=>{
 it('keeps the current color before the basic colors, with no invented recent history',()=>{
  const html=renderToStaticMarkup(React.createElement(DrawingPalette,{value:'#1E7E48',onApply:()=>{},recent:[],disabled:false,variant:'coloring'} as any));
  expect(html).toContain('Màu đang dùng');
  expect(html.indexOf('Màu đang dùng')).toBeLessThan(html.indexOf('Chọn màu Đen'));
  expect(html).not.toContain('Chọn màu Cam');
  expect(html).toContain('Chưa có màu vừa dùng');
 });
});
