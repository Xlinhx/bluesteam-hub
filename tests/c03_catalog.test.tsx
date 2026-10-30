import React from 'react';
import {renderToString} from 'react-dom/server';
import {describe,it,expect,vi} from 'vitest';
import {ResourcesLibraryPage} from '../src/domains/learner/resources/ResourcesLibraryPage';

const router=vi.hoisted(()=>({currentPath:'/creative/coloring',query:{} as Record<string,string>,navigate:vi.fn()}));
vi.mock('../src/app/router',()=>({useRouter:()=>router}));
vi.mock('../src/shared/shells/LearnerShell',()=>({LearnerShell:({children,activeNav}:{children:React.ReactNode;activeNav:string})=><main data-active-nav={activeNav}>{children}</main>}));

describe('C03 creative coloring catalog',()=>{
 it('keeps the creative identity and the two mockup capability actions',()=>{
  router.currentPath='/creative/coloring';router.query={};
  const html=renderToString(<ResourcesLibraryPage/>);
  expect(html).toContain('data-active-nav="creative"');
  expect(html).toContain('Chọn tranh để tô</h2>');
  const controls=html.split('aria-label="Cách tô màu"')[1].split('</div>')[0];
  expect(controls.match(/<button/g)).toHaveLength(2);
  expect(controls).toContain('Tô trên màn hình');
  expect(controls).toContain('Có bản in');
  expect(html).toContain('aria-label="Tìm tranh"');
 });
 it('keeps the coloring heading when a group is selected without the resource banner',()=>{
  router.currentPath='/creative/coloring';router.query={group:'reef'};
  const html=renderToString(<ResourcesLibraryPage/>);
  expect(html).toContain('Chọn tranh để tô</h2>');
  expect(html).not.toContain('resource-group-heading');
 });
 it('preserves the resource library identity outside the creative route',()=>{
  router.currentPath='/resources';router.query={};
  const html=renderToString(<ResourcesLibraryPage/>);
  expect(html).toContain('data-active-nav="resources"');
  expect(html).toContain('Nghe · Xem · Khám phá');
  expect(html).not.toContain('aria-label="Cách tô màu"');
 });
});
