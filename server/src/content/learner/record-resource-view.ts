import type { DatabaseService } from '../../database/database.service.js';

export async function recordResourceView(
  db: DatabaseService, learnerId: string, kind: 'source' | 'published', id: string,
) {
  const resource = kind === 'source'
    ? `SELECT i.id, i.body->>'title' AS title
       FROM learner_catalog_items i JOIN learner_catalog_active a ON a.version=i.version
       WHERE i.id=$2`
    : `SELECT id::text, title FROM resources WHERE id=$2::uuid AND visibility='published'`;
  await db.query(`INSERT INTO learner_resource_views (learner_id,context_id,resource_kind,resource_id,title)
    SELECT $1,scope.id,$3,resource.id,resource.title
    FROM (${resource}) resource
    CROSS JOIN (SELECT learner_recording_context($1) AS id) scope
    WHERE scope.id IS NOT NULL AND resource.title IS NOT NULL
    ON CONFLICT DO NOTHING`, [learnerId, id, kind]);
}
