import { ANIMAL_AVATARS, getAnimalAvatar } from './categoryArtworkMap';

// Keep species keys and groups shared while giving teachers their own artwork.
export const TEACHER_AVATARS = ANIMAL_AVATARS.map(avatar => {
  const imageSrc = `/assets/generated/profile/teacher-3d/avatar-${avatar.key}.webp`;
  return { ...avatar, imageSrc, imagePath: imageSrc };
});

export function getTeacherAvatar(key?: string | null) {
  const species = getAnimalAvatar(key);
  return TEACHER_AVATARS.find(avatar => avatar.key === species.key) ?? TEACHER_AVATARS[0];
}
