import { profileBadgeCatalog } from '@bluesteam/contracts';
import type { DatabaseService } from '../../database/database.service.js';
import { readProfileRecords } from '../classroom/profile-evidence.js';

export async function readLearnerProfileJourney(db: DatabaseService, learner: string, context: string | null) {
  if (!context) return { species: [], games: [], creations: [], timeline: [], resourceCount: 0, achievementCount: 0 };
  const [{ groups, timeline }, resources, grants] = await Promise.all([
    readProfileRecords(db, learner, context),
    db.query<{ count: number }>('SELECT count(*)::int AS count FROM learner_resource_views WHERE learner_id=$1 AND context_id=$2', [learner, context]),
    db.query<{ badge_id: string }>('SELECT DISTINCT badge_id FROM learner_badge_grants WHERE learner_id=$1 AND context_id=$2', [learner, context]),
  ]);
  const achievements = new Set(grants.rows.map(grant => grant.badge_id));
  for (const rule of profileBadgeCatalog) {
    if (groups[rule.family].length >= rule.target) achievements.add(rule.id);
  }
  return { species: groups.explore, games: groups.interact, creations: groups.create, timeline,
    resourceCount: resources.rows[0].count, achievementCount: achievements.size };
}
