export type RoleKind = 'learner' | 'teacher' | 'public';

export type LearnerNavKey = 'home' | 'resources' | 'interactive' | 'creative' | 'learning' | 'profile';
export type TeacherNavKey = 'overview' | 'resources' | 'learning' | 'interactive' | 'creative' | 'profile';
export type InteractiveCategoryKind = 'model3d' | 'game' | 'simulation' | 'scenario';

export type OceanTopicKey = 'creatures' | 'coral' | 'layers' | 'conservation' | 'species' | 'habitats' | 'environment';
export type TopicKey = 'all' | 'species' | 'creatures' | 'habitats' | 'environment' | 'conservation' | 'coral' | 'layers';
export type TopicFilterKey = 'all' | 'creatures' | 'habitats' | 'conservation' | 'species';

import { AVATAR_KEY_ALIASES, type AnimalAvatarKey } from '@bluesteam/contracts';
export type { AnimalAvatarKey } from '@bluesteam/contracts';
export type AvatarGroup = 'sea' | 'shore' | 'freshwater';

export interface CategoryArtworkSpec {
  id: string;
  learnerTitle: string;
  learnerDescription: string;
  learnerCta: string;
  learnerRoute: string;
  teacherTitle: string;
  teacherDescription: string;
  teacherCta: string;
  teacherSecondaryCta?: string;
  teacherRoute: string;
  cutoutSrc: string;
  fallbackCutoutSrc: string;
  imageUrl: string;
  image: string;
  alt: string;
  accentGradient: string;
  badgeColor: string;
  subFormats: string[];
}

const BASE_CATEGORY_ARTWORK_MAP: Record<
  'resources' | 'interactive' | 'creative',
  CategoryArtworkSpec
> = {
  resources: {
    id: 'resources',
    learnerTitle: 'Học liệu đại dương',
    learnerDescription: 'Xem thẻ hình, video và tranh in về các loài biển quanh em.',
    learnerCta: 'Mở học liệu',
    learnerRoute: '/resources',
    teacherTitle: 'Học liệu đại dương',
    teacherDescription: 'Thẻ hình, video và tranh in để cô dùng trong giờ học.',
    teacherCta: 'Quản lý học liệu',
    teacherSecondaryCta: 'Tạo học liệu',
    teacherRoute: '/teacher/resources',
    cutoutSrc: '/assets/generated/creatures/turtle_isolated.png',
    fallbackCutoutSrc: '/assets/generated/creatures/turtle_isolated.png',
    imageUrl: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    image: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    alt: 'Cá hề trong rạn san hô',
    accentGradient: 'from-[#E4F4F8] via-[#D2EEF5] to-[#BCE4EF]',
    badgeColor: '#17657A',
    subFormats: ['Thẻ hình', 'Video', 'Tranh in'],
  },
  interactive: {
    id: 'interactive',
    learnerTitle: 'Trò chơi & Khám phá',
    learnerDescription: 'Chơi trò chơi, xem mô hình 3D và thử các tình huống dưới biển.',
    learnerCta: 'Vào chơi ngay',
    learnerRoute: '/interactive',
    teacherTitle: 'Trò chơi & Khám phá',
    teacherDescription: 'Trò chơi, mô hình 3D và tình huống theo chủ đề biển.',
    teacherCta: 'Quản lý hoạt động',
    teacherSecondaryCta: 'Tạo trò chơi',
    teacherRoute: '/teacher/interactive',
    cutoutSrc: '/assets/generated/creatures/clownfish_isolated.png',
    fallbackCutoutSrc: '/assets/generated/creatures/clownfish_isolated.png',
    imageUrl: '/assets/generated/creatures/sea_turtle_card.jpg',
    image: '/assets/generated/creatures/sea_turtle_card.jpg',
    alt: 'Rùa biển bơi trong đại dương',
    accentGradient: 'from-[#E8F6F3] via-[#D4EFEA] to-[#BBE5DD]',
    badgeColor: '#0E7490',
    subFormats: ['Trò chơi', 'Mô hình 3D', 'Tình huống'],
  },
  creative: {
    id: 'creative',
    learnerTitle: 'Xưởng sáng tạo',
    learnerDescription: 'Tô màu sinh vật biển và ghép góc biển của riêng em.',
    learnerCta: 'Bắt đầu sáng tạo',
    learnerRoute: '/studio',
    teacherTitle: 'Xưởng sáng tạo',
    teacherDescription: 'Khung tô màu, nguyên liệu góc biển và tranh của lớp.',
    teacherCta: 'Mở xưởng sáng tạo',
    teacherRoute: '/teacher/creative',
    cutoutSrc: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    fallbackCutoutSrc: '/assets/generated/creatures/crab_isolated.png',
    imageUrl: '/assets/generated/craft/craft_desk_art.jpg',
    image: '/assets/generated/craft/craft_desk_art.jpg',
    alt: 'Bàn vẽ sáng tạo sắc màu đại dương',
    accentGradient: 'from-[#FFF4EC] via-[#FDE8D7] to-[#FAD8BE]',
    badgeColor: '#DC6B52',
    subFormats: ['Vẽ & Tô màu', 'Dựng góc biển'],
  },
};

const EXTRA_CATEGORY_SPECS: Record<
  'model3d' | 'game' | 'simulation' | 'scenario',
  CategoryArtworkSpec
> = {
  model3d: {
    id: 'model3d',
    learnerTitle: 'Khám phá 3D',
    learnerDescription: 'Chạm và xoay mô hình 3D sinh vật biển.',
    learnerCta: 'Khám phá',
    learnerRoute: '/interactive?kind=model3d',
    teacherTitle: 'Mô hình 3D',
    teacherDescription: 'Quản lý mô hình 3D Sketchfab sinh vật biển.',
    teacherCta: 'Quản lý mô hình',
    teacherRoute: '/teacher/interactive?kind=model3d',
    cutoutSrc: '/assets/generated/creatures/turtle_isolated.png',
    fallbackCutoutSrc: '/assets/generated/creatures/turtle_isolated.png',
    imageUrl: '/assets/generated/creatures/sea_turtle_card.jpg',
    image: '/assets/generated/creatures/sea_turtle_card.jpg',
    alt: 'Mô hình 3D rùa biển',
    accentGradient: 'from-[#E4F4F8] via-[#D2EEF5] to-[#BCE4EF]',
    badgeColor: '#17657A',
    subFormats: ['Mô hình 3D'],
  },
  game: {
    id: 'game',
    learnerTitle: 'Trò chơi đại dương',
    learnerDescription: 'Ghép nơi sống và phân loại sinh vật biển.',
    learnerCta: 'Chơi ngay',
    learnerRoute: '/interactive?kind=game',
    teacherTitle: 'Trò chơi tương tác',
    teacherDescription: 'Quản lý trò chơi kéo thả, ghép cặp và chọn hình.',
    teacherCta: 'Quản lý trò chơi',
    teacherRoute: '/teacher/interactive?kind=game',
    cutoutSrc: '/assets/generated/creatures/clownfish_isolated.png',
    fallbackCutoutSrc: '/assets/generated/creatures/clownfish_isolated.png',
    imageUrl: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    image: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    alt: 'Trò chơi tìm nơi sống cho sinh vật biển',
    accentGradient: 'from-[#E8F6F3] via-[#D4EFEA] to-[#BBE5DD]',
    badgeColor: '#0E7490',
    subFormats: ['Trò chơi'],
  },
  simulation: {
    id: 'simulation',
    learnerTitle: 'Mô phỏng đại dương',
    learnerDescription: 'Quan sát dòng chảy và hệ sinh thái biển.',
    learnerCta: 'Thử nghiệm',
    learnerRoute: '/interactive?kind=simulation',
    teacherTitle: 'Mô phỏng sinh thái',
    teacherDescription: 'Mô phỏng chuyên biệt vùng biển và nhựa đại dương.',
    teacherCta: 'Chọn mô phỏng',
    teacherRoute: '/teacher/interactive?kind=simulation',
    cutoutSrc: '/assets/generated/r2-cutouts/dolphin_cutout.png',
    fallbackCutoutSrc: '/assets/generated/r2-cutouts/dolphin_cutout.png',
    imageUrl: '/assets/generated/simulations/sim_coastal_bay_landscape.png',
    image: '/assets/generated/simulations/sim_coastal_bay_landscape.png',
    alt: 'Mô phỏng vịnh biển ven bờ',
    accentGradient: 'from-[#E8F2FC] via-[#D5E7FA] to-[#BBD8F6]',
    badgeColor: '#15586E',
    subFormats: ['Mô phỏng'],
  },
  scenario: {
    id: 'scenario',
    learnerTitle: 'Tình huống biển xanh',
    learnerDescription: 'Bé chọn hành động đúng để giữ biển sạch đẹp.',
    learnerCta: 'Khám phá',
    learnerRoute: '/interactive?kind=scenario',
    teacherTitle: 'Tình huống tương tác',
    teacherDescription: 'Soạn tình huống phân nhánh cho bé lựa chọn.',
    teacherCta: 'Tạo tình huống',
    teacherRoute: '/teacher/interactive?kind=scenario',
    cutoutSrc: '/assets/generated/r2-cutouts/seashell_cutout.png',
    fallbackCutoutSrc: '/assets/generated/r2-cutouts/seashell_cutout.png',
    imageUrl: '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
    image: '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
    alt: 'Tình huống nhặt chai nhựa bảo vệ bãi biển',
    accentGradient: 'from-[#E9F7EF] via-[#D4F0E0] to-[#BBE6CE]',
    badgeColor: '#1F8A5B',
    subFormats: ['Tình huống'],
  },
};

export const CATEGORY_ARTWORK_MAP = Object.defineProperties(
  { ...BASE_CATEGORY_ARTWORK_MAP },
  {
    model3d: { value: EXTRA_CATEGORY_SPECS.model3d, enumerable: false },
    game: { value: EXTRA_CATEGORY_SPECS.game, enumerable: false },
    simulation: { value: EXTRA_CATEGORY_SPECS.simulation, enumerable: false },
    scenario: { value: EXTRA_CATEGORY_SPECS.scenario, enumerable: false },
  }
) as Record<
  'resources' | 'interactive' | 'creative' | 'model3d' | 'game' | 'simulation' | 'scenario',
  CategoryArtworkSpec
>;

export function getCategoryArtwork(
  key?: string | null,
): CategoryArtworkSpec & { thumbnailPath: string } {
  const base =
    key && key in CATEGORY_ARTWORK_MAP
      ? CATEGORY_ARTWORK_MAP[key as keyof typeof CATEGORY_ARTWORK_MAP]
      : BASE_CATEGORY_ARTWORK_MAP.resources;
  return {
    ...base,
    thumbnailPath: base.imageUrl,
  };
}


export const HOME_SHORTCUT_CARDS = {
  creative: {
    title: 'Xưởng sáng tạo',
    subtitle: 'Tô màu và ghép góc biển của em',
    cta: 'Vào xưởng vẽ',
    route: '/studio',
    photoSrc: '/assets/generated/craft/craft_desk_art.jpg',
  },
} as const;

export interface TopicMeta {
  key: OceanTopicKey;
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  cutoutSrc: string;
  avatarImage: string;
  accentBg: string;
  accentText: string;
}

export const TOPIC_ARTWORK_MAP: Record<string, TopicMeta> = {
  all: {
    key: 'creatures',
    slug: 'all',
    label: 'Tất cả',
    shortLabel: 'Tất cả',
    description: 'Tất cả chủ đề đại dương.',
    cutoutSrc: '/assets/generated/creatures/turtle_isolated.png',
    avatarImage: '/assets/generated/creatures/sea_turtle_card.jpg',
    accentBg: '#E4F4F8',
    accentText: '#12384B',
  },
  species: {
    key: 'species',
    slug: 'species',
    label: 'Sinh vật',
    shortLabel: 'Sinh vật',
    description: 'Làm quen với rùa biển, cá hề, bạch tuộc, cua đỏ và sao biển.',
    cutoutSrc: '/assets/generated/creatures/clownfish_isolated.png',
    avatarImage: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    accentBg: '#E4F4F8',
    accentText: '#12384B',
  },
  creatures: {
    key: 'creatures',
    slug: 'creatures',
    label: 'Sinh vật biển',
    shortLabel: 'Sinh vật',
    description: 'Làm quen với rùa biển, cá hề, bạch tuộc, cua đỏ và sao biển.',
    cutoutSrc: '/assets/generated/creatures/turtle_isolated.png',
    avatarImage: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    accentBg: '#E4F4F8',
    accentText: '#12384B',
  },
  habitats: {
    key: 'habitats',
    slug: 'habitats',
    label: 'Môi trường',
    shortLabel: 'Môi trường',
    description: 'Khám phá rạn san hô, thảm cỏ biển và vùng nước nông.',
    cutoutSrc: '/assets/generated/r2-cutouts/starfish_cutout.png',
    avatarImage: '/assets/generated/stations/station_coral_reef.jpg',
    accentBg: '#FFF1EC',
    accentText: '#9A3412',
  },
  environment: {
    key: 'environment',
    slug: 'environment',
    label: 'Môi trường',
    shortLabel: 'Môi trường',
    description: 'Khám phá rạn san hô, thảm cỏ biển và vùng nước nông.',
    cutoutSrc: '/assets/generated/r2-cutouts/starfish_cutout.png',
    avatarImage: '/assets/generated/stations/station_coral_reef.jpg',
    accentBg: '#FFF1EC',
    accentText: '#9A3412',
  },
  coral: {
    key: 'coral',
    slug: 'coral',
    label: 'Rạn san hô',
    shortLabel: 'Rạn san hô',
    description: 'Khám phá ngôi nhà rực rỡ sắc màu của các loài cá nhỏ.',
    cutoutSrc: '/assets/generated/r2-cutouts/starfish_cutout.png',
    avatarImage: '/assets/generated/stations/station_coral_reef.jpg',
    accentBg: '#FFF1EC',
    accentText: '#9A3412',
  },
  layers: {
    key: 'layers',
    slug: 'layers',
    label: 'Tầng nước biển',
    shortLabel: 'Tầng nước biển',
    description: 'Từ mặt biển nắng ấm xuống tầng nước sâu kỳ thú.',
    cutoutSrc: '/assets/generated/r2-cutouts/dolphin_cutout.png',
    avatarImage: '/assets/generated/creatures/sea_turtle_card.jpg',
    accentBg: '#E8F2FC',
    accentText: '#1E3A8A',
  },
  conservation: {
    key: 'conservation',
    slug: 'conservation',
    label: 'Giữ biển sạch',
    shortLabel: 'Bảo vệ biển',
    description: 'Cùng nhặt rác nhựa và bảo vệ ngôi nhà đại dương xanh.',
    cutoutSrc: '/assets/generated/r2-cutouts/seashell_cutout.png',
    avatarImage: '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
    accentBg: '#E9F7EF',
    accentText: '#14532D',
  },
};

export const TOPIC_META_LIST: TopicMeta[] = [
  TOPIC_ARTWORK_MAP.creatures,
  TOPIC_ARTWORK_MAP.coral,
  TOPIC_ARTWORK_MAP.layers,
  TOPIC_ARTWORK_MAP.conservation,
];

export const CANONICAL_TOPICS: TopicMeta[] = [
  TOPIC_ARTWORK_MAP.species,
  TOPIC_ARTWORK_MAP.habitats,
  TOPIC_ARTWORK_MAP.conservation,
];

export interface AnimalAvatarSpec {
  key: AnimalAvatarKey;
  group?: AvatarGroup;
  label: string;
  labelVi?: string;
  shortName: string;
  imageSrc: string;
  imagePath?: string;
  bgHex: string;
  ringHex: string;
}

const RAW_ANIMAL_AVATARS: AnimalAvatarSpec[] = [
  {
    key: 'turtle',
    label: 'Rùa Xanh',
    shortName: 'Rùa',
    imageSrc: '/assets/generated/profile/avatar-turtle.webp',
    bgHex: '#E3F6EC',
    ringHex: '#1F9D6A',
  },
  {
    key: 'crab',
    label: 'Cua Đỏ',
    shortName: 'Cua',
    imageSrc: '/assets/generated/profile/avatar-crab.webp',
    bgHex: '#FFEBE6',
    ringHex: '#E0654E',
  },
  {
    key: 'clownfish',
    label: 'Cá Hề',
    shortName: 'Cá Hề',
    imageSrc: '/assets/generated/profile/avatar-clownfish.webp',
    bgHex: '#FFF2E2',
    ringHex: '#E89B2D',
  },
  {
    key: 'starfish',
    label: 'Sao Biển',
    shortName: 'Sao Biển',
    imageSrc: '/assets/generated/profile/avatar-starfish.webp',
    bgHex: '#FFF6DB',
    ringHex: '#D97706',
  },
  {
    key: 'dolphin',
    label: 'Cá Heo',
    shortName: 'Cá Heo',
    imageSrc: '/assets/generated/profile/avatar-dolphin.webp',
    bgHex: '#E4F3FB',
    ringHex: '#15586E',
  },
  {
    key: 'octopus',
    label: 'Bạch Tuộc',
    shortName: 'Bạch Tuộc',
    imageSrc: '/assets/generated/profile/avatar-octopus.webp',
    bgHex: '#FCE8EF',
    ringHex: '#DB2777',
  },
  {
    key: 'seahorse',
    label: 'Cá Ngựa',
    shortName: 'Cá Ngựa',
    imageSrc: '/assets/generated/profile/avatar-seahorse.webp',
    bgHex: '#FEF3C7',
    ringHex: '#B45309',
  },
  {
    key: 'jellyfish',
    label: 'Sứa Hồng',
    shortName: 'Sứa',
    imageSrc: '/assets/generated/profile/avatar-jellyfish.webp',
    bgHex: '#F3E8FF',
    ringHex: '#7C3AED',
  },
];

const ALL_ANIMAL_AVATARS = [...RAW_ANIMAL_AVATARS,
  { key: 'shark', label: 'Cá mập', shortName: 'Cá mập', group: 'sea', imageSrc: '/assets/generated/profile/chibi/avatar-shark.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'whale', label: 'Cá voi', shortName: 'Cá voi', group: 'sea', imageSrc: '/assets/generated/profile/chibi/avatar-whale.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'seal', label: 'Hải cẩu', shortName: 'Hải cẩu', group: 'shore', imageSrc: '/assets/generated/profile/chibi/avatar-seal.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'otter', label: 'Rái cá', shortName: 'Rái cá', group: 'shore', imageSrc: '/assets/generated/profile/chibi/avatar-otter.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'stingray', label: 'Cá đuối', shortName: 'Cá đuối', group: 'sea', imageSrc: '/assets/generated/profile/chibi/avatar-stingray.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'pufferfish', label: 'Cá nóc', shortName: 'Cá nóc', group: 'sea', imageSrc: '/assets/generated/profile/chibi/avatar-pufferfish.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'shrimp', label: 'Tôm', shortName: 'Tôm', group: 'sea', imageSrc: '/assets/generated/profile/chibi/avatar-shrimp.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'squid', label: 'Mực', shortName: 'Mực', group: 'sea', imageSrc: '/assets/generated/profile/chibi/avatar-squid.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'duck', label: 'Vịt', shortName: 'Vịt', group: 'freshwater', imageSrc: '/assets/generated/profile/chibi/avatar-duck.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'penguin', label: 'Chim cánh cụt', shortName: 'Chim cánh cụt', group: 'shore', imageSrc: '/assets/generated/profile/chibi/avatar-penguin.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'frog', label: 'Ếch', shortName: 'Ếch', group: 'freshwater', imageSrc: '/assets/generated/profile/chibi/avatar-frog.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
  { key: 'crocodile', label: 'Cá sấu', shortName: 'Cá sấu', group: 'freshwater', imageSrc: '/assets/generated/profile/chibi/avatar-crocodile.webp', bgHex: '#E7F5FF', ringHex: '#3185C4' },
] satisfies AnimalAvatarSpec[];

export const ANIMAL_AVATARS: Array<Required<AnimalAvatarSpec>> = ALL_ANIMAL_AVATARS.map((a) => ({
  ...a,
  group: a.group ?? 'sea',
  imageSrc: `/assets/generated/profile/chibi/avatar-${a.key}.webp`,
  labelVi: a.label,
  imagePath: `/assets/generated/profile/chibi/avatar-${a.key}.webp`,
}));

export function getAnimalAvatar(key?: string | null): Required<AnimalAvatarSpec> {
  return ANIMAL_AVATARS.find((item) => item.key === (AVATAR_KEY_ALIASES[key ?? ''] ?? key)) ?? ANIMAL_AVATARS[0];
}

export const getAvatarMeta = getAnimalAvatar;


export const CUTOUT_SPECIMEN_ASSETS = {
  turtle: '/assets/generated/creatures/turtle_isolated.png',
  clownfish: '/assets/generated/creatures/clownfish_isolated.png',
  crab: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
  starfish: '/assets/generated/r2-cutouts/starfish_cutout.png',
  seashell: '/assets/generated/r2-cutouts/seashell_cutout.png',
  dolphin: '/assets/generated/r2-cutouts/dolphin_cutout.png',
  octopus: '/assets/generated/creatures/octopus_isolated.png',
  seahorse: '/assets/generated/creatures/seahorse_isolated.png',
  jellyfish: '/assets/generated/r2-cutouts/jellyfish_cutout.png',
  stingray: '/assets/generated/creatures/stingray_isolated.png',
  blueFish: '/assets/generated/creatures/blue_fish_isolated.png',
} as const;
