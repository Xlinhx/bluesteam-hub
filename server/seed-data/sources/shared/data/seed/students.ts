export interface MockStudent {
  id: string;
  name: string;
  avatarKey: 'nautilus' | 'wave' | 'mineral' | 'kelp' | 'crystal' | 'diatom' | 'anemone' | 'urchin';
  symbolName: string;
  grade: string;
  recentActiveUnitId: string;
}

export const SEED_STUDENTS: MockStudent[] = [
  {
    id: 'student-elena',
    name: 'Elena S.',
    avatarKey: 'nautilus',
    symbolName: 'Spiral Nautilus',
    grade: 'Kindergarten',
    recentActiveUnitId: 'unit-ocean-depth',
  },
  {
    id: 'student-marcus',
    name: 'Marcus T.',
    avatarKey: 'wave',
    symbolName: 'Crest Wave',
    grade: 'Kindergarten',
    recentActiveUnitId: 'unit-ocean-depth',
  },
  {
    id: 'student-kai',
    name: 'Kai R.',
    avatarKey: 'mineral',
    symbolName: 'Basalt Mineral',
    grade: 'Kindergarten',
    recentActiveUnitId: 'unit-sediment-movement',
  },
  {
    id: 'student-ananya',
    name: 'Ananya D.',
    avatarKey: 'kelp',
    symbolName: 'Deep Kelp',
    grade: 'Grade 1',
    recentActiveUnitId: 'unit-ocean-depth',
  },
  {
    id: 'student-lucas',
    name: 'Lucas V.',
    avatarKey: 'crystal',
    symbolName: 'Quartz Crystal',
    grade: 'Grade 1',
    recentActiveUnitId: 'unit-sediment-movement',
  },
  {
    id: 'student-zara',
    name: 'Zara M.',
    avatarKey: 'diatom',
    symbolName: 'Radiolarian Shell',
    grade: 'Kindergarten',
    recentActiveUnitId: 'unit-life-in-deep',
  },
  {
    id: 'student-noah',
    name: 'Noah B.',
    avatarKey: 'anemone',
    symbolName: 'Reef Anemone',
    grade: 'Grade 1',
    recentActiveUnitId: 'unit-ocean-depth',
  },
  {
    id: 'student-maya',
    name: 'Maya L.',
    avatarKey: 'urchin',
    symbolName: 'Slate Urchin',
    grade: 'Kindergarten',
    recentActiveUnitId: 'unit-ocean-sounds',
  },
];
