import React from 'react';
import {renderToString} from 'react-dom/server';
import {expect,it} from 'vitest';
import {ResourceEditor} from '../src/domains/teacher/resources/ResourceEditor';
import {mediaRule,validateUpload,compatibleMedia,readAlbum,validateResourceDraft,coverFromResource} from '../src/domains/teacher/resources/resourceAuthoring';
import type {ResourceDto} from '../src/shared/api/catalog';

it('matches the upload formats and limits actually accepted by the server',()=>{
 expect(mediaRule('video').accept).toBe('video/mp4');
 expect(mediaRule('audio').accept).toBe('audio/mpeg');
 expect(validateUpload({type:'video/webm',size:500},'video')).toBeTruthy();
 expect(validateUpload({type:'audio/wav',size:500},'audio')).toBeTruthy();
 expect(validateUpload({type:'video/mp4',size:200*1024*1024+1},'video')).toBeTruthy();
 expect(validateUpload({type:'application/pdf',size:1000},'poster')).toBe('');
 expect(validateUpload({type:'image/png',size:0},'flashcard')).toBeTruthy();
});
it('detects incompatible media before changing the format',()=>{
 expect(compatibleMedia({mimeType:'image/png'},'video')).toBe(false);
 expect(compatibleMedia({mimeType:'video/mp4'},'audio')).toBe(false);
 expect(compatibleMedia({mimeType:'image/jpeg'},'poster')).toBe(true);
});
it('preserves and orders both current and legacy albums',()=>{
 const item={mediaId:'first',mediaUrl:'/first.jpg',content:{albumUrls:['/second.jpg','/first.jpg']}} as ResourceDto;
 expect(readAlbum(item).map(a=>a.url)).toEqual(['/second.jpg','/first.jpg']);
 expect(readAlbum({...item,content:{albumImages:['/legacy.jpg']}} as unknown as ResourceDto)[0].url).toBe('/legacy.jpg');
});
it('identifies the field that blocks publishing without inventing a draft state',()=>{
 expect(validateResourceDraft({title:'',kind:'video',visibility:'hidden',hasMedia:false,hasImage:false,hasTemplate:false})?.field).toBe('title');
 expect(validateResourceDraft({title:'Video',kind:'video',visibility:'published',hasMedia:false,hasImage:true,hasTemplate:false})?.field).toBe('media');
 expect(validateResourceDraft({title:'Tô màu',kind:'coloring',visibility:'published',hasMedia:false,hasImage:false,hasTemplate:true})).toBeNull();
 expect(validateResourceDraft({title:'Poster',kind:'poster',visibility:'published',hasMedia:false,hasImage:false,hasTemplate:false})?.field).toBe('media');
});
it('keeps an automatic album cover following the first image after reopening',()=>{
 const item={kind:'flashcard',coverMediaId:'first',mediaId:'first',coverUrl:'/first.jpg',content:{}} as ResourceDto;
 expect(coverFromResource(item)).toBeNull();
 expect(coverFromResource({...item,content:{coverOverride:true}})?.id).toBe('first');
 expect(coverFromResource({...item,coverMediaId:'custom'})?.id).toBe('custom');
 expect(readAlbum({...item,mediaId:null})[0].url).toBe('/first.jpg');
});
it('exposes a primary content upload, optional cover and a genuine unsaved preview',()=>{
 const html=renderToString(<ResourceEditor onClose={()=>{}} onSaved={async()=>{}}/>);
 expect(html).toContain('Ảnh thẻ');expect(html).toContain('Ảnh bìa riêng');expect(html).toContain('Xem trước');
 expect(html).toContain('multiple=""');expect(html).toContain('noValidate=""');
 expect(html).not.toContain('audio/wav');expect(html).not.toContain('video/webm');
});
