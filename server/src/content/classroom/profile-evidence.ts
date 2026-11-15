import type { DatabaseService } from '../../database/database.service.js';
import { profileBadgeCatalog, type ProfileEvidence, type ProfileRecord, type ProfileBadge, type ProfileBadgeRule } from '@bluesteam/contracts';

export async function readProfileRecords(db: DatabaseService, learner: string, context: string) {
  const [species, games, creations] = await Promise.all([
    db.query(`SELECT DISTINCT ON (lower(regexp_replace(trim(i.body->>'title'),'[[:space:]]+',' ','g')))
      s.organism_id AS id,i.body->>'title' AS title,i.body->'images'->>0 AS image,s.studied_at AS at,'explore' AS family,
      '/learning?view=organism&selected='||i.id||'&zone='||i.zone||'&axis='||CASE WHEN i.zone IN ('upper','middle','deep','abyss','hadal') THEN 'vertical' ELSE 'horizontal' END AS href
      FROM learner_studied_species s JOIN learner_catalog_active a ON a.singleton
      JOIN learner_catalog_items i ON i.version=a.version AND i.id=s.organism_id AND i.kind='species'
      WHERE s.learner_id=$1 AND s.context_id=$2 ORDER BY lower(regexp_replace(trim(i.body->>'title'),'[[:space:]]+',' ','g')),s.studied_at`, [learner,context]),
    db.query(`SELECT DISTINCT ON (r.content_id) r.content_id AS id,r.snapshot->>'title' AS title,
      r.snapshot->>'coverUrl' AS image,i.received_at AS at,'interact' AS family,'/interactive/activities/'||r.content_id AS href
      FROM interactive_usage_runs r JOIN interactive_usage_interactions i ON i.run_id=r.id
      WHERE r.learner_id=$1 AND r.study_context_id=$2 AND r.kind='game'
      ORDER BY r.content_id,i.received_at,i.id`, [learner,context]),
    db.query(`SELECT DISTINCT ON (s.session_id,s.participant_id,s.client_submission_id)
      s.id::text AS id,CASE WHEN s.kind='scan' THEN 'Tranh quét' ELSE 'Sa bàn đại dương' END AS title,
      s.preview AS image,s.created_at AS at,'create' AS family FROM creative_submissions s
      WHERE s.learner_id=$1 AND s.study_context_id=$2
      ORDER BY s.session_id,s.participant_id,s.client_submission_id,s.created_at,s.id`, [learner,context]),
  ]);
  const chronological = (rows: ProfileRecord[]) => rows.map(row => ({ ...row, at: new Date(row.at).toISOString() }))
    .sort((a,b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
  const groups = { explore: chronological(species.rows), interact: chronological(games.rows), create: chronological(creations.rows) };
  const timeline = [...groups.explore,...groups.interact,...groups.create].sort((a,b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id));
  return { groups, timeline };
}

/** Source events stay factual. Badge rules never imply mastery or catalog completion. */
export async function readProfileEvidence(db: DatabaseService, learner: string, context: string): Promise<ProfileEvidence> {
  const { groups, timeline } = await readProfileRecords(db, learner, context);
  // A unique grant and immutable rule/evidence snapshot make refreshes and retries idempotent.
  for (const rule of profileBadgeCatalog) {
    const evidence = groups[rule.family].slice(0,rule.target);
    if (evidence.length === rule.target) await db.query(`INSERT INTO learner_badge_grants
      (learner_id,context_id,badge_id,rule_version,rule_snapshot,evidence,earned_at)
      VALUES($1,$2,$3,1,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [learner,context,rule.id,rule,JSON.stringify(evidence.map(item => ({ id:item.id,at:item.at,title:item.title }))),evidence.at(-1)!.at]);
  }
  type Grant = { badge_id:string; rule_version:number; rule_snapshot:ProfileBadgeRule; earned_at:Date; evidence:{id:string;at:string;title?:string}[] };
  const {rows: grants} = await db.query<Grant>(
    'SELECT badge_id,rule_version,rule_snapshot,earned_at,evidence FROM learner_badge_grants WHERE learner_id=$1 AND context_id=$2 ORDER BY rule_version,earned_at',
    [learner,context],
  );
  const catalog = new Map<string,ProfileBadgeRule>(profileBadgeCatalog.map(rule=>[rule.id,rule]));
  const badges: ProfileBadge[] = grants.map(grant=>{
    const rule = grant.rule_snapshot;
    const records = groups[rule.family];
    return {
      ...rule,
      id: grant.rule_version === 1 ? grant.badge_id : grant.badge_id+':v'+grant.rule_version,
      artwork: rule.artwork || catalog.get(grant.badge_id)?.artwork,
      count: Math.max(rule.target,records.length),
      version: grant.rule_version,
      earnedAt: grant.earned_at.toISOString(),
      evidence: grant.evidence.map(item=>{
        const record=records.find(value=>value.id===item.id);
        return {...item,title:item.title||record?.title||'Nội dung không còn công bố',href:record?.href};
      }),
    };
  });
  const grantedIds = new Set(grants.filter(grant=>grant.rule_version===1).map(grant=>grant.badge_id));
  for (const rule of profileBadgeCatalog) {
    if (!grantedIds.has(rule.id)) badges.push({...rule,count:groups[rule.family].length,version:1,earnedAt:null});
  }
  badges.sort((a,b)=>a.family.localeCompare(b.family)||a.target-b.target||a.version-b.version);
  return { species:groups.explore, games:groups.interact, creations:groups.create, badges, timeline };
}
