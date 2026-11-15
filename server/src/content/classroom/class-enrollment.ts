import type pg from 'pg';

export type EnrollmentClass = { id: string; school: string; year: string; name: string };

export async function activateEnrollment(client: pg.PoolClient, classroom: EnrollmentClass, learner: string) {
  const { rows: [context] } = await client.query<{ id: string }>(
    `INSERT INTO learner_study_contexts(learner_id,school,school_year,class_name,class_id)
     VALUES($1,$2,$3,$4,$5) ON CONFLICT(learner_id,class_id) WHERE class_id IS NOT NULL
     DO UPDATE SET school=EXCLUDED.school,school_year=EXCLUDED.school_year,class_name=EXCLUDED.class_name RETURNING id`,
    [learner,classroom.school,classroom.year,classroom.name,classroom.id]);
  await client.query(
    `INSERT INTO class_enrollments(class_id,learner_id,status,joined_at,context_id) VALUES($1,$2,'active',now(),$3)
     ON CONFLICT(class_id,learner_id) DO UPDATE SET status='active',joined_at=now(),ended_at=NULL,
     transfer_to_class_id=NULL,context_id=EXCLUDED.context_id WHERE class_enrollments.status<>'active'`,
    [classroom.id,learner,context.id]);
  await client.query(
    'INSERT INTO learner_personal_information(learner_id,context_id) VALUES($1,$2) ON CONFLICT(learner_id) DO NOTHING',
    [learner,context.id]);
  return context.id;
}
