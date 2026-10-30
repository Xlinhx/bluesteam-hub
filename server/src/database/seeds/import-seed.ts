import { withStandaloneDesignSeed } from './standalone-design.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { hashSync } from '@node-rs/argon2';
import { INITIAL_RESOURCE_GROUPS } from './resource-groups.js';
import { withResourceDesignSeed } from './resource-design.js';
import { INITIAL_INTERACTIVE_GROUPS, withInteractiveDesignSeed } from './interactive-design.js';
import { withCreativeDesignSeed } from './creative-design.js';

export interface ImportSeedOptions {
  mode: 'content' | 'demo';
  dryRun?: boolean;
  dbClient?: {
    query: (sql: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount?: number | null }>;
  };
  overrideData?: any;
  archiveDir?: string;
}

export interface SeedMappingRecord {
  sourceKey: string;
  targetType: string;
  targetId: string;
  sourceChecksum: string;
}

export interface ImportSeedResult {
  mode: 'content' | 'demo';
  dryRun: boolean;
  counts: {
    topics: number;
    resources: number;
    resourceGroups: number;
    activities: number;
    models3d: number;
    creativeTemplates: number;
    creativeMaterials: number;
    demoTeachers: number;
    artworks: number;
  };
  mappings: SeedMappingRecord[];
}

export function deterministicUuid(sourceKey: string): string {
  const hash = crypto.createHash('sha256').update(`bluesteam-r2-seed:${sourceKey}`).digest('hex');
  const p1 = hash.slice(0, 8);
  const p2 = hash.slice(8, 12);
  const p3 = '4' + hash.slice(13, 16);
  const variantNibble = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  const p4 = variantNibble + hash.slice(17, 20);
  const p5 = hash.slice(20, 32);
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

function checksumJson(obj: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

export async function importSeed(options: ImportSeedOptions): Promise<ImportSeedResult> {
  const { mode, dryRun = false, dbClient, overrideData } = options;
  const defaultArchiveDir = fs.existsSync(
    path.join(process.cwd(), 'server', 'seed-data', 'data.json')
  )
    ? path.join(process.cwd(), 'server', 'seed-data')
    : path.resolve(process.cwd(), '..', 'server', 'seed-data');

  const archiveDir =
    options.archiveDir && fs.existsSync(path.join(options.archiveDir, 'data.json'))
      ? options.archiveDir
      : defaultArchiveDir;
  const dataPath = path.join(archiveDir, 'data.json');
  const manifestPath = path.join(archiveDir, 'source-manifest.json');

  if (!overrideData && (!fs.existsSync(dataPath) || !fs.existsSync(manifestPath))) {
    throw new Error(`Seed archive missing at ${archiveDir}. Restore the tracked server/seed-data fixtures before seeding.`);
  }

  const data = overrideData || withStandaloneDesignSeed(withResourceDesignSeed(withInteractiveDesignSeed(withCreativeDesignSeed(JSON.parse(fs.readFileSync(dataPath, 'utf-8')), deterministicUuid, mode))), mode);
  const seenKeys = new Map<string, string>();
  const mappings: SeedMappingRecord[] = [];

  const registerMapping = (sourceKey: string, targetType: string, payload: unknown): string => {
    if (!sourceKey || typeof sourceKey !== 'string') {
      throw new Error(`Invalid empty sourceKey for targetType=${targetType}`);
    }
    const checksum = checksumJson(payload);
    const existing = seenKeys.get(sourceKey);
    if (existing !== undefined) {
      throw new Error(`Seed sourceKey collision detected for "${sourceKey}"`);
    }
    seenKeys.set(sourceKey, checksum);
    const targetId = deterministicUuid(sourceKey);
    mappings.push({
      sourceKey,
      targetType,
      targetId,
      sourceChecksum: checksum,
    });
    return targetId;
  };

  const reusable = data.reusableContent || {};
  const topics = reusable.topics || [];
  const resources = reusable.resources || [];
  const activities = reusable.activities || [];
  const models3d = reusable.models3d || [];
  const creativeTemplates = reusable.creativeTemplates || [];
  const creativeMaterials = reusable.creativeMaterials || [];

  for (const t of topics) registerMapping(t.sourceKey, 'topic', t);
  for (const r of resources) registerMapping(r.sourceKey, 'resource', r);
  for (const group of INITIAL_RESOURCE_GROUPS) registerMapping(`resource-group:${group.key}`, 'resource_group', group);
  for (const a of activities) registerMapping(a.sourceKey, 'activity', a);
  for (const m of models3d) registerMapping(m.sourceKey, 'model3d', m);
  for (const ct of creativeTemplates) registerMapping(ct.sourceKey, 'creative_template', ct);
  for (const cm of creativeMaterials) registerMapping(cm.sourceKey, 'creative_material', cm);

  let demoTeachersCount = 0;

  if (mode === 'demo' && data.demoFixtures) {
    const df = data.demoFixtures;
    if (df.teacherUser) {
      registerMapping(df.teacherUser.sourceKey, 'teacher_user', df.teacherUser);
      demoTeachersCount = 1;
      for (const art of df.artworks || []) registerMapping(art.sourceKey, 'artwork', art);
    }
  }

  const result: ImportSeedResult = {
    mode,
    dryRun,
    counts: {
      topics: topics.length,
      resources: resources.length,
      resourceGroups: INITIAL_RESOURCE_GROUPS.length,
      activities: activities.length,
      models3d: models3d.length,
      creativeTemplates: creativeTemplates.length,
      creativeMaterials: creativeMaterials.length,
      demoTeachers: demoTeachersCount,
      artworks: mode === 'demo' ? data.demoFixtures?.artworks?.length || 0 : 0,
    },
    mappings,
  };

  if (dryRun || !dbClient) {
    return result;
  }

  // Execute idempotent database import inside transaction
  await dbClient.query('BEGIN');
  try {
    const ensureMediaAsset = async (url: string | null | undefined): Promise<string | null> => {
      if (!url) return null;
      const mediaSourceKey = `media:${url}`;
      const mediaId = deterministicUuid(mediaSourceKey);
      const ext = path.extname(url).toLowerCase();
      const mime =
        ext === '.png'
          ? 'image/png'
          : ext === '.webp'
          ? 'image/webp'
          : ext === '.mp3'
          ? 'audio/mpeg'
          : ext === '.mp4'
          ? 'video/mp4'
          : 'image/jpeg';
      const kind = mime.startsWith('audio/')
        ? 'audio'
        : mime.startsWith('video/')
        ? 'video'
        : 'image';
      const publicDir = path.resolve(archiveDir, '../../public');
      const diskPath = path.resolve(publicDir, url.replace(/^\//, ''));
      const bytes = diskPath.startsWith(publicDir + path.sep) && fs.existsSync(diskPath) ? fs.readFileSync(diskPath) : null;
      const checksum = crypto.createHash('sha256').update(bytes || url).digest('hex');

      const res = await dbClient.query(
        `INSERT INTO media_assets (id, owner_id, storage_key, kind, mime_type, byte_size, sha256, status, original_filename)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, 'ready', $7)
         ON CONFLICT (storage_key) DO UPDATE SET status = 'ready'
         RETURNING id`,
        [mediaId, url, kind, mime, bytes?.length || 1024, checksum, path.basename(url)]
      );
      return res.rows[0]?.id || mediaId;
    };

    const upsertSeedMapping = async (rec: SeedMappingRecord) => {
      const existing = await dbClient.query(
        `SELECT target_type, target_id FROM seed_mappings WHERE source_key = $1`,
        [rec.sourceKey]
      );
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        if (row.target_type !== rec.targetType || row.target_id !== rec.targetId) {
          throw new Error(
            `Seed mapping collision in DB for ${rec.sourceKey}: expected ${rec.targetType}/${rec.targetId}, found ${row.target_type}/${row.target_id}`
          );
        }
      }
      await dbClient.query(
        `INSERT INTO seed_mappings (source_key, target_type, target_id, source_checksum)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (source_key) DO UPDATE SET source_checksum = EXCLUDED.source_checksum`,
        [rec.sourceKey, rec.targetType, rec.targetId, rec.sourceChecksum]
      );
    };

    const topicIdBySlug = new Map<string, string>();
    let sortIdx = 0;
    for (const t of topics) {
      sortIdx++;
      const targetId = deterministicUuid(t.sourceKey);
      await ensureMediaAsset(t.coverUrl);
      const topicRow = await dbClient.query(
        `INSERT INTO topics (id, slug, title, icon_key, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, icon_key = EXCLUDED.icon_key, sort_order = EXCLUDED.sort_order
         RETURNING id`,
        [targetId, t.slug, t.label, t.iconKey, sortIdx]
      );
      topicIdBySlug.set(t.slug, topicRow.rows[0]?.id || targetId);
    }

    for (const r of resources) {
      const targetId = deterministicUuid(r.sourceKey);
      const coverMediaId = await ensureMediaAsset(r.coverUrl);
      const mediaId = await ensureMediaAsset(r.mediaUrl);
      await dbClient.query(
        `INSERT INTO resources (id, owner_id, kind, title, description, cover_media_id, media_id, content, visibility, version)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, 1)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           cover_media_id = EXCLUDED.cover_media_id,
           media_id = EXCLUDED.media_id,
           content = EXCLUDED.content,
           visibility = EXCLUDED.visibility WHERE resources.owner_id IS NULL`,
        [
          targetId,
          r.kind,
          r.title,
          r.description || '',
          coverMediaId,
          mediaId,
          JSON.stringify(r.content || {}),
          r.visibility === 'draft' ? 'hidden' : r.visibility || 'published',
        ]
      );

      for (const slug of r.topicSlugs || []) {
        const topicId = topicIdBySlug.get(slug);
        if (topicId) {
          await dbClient.query(
            `INSERT INTO resource_topics (resource_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [targetId, topicId]
          );
        }
      }
    }

    // Second pass for resource variant links
    for (const r of resources) {
      const sourceId = deterministicUuid(r.sourceKey);
      for (const linkedKey of r.linkedVariantSourceKeys || []) {
        const linkedId = deterministicUuid(linkedKey);
        if (sourceId !== linkedId) {
          await dbClient.query(
            `INSERT INTO resource_links (source_resource_id, target_resource_id) SELECT $1::uuid,$2::uuid
             WHERE EXISTS(SELECT 1 FROM resources WHERE id=$1 AND owner_id IS NULL) ON CONFLICT DO NOTHING`,
            [sourceId, linkedId]
          );
        }
      }
    }

    for (const [order, group] of INITIAL_RESOURCE_GROUPS.entries()) {
      const id = deterministicUuid(`resource-group:${group.key}`);
      const coverId = await ensureMediaAsset(group.cover);
      await dbClient.query(`INSERT INTO resource_groups(id,title,cover_media_id,visibility,sort_order)
        VALUES($1,$2,$3,'published',$4) ON CONFLICT(id) DO UPDATE SET
        title=EXCLUDED.title,cover_media_id=EXCLUDED.cover_media_id,sort_order=EXCLUDED.sort_order
        WHERE resource_groups.owner_id IS NULL`, [id,group.title,coverId,order]);
      for (const [memberOrder, key] of group.members.entries()) {
        if (!resources.some((r: any) => r.sourceKey === `resource:${key}`)) continue;
        await dbClient.query(`INSERT INTO resource_group_members(group_id,resource_id,sort_order)
          SELECT $1::uuid,$2::uuid,$3::int WHERE EXISTS(SELECT 1 FROM resource_groups WHERE id=$1 AND owner_id IS NULL)
          ON CONFLICT(group_id,resource_id) DO UPDATE SET sort_order=EXCLUDED.sort_order
          WHERE EXISTS(SELECT 1 FROM resource_groups WHERE id=$1 AND owner_id IS NULL)`, [id,deterministicUuid(`resource:${key}`),memberOrder]);
      }
    }

    for (const a of activities) {
      const targetId = deterministicUuid(a.sourceKey);
      const coverMediaId = await ensureMediaAsset(a.coverUrl);
      await dbClient.query(
        `INSERT INTO activities (id, owner_id, kind, title, description, template_key, config, schema_version, visibility, version, cover_media_id)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, 1, $9)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           template_key = EXCLUDED.template_key,
           config = EXCLUDED.config,
           visibility = EXCLUDED.visibility,
           cover_media_id = EXCLUDED.cover_media_id`,
        [
          targetId,
          a.kind,
          a.title,
          a.description || '',
          a.templateKey,
          JSON.stringify(a.config || {}),
          a.schemaVersion || 1,
          a.visibility || 'published',
          coverMediaId,
        ]
      );
      for (const slug of a.topicSlugs || []) {
        const topicId = topicIdBySlug.get(slug);
        if (topicId) {
          await dbClient.query(
            `INSERT INTO activity_topics (activity_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [targetId, topicId]
          );
        }
      }
    }

    for (const m of models3d) {
      const targetId = deterministicUuid(m.sourceKey);
      const coverMediaId = await ensureMediaAsset(m.coverUrl);
      await dbClient.query(
        `INSERT INTO models_3d (id, owner_id, provider, model_uid, canonical_url, title, description, cover_media_id, visibility, version, attribution)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, 1, $9)
         ON CONFLICT (id) DO UPDATE SET
           model_uid = EXCLUDED.model_uid,
           canonical_url = EXCLUDED.canonical_url,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           cover_media_id = EXCLUDED.cover_media_id,
           visibility = EXCLUDED.visibility,
           attribution = EXCLUDED.attribution`,
        [
          targetId,
          m.provider || 'sketchfab',
          m.modelUid,
          m.canonicalUrl,
          m.title,
          m.description || '',
          coverMediaId,
          m.visibility || 'published',
          JSON.stringify({ ...(m.attribution || {}), narrationText: m.narrationText || '' }),
        ]
      );
      for (const slug of m.topicSlugs || []) {
        const topicId = topicIdBySlug.get(slug);
        if (topicId) {
          await dbClient.query(
            `INSERT INTO model_topics (model_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [targetId, topicId]
          );
        }
      }
    }

    let actualTeacherId: string | null=null;
    if(mode==='demo' && data.demoFixtures?.teacherUser){
      const teacher=data.demoFixtures.teacherUser;
      const portraitId=await ensureMediaAsset('/assets/generated/profile/teacher-linh-portrait.png');
      await dbClient.query(`INSERT INTO teachers(id,email,password_hash,display_name,status,avatar_media_id) VALUES($1,$2,$3,$4,'active',$5) ON CONFLICT(email) DO NOTHING`,[deterministicUuid(teacher.sourceKey),teacher.email.toLowerCase(),hashSync('daiduong2026'),teacher.displayName,portraitId]);
      actualTeacherId=(await dbClient.query('SELECT id FROM teachers WHERE email=$1',[teacher.email.toLowerCase()])).rows[0].id;
      // The demo library belongs to its teacher. Keep existing IDs/media/links and never
      // transfer records already owned by another account or overwrite authored edits.
      await dbClient.query('UPDATE resources SET owner_id=$1 WHERE owner_id IS NULL AND id=ANY($2::uuid[])',
        [actualTeacherId,resources.map((r:any)=>deterministicUuid(r.sourceKey))]);
      await dbClient.query('UPDATE resource_groups SET owner_id=$1 WHERE owner_id IS NULL AND id=ANY($2::uuid[])',
        [actualTeacherId,INITIAL_RESOURCE_GROUPS.map(g=>deterministicUuid(`resource-group:${g.key}`))]);
    }
    for (const [order, group] of INITIAL_INTERACTIVE_GROUPS.entries()) {
      const id = deterministicUuid(`interactive-group:${group.key}`);
      const coverMediaId = await ensureMediaAsset(group.cover);
      await dbClient.query(`INSERT INTO interactive_groups(id,owner_id,title,cover_media_id,visibility,sort_order) VALUES($1,NULL,$2,$3,'published',$4)
        ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,cover_media_id=EXCLUDED.cover_media_id,sort_order=EXCLUDED.sort_order WHERE interactive_groups.owner_id IS NULL`,[id,group.title,coverMediaId,order]);
      for (const key of group.activities) if (activities.some((activity: any) => activity.sourceKey === `activity:${key}`)) await dbClient.query('INSERT INTO interactive_group_members(group_id,activity_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,deterministicUuid(`activity:${key}`)]);
      for (const key of group.models) if (models3d.some((model: any) => model.sourceKey === `model:${key}`)) await dbClient.query('INSERT INTO interactive_group_members(group_id,model_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,deterministicUuid(`model:${key}`)]);
    }

    for (const ct of creativeTemplates) {
      const targetId = deterministicUuid(ct.sourceKey);
      const mediaId = await ensureMediaAsset(ct.previewUrl);
      await dbClient.query(
        `INSERT INTO creative_templates (id, owner_id, kind, title, payload, schema_version, media_id, visibility, version)
         VALUES ($1, $8, $2, $3, $4, $5, $6, $7, 1)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           payload = EXCLUDED.payload,
           media_id = EXCLUDED.media_id,
           visibility = EXCLUDED.visibility WHERE creative_templates.owner_id IS NULL`,
        [
          targetId,
          ct.kind,
          ct.title,
          JSON.stringify(ct.payload || {}),
          ct.schemaVersion || 1,
          mediaId,
          ct.visibility || 'published',
          ct.demoOwned ? actualTeacherId : null,
        ]
      );
      for (const slug of ct.topicSlugs || []) {
        const topicId = topicIdBySlug.get(slug);
        if (topicId) {
          await dbClient.query(
            `INSERT INTO creative_template_topics (template_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [targetId, topicId]
          );
        }
      }
    }

    for (const cm of creativeMaterials) {
      const targetId = deterministicUuid(cm.sourceKey);
      const mediaId = await ensureMediaAsset(cm.mediaUrl);
      await dbClient.query(
        `INSERT INTO creative_materials (id, owner_id, kind, title, payload, media_id, visibility, version)
         VALUES ($1, $7, $2, $3, $4, $5, $6, 1)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           payload = EXCLUDED.payload,
           media_id = EXCLUDED.media_id,
           visibility = EXCLUDED.visibility WHERE creative_materials.owner_id IS NULL`,
        [targetId, cm.kind, cm.title, JSON.stringify(cm.payload || {}), mediaId, cm.visibility || 'published',cm.demoOwned ? actualTeacherId : null]
      );
    }

    for (const ct of creativeTemplates) {
      const templateId=deterministicUuid(ct.sourceKey);
      if(ct.demoOwned && (await dbClient.query('SELECT version,edit_version FROM creative_templates WHERE id=$1',[templateId])).rows.some(r=>r.version>1||r.edit_version>1))continue;
      await dbClient.query("DELETE FROM creative_template_materials WHERE template_id=$1 AND revision='published'",[templateId]);
      for(const materialId of ct.payload?.materialIds || []) await dbClient.query("INSERT INTO creative_template_materials(template_id,material_id,revision) VALUES($1,$2,'published') ON CONFLICT DO NOTHING",[templateId,materialId]);
    }

if(mode==='demo'&&data.demoFixtures){
      for(const art of data.demoFixtures.artworks||[]){
        const id=deterministicUuid(art.sourceKey),mediaId=await ensureMediaAsset(art.previewUrl);
        await dbClient.query(`INSERT INTO artworks(id,owner_id,author_name,author_avatar_key,title,kind,source_media_id,preview_media_id,scene_payload,version,created_at)
          VALUES($1,$2,$3,$4,$5,$6,$7,$7,$8,1,$9) ON CONFLICT(id) DO NOTHING`,[id,actualTeacherId,art.authorName,art.authorAvatarKey,art.title,art.kind,mediaId,art.scenePayload?JSON.stringify(art.scenePayload):null,art.createdAt||new Date().toISOString()]);
        if(art.note)await dbClient.query('INSERT INTO artwork_notes(artwork_id,teacher_id,note) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[id,actualTeacherId,art.note]);
      }
    }

    for (const rec of mappings) {
      await upsertSeedMapping(rec);
    }

    await dbClient.query('COMMIT');
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  }

  return result;
}
