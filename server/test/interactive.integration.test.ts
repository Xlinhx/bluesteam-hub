import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { createDatabasePool, assertTestDatabaseUrl } from '../src/database/pool.js';
import { runMigrations } from '../src/database/migrate.js';
import { ActivitiesService } from '../src/content/activities/activities.service.js';
import { InteractiveGroupsService } from '../src/content/activities/interactive-groups.service.js';

const url = process.env.INTERACTIVE_TEST_DATABASE_URL || 'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_interactive_test';
const pool = createDatabasePool(url);
const activities = new ActivitiesService(pool);
const groups = new InteractiveGroupsService(pool);
let teacherId = '';
const game = () => ({ instructionText: 'Chạm vào một bạn rồi chạm nơi sống.', targets: [{ id: 'reef', label: 'Rạn san hô' }, { id: 'sand', label: 'Bờ cát' }], objects: [{ id: 'fish', label: 'Cá', imageUrl: '/fish.png', acceptedTargetIds: ['reef'] }, { id: 'shell', label: 'Vỏ sò', imageUrl: '/shell.png', acceptedTargetIds: ['sand'] }] });
describe('Interactive publish and working-copy persistence', () => {
  beforeAll(async () => {
    assertTestDatabaseUrl(url);
    const admin = createDatabasePool(url.replace(/\/[^/]+$/, '/postgres'));
    try { if (!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [new URL(url).pathname.slice(1)])).rows.length) await admin.query('CREATE DATABASE bluesteam_interactive_test'); } finally { await admin.end(); }
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public');
    await runMigrations(pool);
    teacherId = (await pool.query("INSERT INTO teachers(email,password_hash,display_name,status) VALUES('interactive@test.local','test-only','Cô thử nghiệm','active') RETURNING id")).rows[0].id;
  });
  afterAll(() => pool.end());
  it('saves incomplete drafts, rejects invalid publish and never invents an accepted target', async () => {
    const config = game(); config.objects[0].acceptedTargetIds = [];
    const draft = await activities.createTeacherActivity(teacherId, { kind: 'game', title: 'Bản nháp', templateKey: 'sorting', config });
    expect((draft.config as any).objects[0].acceptedTargetIds).toEqual([]);
    await expect(activities.updateTeacherActivity(teacherId, draft.id, { visibility: 'published' })).rejects.toMatchObject({ code: 'INVALID_GAME_CONFIG' });
    expect((await activities.getActivityById(draft.id, { isTeacher: true, teacherId })).visibility).toBe('draft');
  });
  it('never invents a correct choice when saving or publishing an incomplete question', async () => {
    const config = {instructionText:'Chọn hình đúng',questions:[{id:'q',promptText:'Cá ở đâu?',options:[{id:'a',label:'Cá',imageUrl:'/fish.png'},{id:'b',label:'Sò',imageUrl:'/shell.png'}]}]};
    const draft = await activities.createTeacherActivity(teacherId,{kind:'game',templateKey:'choice',title:'Chưa có đáp án',config});
    expect((draft.config as any).questions[0].correctOptionId).toBe('');
    await expect(activities.updateTeacherActivity(teacherId,draft.id,{visibility:'published'})).rejects.toMatchObject({code:'INVALID_GAME_CONFIG'});
  });
  it('keeps missing object artwork empty after saving and rejects its publication', async () => {
    const config=game();config.objects[0].imageUrl='';
    const draft=await activities.createTeacherActivity(teacherId,{kind:'game',templateKey:'sorting',title:'Chưa có ảnh',config});
    expect((draft.config as any).objects[0].imageUrl).toBe('');
    await expect(activities.updateTeacherActivity(teacherId,draft.id,{visibility:'published'})).rejects.toMatchObject({code:'INVALID_GAME_CONFIG'});
  });
  it('keeps the published version playable while an incomplete edit is saved and reloads the working copy', async () => {
    const original = await activities.createTeacherActivity(teacherId, { kind: 'game', title: 'Đã xuất bản', templateKey: 'sorting', config: game(), visibility: 'published' });
    const config = game(); config.objects[0].acceptedTargetIds = [];
    await activities.updateTeacherActivity(teacherId, original.id, { title: 'Đang sửa', config, draftOnly: true } as any);
    const teacher = await activities.getActivityById(original.id, { isTeacher: true, teacherId });
    const learner = await activities.getActivityById(original.id, { isTeacher: false });
    expect(teacher.title).toBe('Đang sửa'); expect((teacher.config as any).objects[0].acceptedTargetIds).toEqual([]);
    expect(learner.title).toBe('Đã xuất bản'); expect((learner.config as any).objects[0].acceptedTargetIds).toEqual(['reef']);
    await expect(activities.updateTeacherActivity(teacherId, original.id, { visibility: 'published' })).rejects.toMatchObject({ code: 'INVALID_GAME_CONFIG' });
    await activities.updateTeacherActivity(teacherId, original.id, { visibility: 'published', config: game() });
    expect((await activities.getActivityById(original.id, { isTeacher: false })).title).toBe('Đang sửa');
  });
  it('keeps groups private until published, deduplicates membership, and removing a group preserves its activities', async () => {
    const activity = await activities.createTeacherActivity(teacherId, { kind: 'game', title: 'Cá về nhà', templateKey: 'sorting', config: game(), visibility: 'published' });
    const group = await groups.save(teacherId, { title: 'Ngôi nhà đại dương' });
    await groups.members(teacherId, group.id, { activityIds: [activity.id, activity.id] });
    expect((await groups.list({ teacherId, kind: 'game' })).items.find(g => g.id === group.id)?.memberCount).toBe(1);
    expect((await groups.list({ kind: 'game' })).items.some(g => g.id === group.id)).toBe(false);
    await groups.save(teacherId, { visibility: 'published' }, group.id);
    expect((await groups.list({ kind: 'game' })).items.find(g => g.id === group.id)?.memberCount).toBe(1);
    await expect(groups.save('00000000-0000-4000-8000-000000000099', { title: 'Không được sửa' }, group.id)).rejects.toMatchObject({ status: 403 });
    await groups.remove(teacherId, group.id);
    expect((await activities.getActivityById(activity.id, { isTeacher: false })).id).toBe(activity.id);
  });
  it('preserves a working copy when the teacher hides a published game', async () => {
    const original = await activities.createTeacherActivity(teacherId, {kind:'game',title:'Bài đang hiển thị',templateKey:'sorting',config:game(),visibility:'published'});
    await activities.updateTeacherActivity(teacherId, original.id, {draftOnly:true,title:'Bản sửa chưa xuất bản'});
    await activities.updateTeacherActivity(teacherId, original.id, {visibility:'hidden'});
    const reloaded = await activities.getActivityById(original.id, {isTeacher:true,teacherId});
    expect(reloaded.title).toBe('Bản sửa chưa xuất bản');
    expect(reloaded.hasWorkingCopy).toBe(true);
    await expect(activities.getActivityById(original.id, {isTeacher:false})).rejects.toMatchObject({status:404});
  });
});
