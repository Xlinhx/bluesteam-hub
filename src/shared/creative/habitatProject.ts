import { CreativeSceneItemSchema } from '@bluesteam/contracts';
import type { HabitatPlacedItem } from './habitatTypes';

export interface HabitatProject {
  version: 1;
  activeSceneId: string;
  scenes: { id: string; title: string; items: HabitatPlacedItem[] }[];
}
export const MAX_HABITAT_SCENES = 8;
export function createHabitatProject(items: HabitatPlacedItem[], title = 'Cảnh 1'): HabitatProject {
  return { version:1,activeSceneId:'scene-1',scenes:[{id:'scene-1',title,items:structuredClone(items)}] };
}
export function readHabitatProject(raw: unknown, items: HabitatPlacedItem[]): HabitatProject {
  if (!raw) return createHabitatProject(items);
  const project = raw as HabitatProject;
  if (project.version !== 1 || !Array.isArray(project.scenes) || !project.scenes.length || project.scenes.length > MAX_HABITAT_SCENES || new Set(project.scenes.map(s=>s.id)).size !== project.scenes.length || !project.scenes.some(s=>s.id===project.activeSceneId) || project.scenes.some(s=>!s.id || typeof s.title!=='string' || !Array.isArray(s.items) || s.items.length>100 || s.items.some(item=>!CreativeSceneItemSchema.safeParse(item).success))) throw new Error('Bản sa bàn này chưa thể chỉnh sửa bằng phiên bản hiện tại. Ảnh đã lưu vẫn được giữ.');
  return structuredClone(project);
}
