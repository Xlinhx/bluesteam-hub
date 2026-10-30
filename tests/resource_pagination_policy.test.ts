import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
const read=(p:string)=>readFileSync(p,'utf8');
it('bounds the learner shelves and resource pages',()=>{
 const s=read('src/domains/learner/resources/ResourcesLibraryPage.tsx');
 expect(s).toContain('limit: 3');expect(s).toContain("limit: kind==='coloring'?6:8");expect(s).toContain('Trang trước');expect(s).toContain('history');
 expect(s).not.toContain('...prev, ...page.items');
});
it('uses twelve teacher rows while retaining six-item selectors',()=>{
 expect(read('src/domains/teacher/resources/TeacherResourceLibraryPage.tsx')).toContain('limit:12');
 expect(read('src/domains/teacher/resources/ResourcePicker.tsx')).toContain('limit:6');
});
