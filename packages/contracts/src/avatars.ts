/** Persisted avatar keys shared by the account API and both role pickers. */
export const ANIMAL_AVATAR_KEYS = [
  'turtle', 'crab', 'clownfish', 'starfish', 'dolphin', 'octopus', 'seahorse', 'jellyfish',
  'shark', 'whale', 'seal', 'otter', 'stingray', 'pufferfish', 'shrimp', 'squid', 'duck', 'penguin', 'frog', 'crocodile',
] as const;

export type AnimalAvatarKey = typeof ANIMAL_AVATAR_KEYS[number];

/** Resolve earlier choices without exposing terrestrial animals in the new picker. */
export const AVATAR_KEY_ALIASES: Record<string, AnimalAvatarKey> = {
  octo: 'octopus', dog: 'otter', cat: 'seal', rabbit: 'frog', bear: 'whale',
  panda: 'penguin', tiger: 'shark', lion: 'crocodile', elephant: 'stingray', monkey: 'squid', fox: 'pufferfish',
};

// Old saved profiles remain accepted when updating another identity field.
export const PERSISTED_ANIMAL_AVATAR_KEYS = [
  ...ANIMAL_AVATAR_KEYS,
  'octo', 'dog', 'cat', 'rabbit', 'bear', 'panda', 'tiger', 'lion', 'elephant', 'monkey', 'fox',
] as const;
