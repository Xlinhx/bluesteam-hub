import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ResourceRenderer } from '../src/shared/ui/media/ResourceRenderer';
import type { ResourceDto } from '../src/shared/api/catalog';

const base: ResourceDto = {id:'media-test',ownerId:null,isSeed:true,kind:'video',title:'Nội dung riêng',description:'',coverMediaId:null,mediaId:'abc',coverUrl:null,mediaUrl:'/api/v1/media/abc',content:{},visibility:'published',version:1,topicSlugs:[]};
describe('Truthful resource media', () => {
  it('plays uploaded video URLs without requiring filename extensions', () => {
    const html = renderToString(React.createElement(ResourceRenderer,{resource:base}));
    expect(html).toContain('<video');
    expect(html).toContain('src="/api/v1/media/abc"');
    expect(html).not.toContain('Thời lượng: 0:45');
  });
  it('does not invent a play button, related creatures or available variants', () => {
    const html = renderToString(React.createElement(ResourceRenderer,{resource:{...base,mediaUrl:null}}));
    expect(html).toContain('Chưa có tệp video');
    expect(html).not.toContain('aria-label="Phát video"');
    expect(html).not.toContain('Sinh vật liên quan');
    expect(html).not.toContain('>Tô màu</span>');
  });
  it('provides standard controls for uploaded audio', () => {
    const html = renderToString(React.createElement(ResourceRenderer,{resource:{...base,kind:'audio'}}));
    expect(html).toMatch(/<audio[^>]*controls/);
  });
  it('never substitutes an unrelated crab for a missing visual', () => {
    const html=renderToString(React.createElement(ResourceRenderer,{resource:{...base,kind:'image',mediaUrl:null}}));
    expect(html).not.toContain('crab_friendly_cutout');
    expect(html).toContain('Chưa có hình ảnh');
  });
  it('opens an uploaded PDF as a document instead of a broken image', () => {
    const html=renderToString(React.createElement(ResourceRenderer,{resource:{...base,kind:'poster',mediaMimeType:'application/pdf'}}));
    expect(html).toContain('Mở bản PDF');
    expect(html).not.toContain('<img src="/api/v1/media/abc"');
  });
});
