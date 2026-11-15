import type { DatabaseService } from '../../database/database.service.js';
import { profileBadgeCatalog, type ProfileRecord } from '@bluesteam/contracts';

type ClassEvent = Omit<ProfileRecord, 'at'> & { learner_id:string; name:string; at:Date };
type ClassBadge = { learner_id:string; badge_id:string; rule_version:number; at:Date };

export async function readClassEvidence(db:DatabaseService,classId:string) {
  const [{ rows }, { rows:resources }, { rows:grants }] = await Promise.all([
    db.query<ClassEvent>(`WITH raw_events AS (
    SELECT
      e.learner_id,l.display_name AS name,'explore' AS family,lower(regexp_replace(trim(i.body->>'title'),'[[:space:]]+',' ','g')) AS id,
      i.body->>'title' AS title,i.body->'images'->>0 AS image,s.studied_at AS at
    FROM class_enrollments e JOIN learners l ON l.id=e.learner_id
    JOIN learner_studied_species s ON s.learner_id=e.learner_id AND s.context_id=e.context_id
    JOIN learner_catalog_active a ON a.singleton JOIN learner_catalog_items i ON i.version=a.version AND i.id=s.organism_id AND i.kind='species'
    WHERE e.class_id=$1 AND e.status='active'
    UNION ALL
    SELECT e.learner_id,l.display_name,'interact',r.content_id::text,
      r.snapshot->>'title',r.snapshot->>'coverUrl',i.received_at
    FROM class_enrollments e JOIN learners l ON l.id=e.learner_id
    JOIN interactive_usage_runs r ON r.learner_id=e.learner_id AND r.study_context_id=e.context_id AND r.kind='game'
    JOIN interactive_usage_interactions i ON i.run_id=r.id WHERE e.class_id=$1 AND e.status='active'
    UNION ALL
    SELECT
      e.learner_id,l.display_name,'create',concat(s.session_id,':',s.participant_id,':',s.client_submission_id),
      CASE WHEN s.kind='scan' THEN 'Tranh quét' ELSE 'Sa bàn đại dương' END,s.preview,s.created_at
    FROM class_enrollments e JOIN learners l ON l.id=e.learner_id
    JOIN creative_submissions s ON s.learner_id=e.learner_id AND s.study_context_id=e.context_id
    WHERE e.class_id=$1 AND e.status='active'
  ) , events AS (SELECT DISTINCT ON(learner_id,family,id) * FROM raw_events ORDER BY learner_id,family,id,at ASC)
  SELECT * FROM events ORDER BY at DESC,family,id,learner_id`,[classId]),
    db.query(`SELECT e.learner_id,concat(v.resource_kind,':',v.resource_id) AS id,v.title,v.opened_at AS at
      FROM class_enrollments e JOIN learner_resource_views v
        ON v.learner_id=e.learner_id AND v.context_id=e.context_id
      WHERE e.class_id=$1 AND e.status='active'
      ORDER BY v.opened_at DESC,v.resource_kind,v.resource_id,e.learner_id`, [classId]),
    db.query<ClassBadge>(`SELECT e.learner_id,g.badge_id,g.rule_version,g.earned_at AS at
      FROM class_enrollments e JOIN learner_badge_grants g
        ON g.learner_id=e.learner_id AND g.context_id=e.context_id
      WHERE e.class_id=$1 AND e.status='active'`, [classId]),
  ]);
  // A stored grant survives catalog changes. For the current rules, also count
  // the milestones reached before a learner has opened their badge collection.
  const key = (learner:string, badge:string, version:number) => `${learner}:${badge}:${version}`;
  const badges = new Map(grants.map(grant=>[key(grant.learner_id,grant.badge_id,grant.rule_version),grant]));
  const familyCounts = new Map<string,number>();
  for (const event of [...rows].reverse()) {
    const familyKey = `${event.learner_id}:${event.family}`;
    const count = (familyCounts.get(familyKey) ?? 0) + 1;
    familyCounts.set(familyKey,count);
    for (const rule of profileBadgeCatalog) {
      if (rule.family!==event.family || rule.target!==count) continue;
      const grantKey = key(event.learner_id,rule.id,1);
      if (!badges.has(grantKey)) badges.set(grantKey,{learner_id:event.learner_id,badge_id:rule.id,rule_version:1,at:event.at});
    }
  }
  const unique = (family:string) => [...new Map(rows.filter(row=>row.family===family).map(row=>[row.id,row])).values()];
  return { species:unique('explore'), games:unique('interact'), creations:unique('create'),
    activeLearners:new Set(rows.map(row=>row.learner_id)).size,
    resources, badges:[...badges.values()],
    timeline:rows.map(row=>({...row,contentTitle:row.title,title:`${row.name} · ${row.title}`})) };
}
