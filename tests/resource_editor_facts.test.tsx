import React from 'react';
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';
import { ResourceEditor } from '../src/domains/teacher/resources/ResourceEditor';
import { ResourceObservation } from '../src/shared/ui/media/ResourceObservation';
import { ResourceGroupEditor } from '../src/domains/teacher/resources/ResourceGroupEditor';
import type { ResourceDto } from '../src/shared/api/catalog';

it('lets teachers edit the facts shown in the learner observation', () => {
  const item: ResourceDto = {id:'fact-card',ownerId:'teacher',isSeed:false,kind:'flashcard',title:'Cua',description:'',coverMediaId:null,mediaId:null,coverUrl:null,mediaUrl:null,visibility:'hidden',version:1,topicSlugs:[],content:{shortFacts:[{iconKey:'waves',label:'Sống ven biển',detail:'Bò trên bãi cát'}]}};
  const html = renderToString(<ResourceEditor item={item} onClose={()=>{}} onSaved={async()=>{}}/>);
  expect(html).toContain('Đặc điểm cho bé');
  expect(html).toContain('value="Sống ven biển"');
  expect(html).toContain('Bò trên bãi cát');
  expect(html).toContain('resource-editor-identity');
  expect(html).toContain('Thẻ hình');
  expect(html).toContain('role="tablist"');
  expect(html).toContain('Lưu thay đổi');
});

it('keeps crop controls available without changing the group dialog geometry', () => {
  const html=renderToString(<ResourceGroupEditor group={{id:'group',title:'Biển',ownerId:'teacher',isSeed:false,visibility:'hidden',coverMediaId:'photo',coverUrl:'/cover.jpg',coverCrop:{x:.5,y:.5,scale:1},memberCount:0,previews:[]}} onClose={()=>{}} onSaved={()=>{}}/>);
  expect(html).toContain('type="range"');
  expect(html).toContain('Vùng cắt ảnh');
  expect(html).toContain('Xem trước ảnh tròn');
});

it('uses crab and claw symbols for the authored facts', () => {
  const resource:ResourceDto={id:'crab',ownerId:null,isSeed:true,kind:'flashcard',title:'Cua',description:'',coverMediaId:null,mediaId:null,coverUrl:null,mediaUrl:null,visibility:'published',version:1,topicSlugs:[],content:{shortFacts:[{iconKey:'claw',label:'Hai càng',detail:'Giải thích dài chỉ được đọc khi bé chọn nghe.'},{iconKey:'crab',label:'Bò ngang'}]}};
  const html=renderToString(<ResourceObservation resource={resource} related={[]} onOpen={()=>{}} onOpenDrawing={()=>{}}/>);
  expect(html).toContain('data-fact-icon="claw"');
  expect(html).toContain('data-fact-icon="crab"');
  expect(html).not.toContain('src=""');
  expect(html).not.toContain('Giải thích dài chỉ được đọc khi bé chọn nghe.');
});
