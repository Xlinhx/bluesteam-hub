export type Classroom = {
  id:string; school_id:string; year_id:string; school:string; year:string; name:string;
  age_group:string; archived:boolean; invite_code:string; invite_expires_at:string;
  class_number?:string; requires_approval?:boolean;
  canManage?:boolean; teacherRole?:'lead'|'assistant'|'owner'; start_date:string|null; end_date:string|null;
};

export type ClassTeacher = {
  id:string; name:string; role:'lead'|'assistant'; avatar_key:string|null; avatar_media_id:string|null;
};

export type Member = {
  id:string; learner_id:string; name:string; avatar_key?:string; student_number:string;
  status:'active'|'pending'|'ended'|'rejected'; requested_at:string; joined_at:string|null;
  context_id:string|null; transfer_to_class_id:string|null;
};

export type ClassroomMutation = (path:string,data:unknown,method?:string,selectCreatedClass?:boolean)=>Promise<{id?:string}|false>;

export const rosterDate = new Intl.DateTimeFormat('vi-VN',{
  day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Ho_Chi_Minh',
});

export function studentCode(member: Member) {
  return member.student_number == null ? '—' : 'HS-'+String(member.student_number).padStart(3,'0');
}

export function matchesStudent(member:Member,query:string) {
  const normalize = (value:string)=>value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/g,'d');
  const text = normalize(query.trim());
  const code = (value:string)=>value.replace(/[-\s]/g,'');
  return normalize(member.name).includes(text) || code(normalize(studentCode(member))).includes(code(text));
}
