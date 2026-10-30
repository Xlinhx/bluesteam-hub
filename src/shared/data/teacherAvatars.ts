import { ANIMAL_AVATARS } from './categoryArtworkMap';

// Keep persisted species keys compatible; each role owns its portrait artwork.
export const TEACHER_AVATARS = ANIMAL_AVATARS.map(avatar => {
  const imageSrc = `/assets/generated/profile/teacher/avatar-${avatar.key}.webp`;
  return { ...avatar, imageSrc, imagePath: imageSrc };
});

export function getTeacherAvatar(key?: string | null) {
  return TEACHER_AVATARS.find(avatar => avatar.key === (key === 'octo' ? 'octopus' : key)) ?? TEACHER_AVATARS[0];
}
