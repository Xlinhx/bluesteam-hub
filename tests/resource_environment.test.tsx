import React from 'react';
import {renderToString} from 'react-dom/server';
import {it,expect,vi} from 'vitest';
import {ResourcesLibraryPage} from '../src/domains/learner/resources/ResourcesLibraryPage';
import {TeacherResourceLibraryPage} from '../src/domains/teacher/resources/TeacherResourceLibraryPage';
import {ResourceObservation} from '../src/shared/ui/media/ResourceObservation';
import type {ResourceDto} from '../src/shared/api/catalog';
const router=vi.hoisted(()=>({query:{} as Record<string,string>,navigate:vi.fn(),setQuery:vi.fn()}));
vi.mock('../src/app/router',()=>({useRouter:()=>router}));
vi.mock('../src/shared/shells/LearnerShell',()=>({LearnerShell:({children}:{children:React.ReactNode})=><main>{children}</main>}));
vi.mock('../src/shared/shells/TeacherShell',()=>({TeacherShell:({children}:{children:React.ReactNode})=><main>{children}</main>}));
it('gives the discovery library a decorative environment without adding narration or metadata',()=>{
 router.query={};const html=renderToString(<ResourcesLibraryPage/>);
 expect(html).toContain('data-resource-scene="learner"');expect(html).toContain('Nghe · Xem · Khám phá');
 expect(html).toContain('resource-seascape');expect(html).not.toContain('canvas');
});
it('replaces the generic discovery banner with a group identity when entering any group',()=>{
 router.query={group:'unknown-future-group'};const html=renderToString(<ResourcesLibraryPage/>);
 expect(html).toContain('resource-group-heading');expect(html).not.toContain('Nghe · Xem · Khám phá');
 expect(html).not.toContain('ocean-discovery-banner.webp');expect(html).toContain('Chọn nhóm học liệu');
});
it('uses a quieter environment for teacher work without resurrecting source partitions',()=>{
 router.query={};const html=renderToString(<TeacherResourceLibraryPage/>);
 expect(html).toContain('data-resource-scene="teacher"');expect(html).not.toMatch(/Xem như bé|Kho chung|Của cô/);
});
it('ties the observation response to actual listening state instead of permanent ambient motion',()=>{
 const resource={id:'fish',kind:'flashcard',title:'Cá',description:'',content:{},variants:[],topicSlugs:[]} as unknown as ResourceDto;
 const html=renderToString(<ResourceObservation resource={resource} related={[]} onOpen={()=>{}} onOpenDrawing={()=>{}}/>);
 expect(html).toContain('data-listening="false"');expect(html).toContain('observation-listen-ripple');
});
