import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type pg from 'pg';
import { deterministicUuid } from './import-seed.js';

type Narrated = { text: string; spokenText?: string; audio?: string };
type Entry = { id: string; title: string; group: string; images: string[]; file?: string; pages?: number[]; kind?: string; zone?: string;
  audio?: string; facts?: Narrated[] };
type Pack = { version: string; zones: { id: string; title: string; intro: string; spokenText?: string; audio?: string; inquiry?: Narrated }[];
  narration?: { welcome?: Narrated; worldIntros?: Record<string, Narrated> };
  species: Entry[]; resources: Entry[]; collections: Entry[];
  assets: Record<string, { sha256: string; bytes: number; textSha256?: string }> };

export function catalogSearch(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd').trim();
}

export function loadLearnerPack(archiveDir: string) {
  const raw = readFileSync(resolve(archiveDir, 'learner-ocean.json'));
  const pack = JSON.parse(raw.toString('utf8')) as Pack;
  const digest = (data: Buffer) => createHash('sha256').update(data).digest('hex');
  const zoneIds = new Set(pack.zones.map(zone => zone.id));
  const items = [
    ...pack.species.map(item => ({ ...item, kind: 'species' })),
    ...pack.collections.map(item => ({ ...item, kind: 'collection' })),
    ...pack.resources.map(item => ({ ...item, kind: item.kind ?? '' })),
  ];
  if (!/^ocean-v\d+$/.test(pack.version) || zoneIds.size !== pack.zones.length
    || new Set(items.map(item => item.id)).size !== items.length) throw new Error('Invalid learner pack identity');
  for (const [url, asset] of Object.entries(pack.assets)) {
    if (!/^\/assets\/learner-content\/v\d+\/(?:species|pdf|audio|video)\/[\w.-]+\.(webp|pdf|mp3|mp4)$/.test(url)) {
      throw new Error('Invalid learner asset path');
    }
    const bytes = readFileSync(resolve(archiveDir, '../../public', url.slice(1)));
    const fileType = url.split('.').at(-1);
    const valid = fileType === 'pdf' ? bytes.subarray(0, 5).toString() === '%PDF-'
      : fileType === 'webp' ? bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP'
      : fileType === 'mp4' ? bytes.subarray(4, 8).toString() === 'ftyp'
      : bytes.subarray(0, 3).toString() === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
    if (!valid || bytes.length !== asset.bytes || digest(bytes) !== asset.sha256) throw new Error('Invalid learner asset: ' + url);
  }
  const verifyNarration = ({ text, spokenText, audio }: Narrated) => {
    if (audio && (!audio.endsWith('.mp3') || pack.assets[audio]?.textSha256 !== digest(Buffer.from(spokenText ?? text)))) {
      throw new Error('Invalid narration binding: ' + audio);
    }
  };
  if (pack.narration?.welcome) verifyNarration(pack.narration.welcome);
  Object.values(pack.narration?.worldIntros ?? {}).forEach(verifyNarration);
  for (const zone of pack.zones) {
    verifyNarration({ text: `${zone.title}. ${zone.intro}`, spokenText:zone.spokenText, audio:zone.audio });
    if (zone.inquiry) verifyNarration(zone.inquiry);
  }
  for (const item of items) {
    if (!item.title || !item.kind || (['species','collection'].includes(item.kind) && !item.group)
      || (item.kind === 'species' && (!item.zone || !zoneIds.has(item.zone)))
      || [...item.images, ...(item.file ? [item.file] : [])].some(url => !Object.hasOwn(pack.assets, url))) {
      throw new Error('Invalid learner entry: ' + item.id);
    }
    verifyNarration({ text:item.title, audio:item.audio });
    item.facts?.forEach(verifyNarration);
  }
  return { pack, items, checksum: digest(raw) };
}

async function installFlashcards(client: pg.PoolClient, pack: Pack) {
  const mediaIds = new Map<string, string>();
  const groupIds = new Map<string, string>();
  const flashcards = pack.resources.filter(item => item.kind === 'flashcard');
  for (const [position, item] of flashcards.entries()) {
    const cover = item.images[0];
    let coverId = cover ? mediaIds.get(cover) : undefined;
    if (cover && !coverId) {
      const asset = pack.assets[cover];
      const media = await client.query<{ id: string }>(`
        INSERT INTO media_assets (id, storage_key, kind, mime_type, byte_size, sha256, status, original_filename)
        VALUES ($1,$2,'image','image/webp',$3,$4,'ready',$5)
        ON CONFLICT (storage_key) DO UPDATE SET storage_key=EXCLUDED.storage_key RETURNING id`,
        [deterministicUuid(`media:${cover}`), cover, asset.bytes, asset.sha256, cover.split('/').at(-1)]);
      coverId = media.rows[0].id;
      mediaIds.set(cover, coverId);
    }
    const sourceKey = `resource:${item.id}`;
    const id = deterministicUuid(sourceKey);
    const content = JSON.stringify({ albumUrls: item.images, sourcePdfUrl: item.file, sourcePages: item.pages });
    await client.query(`
      INSERT INTO resources (id, kind, title, cover_media_id, media_id, content, visibility, updated_at)
      VALUES ($1,'flashcard',$2,$3,$3,$4,'published',now()-$5::integer * interval '1 microsecond')
      ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,cover_media_id=EXCLUDED.cover_media_id,
        media_id=EXCLUDED.media_id,content=EXCLUDED.content
      WHERE resources.owner_id IS NULL AND (resources.title,resources.cover_media_id,resources.content)
        IS DISTINCT FROM (EXCLUDED.title,EXCLUDED.cover_media_id,EXCLUDED.content)`,
      [id, item.title, coverId ?? null, content, position]);
    await client.query(`
      INSERT INTO seed_mappings (source_key,target_type,target_id,source_checksum)
      VALUES ($1,'resource',$2,$3) ON CONFLICT (source_key) DO NOTHING`,
      [sourceKey, id, createHash('sha256').update(content).digest('hex')]);

    const title = item.group?.trim();
    if (!title) continue;
    let groupId = groupIds.get(title);
    if (!groupId) {
      groupId = deterministicUuid(`learner-pack:resource-group:${title}`);
      await client.query(`
        INSERT INTO resource_groups (id,title,cover_media_id,visibility,sort_order)
        VALUES ($1,$2,$3,'published',-1) ON CONFLICT (id) DO NOTHING`, [groupId, title, coverId ?? null]);
      groupIds.set(title, groupId);
    }
    await client.query(`
      INSERT INTO resource_group_members (group_id,resource_id,sort_order)
      VALUES ($1,$2,$3) ON CONFLICT (group_id,resource_id) DO NOTHING`, [groupId, id, position]);
  }
}

export async function installLearnerPack(pool: pg.Pool, archiveDir: string) {
  const { pack, items, checksum } = loadLearnerPack(archiveDir);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(80102027)');
    const existing = await client.query<{checksum: string}>('SELECT checksum FROM learner_catalog_versions WHERE version=$1', [pack.version]);
    if (existing.rows[0] && existing.rows[0].checksum !== checksum) throw new Error('Learner pack version has different bytes');
    if (!existing.rowCount) {
      await client.query('INSERT INTO learner_catalog_versions VALUES ($1,$2,$3)', [pack.version, checksum, JSON.stringify(pack.zones)]);
      await client.query(
        'INSERT INTO learner_catalog_items SELECT $1, id, kind, zone, group_name, search_name, position, body FROM jsonb_to_recordset($2::jsonb) AS records(id text, kind text, zone text, group_name text, search_name text, position integer, body jsonb)',
        [pack.version, JSON.stringify(items.map((item, position) => ({ id:item.id, kind:item.kind, zone:item.zone ?? '',
          group_name:item.group, search_name:catalogSearch(item.title), position, body:item })))],
      );
    }
    await installFlashcards(client, pack);
    await client.query('INSERT INTO learner_catalog_active VALUES (true,$1) ON CONFLICT (singleton) DO UPDATE SET version=EXCLUDED.version', [pack.version]);
    await client.query('COMMIT');
    return { version: pack.version, items: items.length, checksum };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
