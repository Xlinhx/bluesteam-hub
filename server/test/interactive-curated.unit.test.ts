import { describe, expect, it, vi } from 'vitest';
import { ActivitiesController } from '../src/content/activities/activities.controller.js';
import { ModelsController } from '../src/content/models/models.controller.js';
import { InteractiveGroupsController } from '../src/content/activities/interactive-groups.controller.js';
describe('Curated interactive content has no teacher writes',()=>{
  it('rejects every mutation without calling persistence',async()=>{
    const service=new Proxy({}, {get:()=>vi.fn()});
    const activities=new ActivitiesController(service as any), models=new ModelsController(service as any), groups=new InteractiveGroupsController(service as any);
    for(const action of [()=>activities.createTeacherActivity({actor:{teacherId:'t'}},{}),()=>activities.updateTeacherActivity({actor:{teacherId:'t'}},'id',{}),()=>activities.duplicateTeacherActivity({actor:{teacherId:'t'}},'id'),()=>activities.deleteTeacherActivity({actor:{teacherId:'t'}},'id'),()=>models.createTeacherModel({actor:{teacherId:'t'}},{}),()=>models.updateTeacherModel({actor:{teacherId:'t'}},'id',{}),()=>models.duplicateTeacherModel({actor:{teacherId:'t'}},'id'),()=>models.deleteTeacherModel({actor:{teacherId:'t'}},'id'),()=>groups.create({actor:{teacherId:'t'}},{}),()=>groups.update({actor:{teacherId:'t'}},'id',{}),()=>groups.add({actor:{teacherId:'t'}},'id',{}),()=>groups.removeMembers({actor:{teacherId:'t'}},'id',{}),()=>groups.remove({actor:{teacherId:'t'}},'id')]) {
      await expect(Promise.resolve().then(action)).rejects.toMatchObject({code:'INTERACTIVE_CONTENT_READ_ONLY'});
    }
  });
});
