import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { DB_POOL } from '../database/database.module';

export interface ArtworkDto {
  id: string;
  participantAlias: string;
  participantAvatarKey: string;
  kind: 'drawing' | 'habitat';
  title: string;
  sourceMediaId: string;
  previewMediaId: string;
  previewUrl: string;
  sourceUrl: string;
  scenePayload: Record<string, unknown> | null;
  version: number;
  teacherNote: string | null;
  createdAt: string;
}

@Injectable()
export class ArtworksRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  private mapRow(row: Record<string, any>, includeNote = true): ArtworkDto {
    const previewStorageKey = String(row.preview_storage_key || '');
    const sourceStorageKey = String(row.source_storage_key || '');
    const previewUrl = previewStorageKey.startsWith('/assets/')
      ? previewStorageKey
      : `/api/v1/media/${row.preview_media_id}`;
    const sourceUrl = sourceStorageKey.startsWith('/assets/')
      ? sourceStorageKey
      : `/api/v1/media/${row.source_media_id}`;

    return {
      id: String(row.id),
      participantAlias: String(row.participant_alias || 'Bé'),
      participantAvatarKey: String(row.participant_avatar_key || 'turtle'),
      kind: row.kind === 'habitat' ? 'habitat' : 'drawing',
      title: String(row.title || ''),
      sourceMediaId: String(row.source_media_id),
      previewMediaId: String(row.preview_media_id),
      previewUrl,
      sourceUrl,
      scenePayload: (row.scene_payload as Record<string, unknown>) || null,
      version: Number(row.version || 1),
      teacherNote: includeNote && row.teacher_note != null ? String(row.teacher_note) : null,
      createdAt: new Date(String(row.created_at)).toISOString(),
    };
  }

  async findByIdWithOwnership(
    artworkId: string,
  ): Promise<{ artwork: ArtworkDto; teacherId: string } | null> {
    const res = await this.pool.query(
      `SELECT a.*,
              a.owner_id AS artwork_owner_id,
              a.author_name AS participant_alias,
              a.author_avatar_key AS participant_avatar_key,
              mp.storage_key AS preview_storage_key,
              ms.storage_key AS source_storage_key,
              n.note AS teacher_note
         FROM artworks a
         LEFT JOIN media_assets mp ON mp.id = a.preview_media_id
         LEFT JOIN media_assets ms ON ms.id = a.source_media_id
         LEFT JOIN artwork_notes n ON n.artwork_id = a.id
        WHERE a.id = $1
        LIMIT 1`,
      [artworkId],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      artwork: this.mapRow(row, true),
      teacherId: String(row.artwork_owner_id),
    };
  }

  async listTeacherArtworks(params: {
    teacherId: string;
    kind?: 'drawing' | 'habitat';
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ArtworkDto[]; total: number }> {
    const conditions: string[] = ['a.owner_id = $1'];
    const values: unknown[] = [params.teacherId];
    let idx = 2;

    if (params.kind) {
      conditions.push(`a.kind = $${idx++}`);
      values.push(params.kind);
    }
    if (params.q && params.q.trim()) {
      conditions.push(`(a.title ILIKE $${idx} OR a.author_name ILIKE $${idx})`);
      values.push(`%${params.q.trim()}%`);
      idx++;
    }

    const whereClause = conditions.join(' AND ');
    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int AS total
         FROM artworks a
        WHERE ${whereClause}`,
      values,
    );
    const total = Number(countRes.rows[0]?.total || 0);

    const limit = Math.min(Math.max(Number(params.limit || 20), 1), 100);
    const offset = Math.max(Number(params.offset || 0), 0);

    const listRes = await this.pool.query(
      `SELECT a.*,
              a.author_name AS participant_alias,
              a.author_avatar_key AS participant_avatar_key,
              mp.storage_key AS preview_storage_key,
              ms.storage_key AS source_storage_key,
              n.note AS teacher_note
         FROM artworks a
         LEFT JOIN media_assets mp ON mp.id = a.preview_media_id
         LEFT JOIN media_assets ms ON ms.id = a.source_media_id
         LEFT JOIN artwork_notes n ON n.artwork_id = a.id
        WHERE ${whereClause}
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return {
      items: listRes.rows.map((row) => this.mapRow(row, true)),
      total,
    };
  }

  async upsertTeacherNote(params: {
    artworkId: string;
    teacherId: string;
    note: string;
  }): Promise<string> {
    await this.pool.query(
      `INSERT INTO artwork_notes (artwork_id, teacher_id, note, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (artwork_id)
       DO UPDATE SET note = EXCLUDED.note, teacher_id = EXCLUDED.teacher_id, updated_at = NOW()`,
      [params.artworkId, params.teacherId, params.note],
    );
    return params.note;
  }
}
