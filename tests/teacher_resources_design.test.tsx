import React from 'react';
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { TeacherResourceLibraryPage } from '../src/domains/teacher/resources/TeacherResourceLibraryPage';
import { ResourcePicker } from '../src/domains/teacher/resources/ResourcePicker';
import { ResourceEditor } from '../src/domains/teacher/resources/ResourceEditor';
import { ResourceGroupEditor } from '../src/domains/teacher/resources/ResourceGroupEditor';
vi.mock('../src/app/router',()=>({useRouter:()=>({query:{},setQuery:()=>{}})}));
vi.mock('../src/shared/shells/TeacherShell',()=>({TeacherShell:({children}:{children:React.ReactNode})=><main>{children}</main>}));

it('keeps the teacher library free of learner view and source partitions',()=>{
  const html=renderToString(<TeacherResourceLibraryPage/>);
  expect(html).not.toMatch(/Xem như bé|Kho chung|Của cô|Nguồn học liệu/);
  expect(html).toContain('Nhóm học liệu');
  expect(html).toContain('Thêm học liệu');
});
it('offers one stable creation action and no retired draft state',()=>{
  const html=renderToString(<TeacherResourceLibraryPage/>);
  expect(html).not.toContain('Nháp');
  expect(html).not.toContain('teacher-create-group');
  expect(html).toContain('Phân trang nhóm');
});
it('keeps the group image workspace and footer geometry stable from first opening',()=>{
  const html=renderToString(<ResourceGroupEditor onClose={()=>{}} onSaved={()=>{}}/>);
  expect(html).toContain('resource-dialog-wide');
  expect(html).toContain('group-crop-area');
  expect(html).not.toContain('Nháp');
});
it('uses the branded controls throughout content editing',()=>{
  const html=renderToString(<ResourceEditor onClose={()=>{}} onSaved={async()=>{}}/>);
  expect(html).toContain('role="combobox"');
  expect(html).not.toContain('Nháp');
});
it('identifies the target group and supports clearing, counted additions and pagination',()=>{
  const html=renderToString(<ResourcePicker groupTitle="Rạn san hô" onClose={()=>{}} onChoose={async()=>{}}/>);
  expect(html).toContain('Rạn san hô');
  expect(html).toContain('Bỏ chọn');
  expect(html).toContain('Thêm 0 học liệu');
  expect(html).toContain('Trang học liệu sau');
});
