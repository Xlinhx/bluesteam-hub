import { describe, expect, it } from 'vitest';
import { ANIMAL_AVATARS, getAnimalAvatar } from '../src/shared/data/categoryArtworkMap';
import { TEACHER_AVATARS, getTeacherAvatar } from '../src/shared/data/teacherAvatars';
import { ANIMAL_AVATAR_KEYS } from '@bluesteam/contracts';

describe('Role-specific aquatic animal portraits', () => {
  it('offers the same twenty species with a distinct teacher portrait for each', () => {
    expect(ANIMAL_AVATARS).toHaveLength(20);
    expect(ANIMAL_AVATARS.map(a => a.key)).toEqual([...ANIMAL_AVATAR_KEYS]);
    expect(TEACHER_AVATARS.map(a => a.key)).toEqual(ANIMAL_AVATARS.map(a => a.key));
    expect(new Set(TEACHER_AVATARS.map(a => a.imageSrc)).size).toBe(20);
    for (const avatar of TEACHER_AVATARS) {
      const learner = getAnimalAvatar(avatar.key);
      expect(avatar.imageSrc).not.toBe(learner.imageSrc);
      expect(avatar.imagePath).toBe(avatar.imageSrc);
      expect(avatar.group).toBe(learner.group);
      expect(getTeacherAvatar(avatar.key)).toEqual(avatar);
    }
  });
  it('resolves legacy aliases and unknown keys within the teacher catalog', () => {
    expect(getTeacherAvatar('octo').key).toBe('octopus');
    expect(getTeacherAvatar(null).key).toBe('turtle');
    expect(getAnimalAvatar('dog').key).toBe('otter');
    expect(getTeacherAvatar('fox').key).toBe('pufferfish');
    expect(getTeacherAvatar('dog')).toEqual(getTeacherAvatar('otter'));
    expect(getTeacherAvatar('unknown')).toEqual(getTeacherAvatar('turtle'));
    expect(ANIMAL_AVATARS.every(a => ['sea', 'shore', 'freshwater'].includes(a.group))).toBe(true);
    expect(ANIMAL_AVATARS.some(a => ['dog', 'cat', 'rabbit', 'bear', 'panda', 'tiger', 'lion', 'elephant', 'monkey', 'fox'].includes(a.key))).toBe(false);
    expect(getAnimalAvatar('turtle').imageSrc).toBe('/assets/generated/profile/chibi/avatar-turtle.webp');
  });
});
