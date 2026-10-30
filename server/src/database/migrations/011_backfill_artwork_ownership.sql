UPDATE artworks a SET owner_id = r.teacher_id,
  author_name = p.alias, author_avatar_key = p.avatar_key
FROM rooms r, room_participants p
WHERE a.room_id = r.id AND p.id = a.participant_id AND p.room_id = r.id;
