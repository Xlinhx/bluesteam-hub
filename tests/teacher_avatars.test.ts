import { describe, expect, it } from 'vitest';
import { ANIMAL_AVATARS, getAnimalAvatar } from '../src/shared/data/categoryArtworkMap';
import { TEACHER_AVATARS, getTeacherAvatar } from '../src/shared/data/teacherAvatars';

describe('Role-specific ocean portraits', () => {
  it('preserves all saved keys while giving teachers a separate illustration for every choice', () => {
    expect(TEACHER_AVATARS.map(a => a.key)).toEqual(ANIMAL_AVATARS.map(a => a.key));
    for (const avatar of TEACHER_AVATARS) {
      expect(avatar.imageSrc).not.toBe(getAnimalAvatar(avatar.key).imageSrc);
      expect(getTeacherAvatar(avatar.key)).toEqual(avatar);
    }
  });
  it('resolves legacy aliases and unknown keys without changing learner artwork', () => {
    expect(getTeacherAvatar('octo').key).toBe('octopus');
    expect(getTeacherAvatar(null).key).toBe('turtle');
    expect(getAnimalAvatar('turtle').imageSrc).toBe('/assets/generated/profile/avatar-turtle.webp');
  });
});
