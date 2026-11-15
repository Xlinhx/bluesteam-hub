import { ApiClientError, apiRequest } from './client';

function isShowcaseContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/showcase');
}


export interface TopicDto {
  id: string;
  slug: string;
  title: string;
  iconKey: string;
  sortOrder: number;
}

export interface ResourceShortFact {
  iconKey: string;
  label: string;
  detail?: string;
}

export interface ResourceVariantLink {
  visibility?: 'seed' | 'published' | 'hidden';
  id: string;
  kind: string;
  title: string;
  coverUrl: string | null;
  drawingTemplateKey?: string | null;
}

export interface ResourceDto {
  id: string;
  ownerId: string | null;
  isSeed: boolean;
  kind: 'flashcard' | 'image' | 'audio' | 'video' | 'coloring' | 'worksheet' | 'poster';
  title: string;
  description: string;
  coverMediaId: string | null;
  mediaId: string | null;
  coverUrl: string | null;
  thumbnailUrl?: string;
  mediaUrl: string | null;
  mediaMimeType?: string | null;
  content: {
    shortFacts?: ResourceShortFact[];
    narrationText?: string;
    audioKind?: 'narration' | 'ambient';
    durationSeconds?: number;
    waveformPeaks?: number[];
    chapters?: Array<{ timeSeconds: number; title: string }>;
    printableType?: 'coloring' | 'worksheet' | 'poster';
    svgTemplate?: string;
    drawingTemplateKey?: string;
    albumUrls?: string[];
    sourcePdfUrl?: string;
    sourcePages?: number[];
    downloadUrl?: string;
    albumAssets?: Array<{id?:string;url:string;name?:string;byteSize?:number;mimeType?:string}>;
    mediaDetails?: {name?:string;byteSize?:number;mimeType?:string};
      coverOverride?: boolean;
  };
  visibility: 'seed' | 'published' | 'hidden';
  version: number;
  topicSlugs: string[];
  variants?: ResourceVariantLink[];
  editableVariantIds?: string[];
  groups?: Array<{ id: string; title: string; isSeed: boolean; canEdit?: boolean }>;
  groupIds?: string[];
  isGroupMember?: boolean;
  related?: Array<{
    id: string;
    kind: string;
    title: string;
    description: string;
    coverUrl: string | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Model3DDto {
  id: string;
  ownerId: string | null;
  isSeed: boolean;
  provider: 'sketchfab';
  modelUid: string;
  canonicalUrl: string;
  embedUrl: string;
  title: string;
  description: string;
  coverMediaId: string | null;
  narrationMediaId?: string | null;
  coverUrl: string;
  narrationText: string;
  attribution: {
    creator: string;
    license: string;
    sourceUrl: string;
  };
  visibility: 'seed' | 'draft' | 'published' | 'hidden';
  status?: 'seed' | 'draft' | 'published' | 'hidden';
  slug?: string;
  externalUid?: string;
  thumbnailUrl?: string;
  summary?: string;
  CheckStatus?: string;
  version: number;
  topicSlugs: string[];
  relatedModels?: Model3DDto[];
  createdAt?: string;
  updatedAt?: string;
}


export interface CatalogPage<T> {
  items: T[];
  nextCursor: string | null;
  previousCursor?: string | null;
  total: number;
}

export function parseSketchfabUrlClient(rawInput: string): {
  valid: boolean;
  provider: 'sketchfab';
  modelUid: string | null;
  canonicalUrl: string | null;
  embedUrl: string | null;
  error?: string;
} {
  const input = (rawInput || '').trim();
  if (!input) {
    return {
      valid: false,
      provider: 'sketchfab',
      modelUid: null,
      canonicalUrl: null,
      embedUrl: null,
      error: 'Vui lòng nhập liên kết Sketchfab.',
    };
  }
  if (input.includes('<') || input.includes('>') || /javascript:/i.test(input)) {
    return {
      valid: false,
      provider: 'sketchfab',
      modelUid: null,
      canonicalUrl: null,
      embedUrl: null,
      error: 'Không chấp nhận mã nhúng iframe HTML thô. Hãy dán liên kết trang Sketchfab.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return {
      valid: false,
      provider: 'sketchfab',
      modelUid: null,
      canonicalUrl: null,
      embedUrl: null,
      error: 'Liên kết không đúng định dạng URL (bắt đầu bằng https://sketchfab.com/...).',
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (host !== 'sketchfab.com' && host !== 'www.sketchfab.com') {
    return {
      valid: false,
      provider: 'sketchfab',
      modelUid: null,
      canonicalUrl: null,
      embedUrl: null,
      error: 'Chỉ hỗ trợ liên kết từ tên miền sketchfab.com.',
    };
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');
  const match =
    pathname.match(/\/3d-models\/(?:[a-z0-9-]+-)?([a-f0-9]{32})$/i) ||
    pathname.match(/\/models\/([a-f0-9]{32})(?:\/embed)?$/i);

  if (!match || !match[1]) {
    return {
      valid: false,
      provider: 'sketchfab',
      modelUid: null,
      canonicalUrl: null,
      embedUrl: null,
      error: 'Không tìm thấy mã UID 32 ký tự hợp lệ trong đường dẫn Sketchfab.',
    };
  }

  const uid = match[1].toLowerCase();
  return {
    valid: true,
    provider: 'sketchfab',
    modelUid: uid,
    canonicalUrl: `https://sketchfab.com/3d-models/${uid}`,
    embedUrl: `https://sketchfab.com/models/${uid}/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0`,
  };
}

// Canonical initial fallback data matching the PostgreSQL seed for immediate SSR / offline test rendering
export const INITIAL_RESOURCES_FALLBACK: ResourceDto[] = [
  {
    id: '041d3c99-8383-425f-b444-6e8b82796c6b',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Cua biển',
    description: 'Bạn cua nhỏ có hai chiếc càng khỏe sống ở bãi cát và ghềnh đá ven bờ.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    mediaUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
    content: {
      shortFacts: [
        { iconKey: 'claw', label: 'Hai càng khỏe', detail: 'Giúp cua tự vệ và tìm thức ăn trên bãi cát.' },
        { iconKey: 'footprints', label: 'Bò ngang', detail: 'Tám chân giúp cua di chuyển ngang rất nhanh.' },
        { iconKey: 'waves', label: 'Sống ven bờ', detail: 'Thường đào hang nhỏ trên bãi cát hoặc ẩn dưới kẽ đá.' },
      ],
      narrationText: 'Đây là bạn Cua biển. Bạn cua có hai chiếc càng khỏe khoắn, tám cái chân và rất thích bò ngang trên bãi cát.',
      audioKind: 'narration',
    },
    variants: [
      { id: 'crab-img', kind: 'image', title: 'Hình ảnh Cua biển ven đá', coverUrl: '/assets/generated/stations/station_hermit_crab.jpg' },
      { id: 'crab-vid', kind: 'video', title: 'Video Cua biển bò ngang', coverUrl: '/assets/generated/stations/station_hermit_crab.jpg' },
      { id: 'crab-aud', kind: 'audio', title: 'Lời kể về bạn Cua biển', coverUrl: '/assets/generated/stations/station_hermit_crab.jpg' },
      { id: 'crab-col', kind: 'coloring', title: 'Tranh tô màu: Bạn Cua biển', coverUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png', drawingTemplateKey: 'template:drawing-crab' },
    ],
  },
  {
    id: '2505d2c4-5d0f-4f95-8284-8f355c37717b',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Cá hề',
    description: 'Chú cá nhỏ màu cam rực rỡ với ba dải sọc trắng bơi giữa rạn san hô.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/creatures/clownfish_isolated.png',
    mediaUrl: '/assets/generated/creatures/clownfish_isolated.png',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species', 'environment'],
    content: {
      shortFacts: [
        { iconKey: 'palette', label: 'Áo cam sọc trắng', detail: 'Màu cam nổi bật cùng ba vệt trắng dễ nhận biết.' },
        { iconKey: 'home', label: 'Nhà ở hải quỳ', detail: 'Sống hòa thuận giữa các xúc tu mềm của hải quỳ.' },
        { iconKey: 'users', label: 'Bơi theo đàn nhỏ', detail: 'Luôn quấn quýt bên ngôi nhà san hô ấm áp.' },
      ],
      narrationText: 'Bạn Cá hề mặc chiếc áo màu cam tươi với ba vệt sọc trắng, sống vui vẻ bên những bụi hải quỳ mềm mại.',
      audioKind: 'narration',
    },
  },
  {
    id: '899f16a5-6475-4719-9438-1b95c48c6293',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Sao biển',
    description: 'Sinh vật năm cánh đáng yêu nằm tắm nắng trên bãi cát và thảm cỏ biển.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/starfish_cutout.png',
    mediaUrl: '/assets/generated/r2-cutouts/starfish_cutout.png',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
    content: {
      shortFacts: [
        { iconKey: 'star', label: 'Năm cánh đều', detail: 'Hình dáng giống ngôi sao nhỏ dưới đáy biển.' },
        { iconKey: 'anchor', label: 'Bám chắc vào đá', detail: 'Mặt dưới có nhiều chân ống nhỏ li ti.' },
        { iconKey: 'sun', label: 'Yêu vùng nước nông', detail: 'Dễ bắt gặp ở bãi cát và rạn đá ven bờ.' },
      ],
      narrationText: 'Bạn Sao biển có năm cánh xòe đều như ngôi sao nhỏ, thích nằm yên trên bãi cát và các mỏm đá ven bờ.',
      audioKind: 'narration',
    },
  },
  {
    id: '9c585116-9499-4150-8f02-c777e2581d60',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Vỏ sò',
    description: 'Chiếc vỏ có vân quạt xinh xắn bảo vệ cơ thể mềm bên trong của loài sò biển.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/seashell_cutout.png',
    mediaUrl: '/assets/generated/r2-cutouts/seashell_cutout.png',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species', 'environment'],
    content: {
      shortFacts: [
        { iconKey: 'shield', label: 'Lớp vỏ cứng', detail: 'Hai mảnh vỏ khép mở để che chở bên trong.' },
        { iconKey: 'sparkles', label: 'Vân hình rẻ quạt', detail: 'Trên mặt vỏ có nhiều đường gân đều đặn.' },
        { iconKey: 'waves', label: 'Nằm trên bãi cát', detail: 'Sóng biển thường đưa vỏ sò dạt vào bờ cát.' },
      ],
      narrationText: 'Chiếc vỏ sò có hình rẻ quạt với những đường vân đều đặn, nằm lấp lánh trên bãi cát vàng.',
      audioKind: 'narration',
    },
  },
  {
    id: 'c8824614-1f18-4962-b89f-9614485a9881',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Cá heo',
    description: 'Người bạn thông minh, thân thiện thích nhảy vọt lên khỏi mặt sóng xanh.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/dolphin_cutout.png',
    mediaUrl: '/assets/generated/r2-cutouts/dolphin_cutout.png',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species', 'conservation'],
    content: {
      shortFacts: [
        { iconKey: 'smile', label: 'Thông minh, vui vẻ', detail: 'Thích bơi theo đàn và nhảy lên mặt nước.' },
        { iconKey: 'volume', label: 'Trò chuyện bằng âm thanh', detail: 'Phát ra tiếngách tách để tìm đường và gọi bạn.' },
        { iconKey: 'wind', label: 'Thở bằng phổi', detail: 'Ngoi lên mặt biển để lấy không khí.' },
      ],
      narrationText: 'Bạn Cá heo rất thông minh và thân thiện, thường bơi thành đàn và tung mình nhảy lên trên mặt sóng.',
      audioKind: 'narration',
    },
  },
  {
    id: 'f7377174-2c13-4821-8176-5e2772b022d2',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'San hô',
    description: 'Rạn san hô đầy màu sắc là ngôi nhà chung của hàng trăm loài sinh vật biển.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/stations/station_coral_reef.jpg',
    mediaUrl: '/assets/generated/stations/station_coral_reef.jpg',
    visibility: 'published',
    version: 1,
    topicSlugs: ['environment', 'conservation'],
    content: {
      shortFacts: [
        { iconKey: 'palette', label: 'Nhiều màu rực rỡ', detail: 'Có hình cành cây, hình nấm hoặc hình quạt.' },
        { iconKey: 'home', label: 'Ngôi nhà chung', detail: 'Nơi sinh sống của cá hề, sao biển và tôm nhỏ.' },
        { iconKey: 'shield', label: 'Cần nước sạch', detail: 'Phát triển tốt ở vùng nước biển trong và ấm.' },
      ],
      narrationText: 'San hô trông như những cành cây rực rỡ, là ngôi nhà ấm áp của biết bao loài cá nhỏ.',
      audioKind: 'narration',
    },
  },
  {
    id: '5194d90c-0762-4f96-9614-1a1c3f1d0914',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Sứa',
    description: 'Sứa biển có thân trong suốt như chiếc ô nhỏ trôi nhẹ nhàng trong làn nước.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/jellyfish_cutout.png',
    mediaUrl: '/assets/generated/r2-cutouts/jellyfish_cutout.png',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
    content: {
      shortFacts: [
        { iconKey: 'umbrella', label: 'Thân hình dù', detail: 'Mũ sứa mềm mại co bóp để đẩy nước.' },
        { iconKey: 'waves', label: 'Bơi nhịp nhàng', detail: 'Trôi nhẹ nhàng theo dòng nước biển.' },
        { iconKey: 'sparkles', label: 'Trong suốt', detail: 'Cơ thể mềm và trong suốt dưới ánh sáng.' },
      ],
      narrationText: 'Bạn sứa có thân hình chiếc ô mềm mại, bơi nhịp nhàng trong làn nước xanh.',
      audioKind: 'narration',
    },
  },
  {
    id: '2505d2c4-5d0f-4f95-8284-8f355c377199',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Cá voi',
    description: 'Người khổng lồ hiền hòa của đại dương với tiếng hát vang xa trong nước.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/ocean/specimen-whale.jpg',
    mediaUrl: '/assets/ocean/specimen-whale.jpg',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species', 'conservation'],
    content: {
      shortFacts: [
        { iconKey: 'whale', label: 'To lớn nhất', detail: 'Là loài động vật lớn nhất dưới đại dương.' },
        { iconKey: 'wind', label: 'Phun cột nước', detail: 'Ngoi lên mặt biển để thở và phun nước.' },
        { iconKey: 'volume', label: 'Hát dưới biển', detail: 'Giao tiếp với nhau bằng âm thanh trầm ấm.' },
      ],
      narrationText: 'Cá voi là người bạn khổng lồ hiền lành, thường ngoi lên mặt nước thở và ngân vang tiếng hát.',
      audioKind: 'narration',
    },
  },
  {
    id: 'a1234567-89ab-4cde-8f01-234567890001',
    ownerId: null,
    isSeed: true,
    kind: 'flashcard',
    title: 'Rùa biển xanh',
    description: 'Loài rùa biển hiền lành có mai cứng và bốn chân bơi khỏe khoắn.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/creatures/green_turtle_hero.jpg',
    mediaUrl: '/assets/generated/creatures/green_turtle_hero.jpg',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species', 'conservation'],
    content: {
      shortFacts: [
        { iconKey: 'shield', label: 'Mai cứng cáp', detail: 'Chiếc mai lớn bảo vệ cơ thể rùa biển.' },
        { iconKey: 'sprout', label: 'Ăn cỏ biển', detail: 'Rùa trưởng thành thích ăn cỏ biển xanh non.' },
        { iconKey: 'waves', label: 'Chân bơi khỏe', detail: 'Bốn chân dạng mái chèo giúp bơi xa.' },
      ],
      narrationText: 'Rùa biển xanh có chiếc mai cứng cáp và đôi chân bơi như mái chèo, rất thích ăn cỏ biển.',
      audioKind: 'narration',
    },
  },
  {
    id: 'a1234567-89ab-4cde-8f01-234567890002',
    ownerId: null,
    isSeed: true,
    kind: 'audio',
    title: 'Tiếng sóng',
    description: 'Âm thanh rì rào của sóng biển vỗ nhẹ lên bờ cát.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/decor/topic_ocean_wave.jpg',
    mediaUrl: null,
    visibility: 'published',
    version: 1,
    topicSlugs: ['environment'],
    content: {
      audioKind: 'ambient',
      durationSeconds: 35,
      narrationText: 'Hãy lắng nghe tiếng sóng biển rì rào vỗ nhẹ vào bờ cát trắng.',
      waveformPeaks: [0.25, 0.5, 0.8, 0.6, 0.35, 0.7, 0.9, 0.45, 0.3, 0.65, 0.85, 0.4],
    },
  },
  {
    id: 'a1234567-89ab-4cde-8f01-234567890003',
    ownerId: null,
    isSeed: true,
    kind: 'video',
    title: 'Video Cua biển bò ngang',
    description: 'Quan sát cách cua biển di chuyển trên bãi cát và ven đá.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/stations/station_hermit_crab.jpg',
    mediaUrl: '/assets/generated/stations/station_hermit_crab.jpg',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
    content: {
      durationSeconds: 45,
      narrationText: 'Cùng xem bạn cua biển khéo léo bò ngang trên bãi cát.',
      chapters: [
        { timeSeconds: 0, title: 'Cua rời hang cát' },
        { timeSeconds: 18, title: 'Đôi càng kẹp thức ăn' },
      ],
    },
  },
  {
    id: 'a1234567-89ab-4cde-8f01-234567890004',
    ownerId: null,
    isSeed: true,
    kind: 'coloring',
    title: 'Tranh tô màu: Bạn Cua biển',
    description: 'Tranh nét rõ ràng để bé tô màu chú cua biển đáng yêu.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    mediaUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
    content: {
      printableType: 'coloring',
      svgTemplate: 'crab',
      drawingTemplateKey: 'template:drawing-crab',
      narrationText: 'Bé hãy chọn màu cam hoặc đỏ tươi để tô cho bạn cua biển nhé!',
    },
  },
  {
    id: 'a1234567-89ab-4cde-8f01-234567890005',
    ownerId: null,
    isSeed: true,
    kind: 'worksheet',
    title: 'Phiếu học tập: Ai ở tầng nước nào?',
    description: 'Phiếu học tập nối sinh vật biển với nơi sống phù hợp.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/ocean/atlas-vertical-bg.jpg',
    mediaUrl: '/assets/ocean/atlas-vertical-bg.jpg',
    visibility: 'published',
    version: 1,
    topicSlugs: ['environment'],
    content: {
      printableType: 'worksheet',
      svgTemplate: 'depth-match',
      narrationText: 'Bé hãy nối mỗi bạn sinh vật biển về đúng ngôi nhà dưới nước của bạn ấy.',
    },
  },
  {
    id: 'a1234567-89ab-4cde-8f01-234567890006',
    ownerId: null,
    isSeed: true,
    kind: 'poster',
    title: 'Poster: Giữ biển sạch đẹp',
    description: 'Poster trực quan treo lớp hướng dẫn bảo vệ bờ biển và rừng ngập mặn.',
    coverMediaId: null,
    mediaId: null,
    coverUrl: '/assets/generated/stations/mangrove_ecosystem_poster.jpg',
    mediaUrl: '/assets/generated/stations/mangrove_ecosystem_poster.jpg',
    visibility: 'published',
    version: 1,
    topicSlugs: ['conservation', 'environment'],
    content: {
      printableType: 'poster',
      svgTemplate: 'clean-ocean-poster',
      narrationText: 'Cùng nhau bỏ rác đúng nơi quy định để giữ bãi biển và đại dương luôn sạch đẹp.',
    },
  },
];

export const INITIAL_MODELS_FALLBACK: Model3DDto[] = [
  {
    id: 'b1234567-89ab-4cde-8f01-234567890001',
    ownerId: null,
    isSeed: true,
    provider: 'sketchfab',
    modelUid: 'eb47bc5ab9084881b68443d893622111',
    canonicalUrl: 'https://sketchfab.com/3d-models/clownfish-eb47bc5ab9084881b68443d893622111',
    embedUrl: 'https://sketchfab.com/models/eb47bc5ab9084881b68443d893622111/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0',
    title: 'Cá hề',
    description: 'Mô hình 3D cá hề sọc cam trắng bơi quanh hải quỳ.',
    coverMediaId: null,
    coverUrl: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    narrationText: 'Chạm và xoay để ngắm bạn Cá hề với ba dải sọc trắng trên thân màu cam.',
    attribution: {
      creator: 'BlueSTEAM 3D Marine Collection',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://sketchfab.com/3d-models/clownfish-eb47bc5ab9084881b68443d893622111',
    },
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
  },
  {
    id: 'b1234567-89ab-4cde-8f01-234567890002',
    ownerId: null,
    isSeed: true,
    provider: 'sketchfab',
    modelUid: '02c0ead2ef48466d8bf4ab5c03cd2e18',
    canonicalUrl: 'https://sketchfab.com/3d-models/green-sea-turtle-02c0ead2ef48466d8bf4ab5c03cd2e18',
    embedUrl: 'https://sketchfab.com/models/02c0ead2ef48466d8bf4ab5c03cd2e18/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0',
    title: 'Rùa biển xanh',
    description: 'Mô hình 3D rùa biển xanh với mai cứng và chân bơi dạng mái chèo.',
    coverMediaId: null,
    coverUrl: '/assets/generated/creatures/green_turtle_hero.jpg',
    narrationText: 'Chạm và xoay để quan sát chiếc mai và đôi chân bơi của bạn Rùa biển xanh.',
    attribution: {
      creator: 'BlueSTEAM 3D Marine Collection',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://sketchfab.com/3d-models/green-sea-turtle-02c0ead2ef48466d8bf4ab5c03cd2e18',
    },
    visibility: 'published',
    version: 1,
    topicSlugs: ['species', 'conservation'],
  },
  {
    id: 'b1234567-89ab-4cde-8f01-234567890003',
    ownerId: null,
    isSeed: true,
    provider: 'sketchfab',
    modelUid: '6f4b2390b19b4a0ea2b9d7236e2f7e81',
    canonicalUrl: 'https://sketchfab.com/3d-models/starfish-6f4b2390b19b4a0ea2b9d7236e2f7e81',
    embedUrl: 'https://sketchfab.com/models/6f4b2390b19b4a0ea2b9d7236e2f7e81/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0',
    title: 'Sao biển',
    description: 'Mô hình 3D sao biển 5 cánh sống ở vùng đáy cát nông.',
    coverMediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/starfish_cutout.png',
    narrationText: 'Cùng xoay xem năm cánh đều nhau của bạn Sao biển nhé.',
    attribution: {
      creator: 'BlueSTEAM 3D Marine Collection',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://sketchfab.com/3d-models/starfish-6f4b2390b19b4a0ea2b9d7236e2f7e81',
    },
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
  },
  {
    id: 'b1234567-89ab-4cde-8f01-234567890004',
    ownerId: null,
    isSeed: true,
    provider: 'sketchfab',
    modelUid: '9a8d71c4230e47b99f621bc8a109f4c2',
    canonicalUrl: 'https://sketchfab.com/3d-models/stingray-9a8d71c4230e47b99f621bc8a109f4c2',
    embedUrl: 'https://sketchfab.com/models/9a8d71c4230e47b99f621bc8a109f4c2/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0',
    title: 'Cá đuối',
    description: 'Mô hình 3D cá đuối với đôi vây rộng lướt nhẹ dưới nước.',
    coverMediaId: null,
    coverUrl: '/assets/generated/creatures/stingray_isolated.jpg',
    narrationText: 'Bạn Cá đuối có thân dẹt và đôi vây rộng như đôi cánh dưới đáy biển.',
    attribution: {
      creator: 'BlueSTEAM 3D Marine Collection',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://sketchfab.com/3d-models/stingray-9a8d71c4230e47b99f621bc8a109f4c2',
    },
    visibility: 'hidden',
    version: 1,
    topicSlugs: ['species'],
  },
  {
    id: 'b1234567-89ab-4cde-8f01-234567890005',
    ownerId: null,
    isSeed: true,
    provider: 'sketchfab',
    modelUid: '4c219a0f8b124d58a7c38e02f94c71d3',
    canonicalUrl: 'https://sketchfab.com/3d-models/jellyfish-4c219a0f8b124d58a7c38e02f94c71d3',
    embedUrl: 'https://sketchfab.com/models/4c219a0f8b124d58a7c38e02f94c71d3/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0',
    title: 'Sứa',
    description: 'Mô hình 3D sứa biển mềm mại bơi trong làn nước.',
    coverMediaId: null,
    coverUrl: '/assets/generated/r2-cutouts/jellyfish_cutout.png',
    narrationText: 'Ngắm nhìn chiếc ô mềm mại và các xúc tu của bạn Sứa biển.',
    attribution: {
      creator: 'BlueSTEAM 3D Marine Collection',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://sketchfab.com/3d-models/jellyfish-4c219a0f8b124d58a7c38e02f94c71d3',
    },
    visibility: 'published',
    version: 1,
    topicSlugs: ['species'],
  },
];

export function filterResourcesLocal(
  items: ResourceDto[],
  params: {
    kind?: string;
    topicIds?: string[];
    q?: string;
    savedIds?: string[];
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    isTeacher?: boolean;
  },
): ResourceDto[] {
  return items.filter((item) => {
    if (!params.isTeacher && item.visibility !== 'published') return false;
    if (params.visibility && params.visibility !== 'all' && item.visibility !== params.visibility) {
      return false;
    }
    if (params.source === 'owned' && item.isSeed) return false;
    if (params.source === 'seed' && !item.isSeed) return false;
    if (params.kind && params.kind !== 'all') {
      if (params.kind === 'visual') {
        if (!['flashcard', 'card', 'image'].includes(item.kind)) return false;
      } else if (params.kind === 'printable' || params.kind === 'print') {
        if (!['coloring', 'worksheet', 'poster'].includes(item.kind)) return false;
      } else if (item.kind !== params.kind) {
        return false;
      }
    }
    if (params.topicIds && params.topicIds.length > 0) {
      const hasTopic = params.topicIds.some((t) => item.topicSlugs.includes(t));
      if (!hasTopic) return false;
    }
    if (params.savedIds !== undefined) {
      if (!params.savedIds.includes(item.id)) return false;
    }
    if (params.q && params.q.trim()) {
      const qLower = params.q.trim().toLowerCase();
      if (
        !item.title.toLowerCase().includes(qLower) &&
        !item.description.toLowerCase().includes(qLower)
      ) {
        return false;
      }
    }
    return true;
  });
}

function buildQueryString(params: Record<string, string | string[] | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      if (v.length > 0) sp.set(k, v.join(','));
    } else {
      sp.set(k, String(v));
    }
  }
  const str = sp.toString();
  return str ? `?${str}` : '';
}

export async function fetchPublicResources(
  params: {
    library?: boolean;
    capability?:'screen'|'print'|'all';
    groupId?: string;
    kind?: string;
    topicIds?: string[];
    q?: string;
    savedIds?: string[];
    cursor?: string;
    before?: string;
    page?: number;
    limit?: number;
  },
  signal?: AbortSignal,
): Promise<CatalogPage<ResourceDto>> {
  // An empty list is an active saved filter, never an unfiltered catalog.
  if (params.savedIds?.length === 0) return { items: [], total: 0, nextCursor: null };
  const qs = buildQueryString({
    library:params.library ? '1' : undefined,
    capability:params.capability,
    groupId: params.groupId,
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    topicIds: params.topicIds,
    q: params.q,
    savedIds: params.savedIds,
    cursor: params.cursor,
    before: params.before,
    page: params.page,
    limit: params.limit ?? 12,
  });
  return apiRequest<CatalogPage<ResourceDto>>(`/api/v1/resources${qs}`, { signal });
}

export async function fetchPublicResourceById(
  id: string,
  signal?: AbortSignal,
): Promise<ResourceDto> {
  return apiRequest<ResourceDto>(`/api/v1/resources/${encodeURIComponent(id)}`, { signal });
}

export async function fetchTeacherResources(
  params: {
    membershipGroupId?: string;
    groupId?: string;
    kind?: string;
    topicIds?: string[];
    q?: string;
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    page?: number;
    limit?: number;
  },
  signal?: AbortSignal,
): Promise<CatalogPage<ResourceDto>> {
  const qs = buildQueryString({
    groupId: params.groupId,
    membershipGroupId: params.membershipGroupId,
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    topicIds: params.topicIds,
    q: params.q,
    visibility: params.visibility && params.visibility !== 'all' ? params.visibility : undefined,
    source: params.source && params.source !== 'all' ? params.source : undefined,
    cursor: params.cursor,
    page: params.page,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<ResourceDto>>(`/api/v1/teacher/resources${qs}`, { signal });
}

export async function createTeacherResourceApi(payload: Partial<ResourceDto> & { topicSlugs?: string[]; linkedVariantIds?: string[] }) {
  return apiRequest<ResourceDto>('/api/v1/teacher/resources', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherResourceApi(
  id: string,
  payload: Partial<ResourceDto> & { topicSlugs?: string[]; linkedVariantIds?: string[] },
) {
  return apiRequest<ResourceDto>(`/api/v1/teacher/resources/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function duplicateTeacherResourceApi(id: string) {
  return apiRequest<ResourceDto>(`/api/v1/teacher/resources/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
}

export async function deleteTeacherResourceApi(id: string) {
  return apiRequest<{ deleted: boolean; id: string }>(
    `/api/v1/teacher/resources/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

export async function fetchPublicModels(
  params: {
    groupId?: string;
    topicIds?: string[];
    q?: string;
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<Model3DDto>> {
  const qs = buildQueryString({
    topicIds: params.topicIds,
    groupId: params.groupId,
    q: params.q,
    cursor: params.cursor,
    limit: params.limit ?? 9,
  });
  return apiRequest<CatalogPage<Model3DDto>>(`/api/v1/models${qs}`, { signal });
}

export async function fetchPublicModelById(
  id: string,
  signal?: AbortSignal,
): Promise<Model3DDto> {
  return apiRequest<Model3DDto>(`/api/v1/models/${encodeURIComponent(id)}`, { signal });
}

export async function fetchTeacherModels(
  params: {
    topicIds?: string[];
    q?: string;
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<Model3DDto>> {
  const qs = buildQueryString({
    topicIds: params.topicIds,
    q: params.q,
    visibility: params.visibility && params.visibility !== 'all' ? params.visibility : undefined,
    source: params.source && params.source !== 'all' ? params.source : undefined,
    cursor: params.cursor,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<Model3DDto>>(`/api/v1/teacher/models${qs}`, { signal });
}

export async function createTeacherModelApi(payload: {
  title: string;
  sketchfabUrl: string;
  description?: string;
  coverMediaId?: string | null;
  narrationText?: string;
  attribution?: Record<string, unknown>;
  topicSlugs?: string[];
  visibility?: 'draft' | 'published' | 'hidden';
  viewerVerified?: boolean;
}) {
  return apiRequest<Model3DDto>('/api/v1/teacher/models', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherModelApi(
  id: string,
  payload: Partial<{
    title: string;
    sketchfabUrl: string;
    description: string;
    coverMediaId: string | null;
    narrationText: string;
    attribution: Record<string, unknown>;
    topicSlugs: string[];
    visibility: 'draft' | 'published' | 'hidden';
  }>,
) {
  return apiRequest<Model3DDto>(`/api/v1/teacher/models/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function duplicateTeacherModelApi(id: string) {
  return apiRequest<Model3DDto>(`/api/v1/teacher/models/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
}

export async function deleteTeacherModelApi(id: string) {
  return apiRequest<{ deleted: boolean; id: string }>(
    `/api/v1/teacher/models/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

// Compatibility aliases for consumers
export type ModelCatalogItem = Model3DDto & {
  slug?: string;
  creatorName?: string;
  sourceUrl?: string;
};
export type ResourceCatalogItem = ResourceDto;
export const SEED_MODELS_FALLBACK: ModelCatalogItem[] = INITIAL_MODELS_FALLBACK.map((m) => ({
  ...m,
  slug: m.title.toLowerCase().includes('rùa')
    ? 'turtle'
    : m.title.toLowerCase().includes('cá hề')
      ? 'clownfish'
      : m.title.toLowerCase().includes('sao biển')
        ? 'starfish'
        : m.id,
  creatorName: m.attribution?.creator,
  sourceUrl: m.attribution?.sourceUrl,
}));
export const SEED_RESOURCES_FALLBACK = INITIAL_RESOURCES_FALLBACK;
export const fetchPublicModel = fetchPublicModelById;
export const createTeacherResource = createTeacherResourceApi;
export const updateTeacherResource = updateTeacherResourceApi;
export const duplicateTeacherResource = duplicateTeacherResourceApi;
export const deleteTeacherResource = deleteTeacherResourceApi;
export async function publishTeacherResource(id: string) {
  return updateTeacherResourceApi(id, { visibility: 'published' });
}
export async function hideTeacherResource(id: string) {
  return updateTeacherResourceApi(id, { visibility: 'hidden' });
}

export interface ActivityDto {
  hasWorkingCopy?: boolean;
  id: string;
  ownerId: string | null;
  isSeed: boolean;
  kind: 'game' | 'scenario' | 'simulation';
  title: string;
  description: string;
  summary?: string;
  templateKey: string;
  config: Record<string, any>;
  schemaVersion: number;
  configVersion?: number;
  coverMediaId: string | null;
  narrationMediaId?: string | null;
  coverUrl: string;
  thumbnailUrl?: string;
  narrationUrl?: string | null;
  visibility: 'seed' | 'draft' | 'published' | 'hidden';
  status?: 'seed' | 'draft' | 'published' | 'hidden';
  version: number;
  topicSlugs: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreativeTemplateDto {
  canEdit?: boolean;
  hasDraft?: boolean;
  publishedVisibility?: string;
  publishedVersion?: number;
  id: string;
  ownerId: string | null;
  isSeed: boolean;
  kind: 'drawing' | 'habitat';
  title: string;
  description?: string;
  payload: {
    svgTemplate?: string;
    presetId?: number;
    instructionText?: string;
    suggestedColors?: string[];
    [key: string]: unknown;
  };
  schemaVersion: number;
  mediaId: string | null;
  previewUrl: string;
  thumbnailUrl?: string;
  narrationUrl?: string | null;
  visibility: 'seed' | 'draft' | 'published' | 'hidden';
  status?: 'seed' | 'draft' | 'published' | 'hidden';
  version: number;
  topicSlugs: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreativeMaterialDto {
  canEdit?: boolean;
  hasDraft?: boolean;
  publishedVisibility?: string;
  usageCount?: number;
  usedBy?: { id: string; title: string }[];
  id: string;
  ownerId: string | null;
  isSeed: boolean;
  kind: 'stamp' | 'habitat_item';
  title: string;
  payload: {
    stampId?: string;
    assetId?: string;
    category?: string;
    itemType?: string;
    defaultScale?: number;
    [key: string]: unknown;
  };
  mediaId: string | null;
  mediaUrl: string;
  thumbnailUrl?: string;
  assetUrl?: string;
  topicSlugs?: string[];
  visibility: 'seed' | 'draft' | 'published' | 'hidden';
  status?: 'seed' | 'draft' | 'published' | 'hidden';
  version: number;
  createdAt?: string;
  updatedAt?: string;
}


export const INITIAL_ACTIVITIES_FALLBACK: ActivityDto[] = [
  {
    id: 'c1234567-89ab-4cde-8f01-234567890001',
    ownerId: null,
    isSeed: true,
    kind: 'game',
    templateKey: 'sorting',
    title: 'Về đúng nhà',
    description: 'Tìm nơi ở phù hợp cho các sinh vật biển.',
    coverMediaId: null,
    coverUrl: '/assets/generated/stations/station_hermit_crab.jpg',
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['species', 'environment'],
    config: {
      templateKey: 'sorting',
      instructionText: 'Đưa bạn về nhà',
      allowRetry: true,
      scoringEnabled: true,
      backgroundUrl: '/assets/generated/simulations/sim_coastal_bay_landscape.png',
      targets: [
        { id: 'zone-sand', label: 'Bờ cát', iconKey: 'sand' },
        { id: 'zone-seagrass', label: 'Cỏ biển', iconKey: 'seagrass' },
        { id: 'zone-coral', label: 'San hô', iconKey: 'coral' },
      ],
      objects: [
        {
          id: 'obj-crab',
          label: 'Cua biển',
          imageUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
          acceptedTargetIds: ['zone-sand'],
        },
        {
          id: 'obj-starfish',
          label: 'Sao biển',
          imageUrl: '/assets/generated/r2-cutouts/starfish_cutout.png',
          acceptedTargetIds: ['zone-sand', 'zone-seagrass'],
        },
        {
          id: 'obj-clownfish',
          label: 'Cá hề',
          imageUrl: '/assets/generated/creatures/clownfish_isolated.png',
          acceptedTargetIds: ['zone-coral'],
        },
      ],
    },
  },
  {
    id: 'c1234567-89ab-4cde-8f01-234567890002',
    ownerId: null,
    isSeed: true,
    kind: 'game',
    templateKey: 'matching',
    title: 'Tìm đôi bạn',
    description: 'Ghép các sinh vật giống nhau.',
    coverMediaId: null,
    coverUrl: '/assets/generated/creatures/thumb_fish_sort_gamelab.png',
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['species'],
    config: {
      templateKey: 'matching',
      instructionText: 'Chạm vào hai hình bạn sinh vật giống nhau',
      allowRetry: true,
      scoringEnabled: true,
      pairs: [
        {
          id: 'pair-clownfish',
          left: { id: 'L-clownfish', label: 'Cá hề', imageUrl: '/assets/generated/creatures/clownfish_isolated.png' },
          right: { id: 'R-clownfish', label: 'Cá hề cam', imageUrl: '/assets/generated/creatures/clownfish_isolated.png' },
        },
        {
          id: 'pair-bluefish',
          left: { id: 'L-bluefish', label: 'Cá xanh', imageUrl: '/assets/generated/creatures/blue_fish_isolated.png' },
          right: { id: 'R-bluefish', label: 'Cá đuôi vàng', imageUrl: '/assets/generated/creatures/blue_fish_isolated.png' },
        },
        {
          id: 'pair-crab',
          left: { id: 'L-crab', label: 'Cua biển', imageUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png' },
          right: { id: 'R-crab', label: 'Bạn cua', imageUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png' },
        },
      ],
    },
  },
  {
    id: 'c1234567-89ab-4cde-8f01-234567890003',
    ownerId: null,
    isSeed: true,
    kind: 'game',
    templateKey: 'choice',
    title: 'Chọn con vật',
    description: 'Chọn đúng sinh vật theo câu hỏi.',
    coverMediaId: null,
    coverUrl: '/assets/generated/creatures/green_turtle_hero.jpg',
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['species'],
    config: {
      templateKey: 'choice',
      instructionText: 'Bé hãy chạm vào bạn Rùa biển xanh nhé!',
      allowRetry: true,
      scoringEnabled: true,
      questions: [
        {
          id: 'q-find-turtle',
          promptText: 'Đâu là bạn Rùa biển xanh có chiếc mai cứng cáp?',
          options: [
            { id: 'opt-clownfish', label: 'Cá hề', imageUrl: '/assets/generated/creatures/clownfish_isolated.png' },
            { id: 'opt-turtle', label: 'Rùa biển', imageUrl: '/assets/generated/creatures/turtle_isolated.png' },
            { id: 'opt-bluefish', label: 'Cá xanh', imageUrl: '/assets/generated/creatures/blue_fish_isolated.png' },
          ],
          correctOptionId: 'opt-turtle',
          feedbackText: 'Đúng rồi! Đây là bạn Rùa biển xanh.',
        },
        {
          id: 'q-find-crab',
          promptText: 'Bạn nào có hai chiếc càng khỏe và bò ngang trên cát?',
          options: [
            { id: 'opt-crab', label: 'Cua biển', imageUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png' },
            { id: 'opt-starfish', label: 'Sao biển', imageUrl: '/assets/generated/r2-cutouts/starfish_cutout.png' },
            { id: 'opt-seahorse', label: 'Cá ngựa', imageUrl: '/assets/generated/creatures/seahorse_isolated.png' },
          ],
          correctOptionId: 'opt-crab',
          feedbackText: 'Giỏi lắm! Bạn Cua biển có hai chiếc càng khỏe.',
        },
      ],
    },
  },
  {
    id: 'c1234567-89ab-4cde-8f01-234567890004',
    ownerId: null,
    isSeed: true,
    kind: 'scenario',
    templateKey: 'scenario',
    title: 'Giữ bờ biển sạch',
    description: 'Chọn cách xử lý khi thấy chai nhựa trên bãi cát.',
    coverMediaId: null,
    coverUrl: '/assets/generated/simulations/sim_bottle_beach.png',
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['conservation'],
    config: {
      templateKey: 'scenario',
      startSceneId: 'scene-1',
      scoringEnabled: true,
      scenes: [
        {
          id: 'scene-1',
          title: '1. Trên bãi biển',
          backgroundUrl: '/assets/generated/simulations/sim_bottle_beach.png',
          narrationText: 'Thấy chai nhựa trên cát, bé làm gì?',
          choices: [
            {
              id: 'c1-pickup',
              label: 'Nhặt rác',
              imageUrl: '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
              nextSceneId: 'scene-3',
              feedbackText: 'Tuyệt vời! Bỏ chai nhựa vào thùng giúp bãi biển sạch đẹp.',
              isCorrect: true,
            },
            {
              id: 'c1-leave',
              label: 'Bỏ đi',
              imageUrl: '/assets/generated/r2-scenarios/choice_walk_past_bottle.jpg',
              nextSceneId: 'scene-2',
              feedbackText: 'Chai nhựa có thể bị sóng cuốn ra biển đấy. Mình thử chọn lại nhé!',
              isCorrect: false,
            },
          ],
        },
        {
          id: 'scene-2',
          title: '2. Chọn cách xử lý',
          backgroundUrl: '/assets/generated/simulations/sim_plastic_journey.png',
          narrationText: 'Sóng sắp cuốn chai nhựa ra biển rồi, mình giúp bãi biển thế nào nhỉ?',
          choices: [
            {
              id: 'c2-pickup',
              label: 'Bỏ vào thùng',
              imageUrl: '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
              nextSceneId: 'scene-3',
              feedbackText: 'Đúng rồi! Nhặt chai nhựa kịp thời giúp rùa và cá an toàn.',
              isCorrect: true,
            },
          ],
        },
        {
          id: 'scene-3',
          title: '3. Bờ biển sạch',
          backgroundUrl: '/assets/generated/simulations/sim_coastal_bay_landscape.png',
          narrationText: 'Bãi biển đã sạch tinh tươm, các bạn cua và sao biển vui vẻ tắm nắng!',
          isEnd: true,
          choices: [],
        },
      ],
    },
  },
  {
    id: 'c1234567-89ab-4cde-8f01-234567890005',
    ownerId: null,
    isSeed: true,
    kind: 'simulation',
    templateKey: 'rescue-mission',
    title: 'Hành trình giải cứu',
    description: 'Giải cứu rùa biển vướng lưới và làm sạch vùng vịnh.',
    coverMediaId: null,
    coverUrl: '/assets/generated/simulations/sim_rescue_hero_full.png',
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['conservation', 'species'],
    config: {
      simulationKey: 'rescue-mission',
      route: '/interactive/rescue-mission',
      instructionText: 'Chạm vào lưới rác để giải cứu bạn rùa biển an toàn.',
    },
  },
  {
    id: 'c1234567-89ab-4cde-8f01-234567890006',
    ownerId: null,
    isSeed: true,
    kind: 'simulation',
    templateKey: 'plastic-journey',
    title: 'Hành trình chai nhựa',
    description: 'Quan sát đường đi của rác nhựa và cách ngăn chặn từ bờ biển.',
    coverMediaId: null,
    coverUrl: '/assets/generated/simulations/sim_plastic_journey.png',
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['conservation', 'environment'],
    config: {
      simulationKey: 'plastic-journey',
      route: '/interactive/plastic-journey',
      instructionText: 'Quan sát điều gì xảy ra khi chai nhựa trôi ra biển.',
    },
  },
  {
    id: 'c1234567-89ab-4cde-8f01-234567890007',
    ownerId: null,
    isSeed: true,
    kind: 'simulation',
    templateKey: 'water-column',
    title: 'Khám phá tầng nước đại dương',
    description: 'Trượt qua các tầng nước để xem ánh sáng và sinh vật thay đổi theo độ sâu.',
    coverMediaId: null,
    coverUrl: '/assets/ocean/atlas-vertical-bg.jpg',
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['environment', 'species'],
    config: {
      simulationKey: 'water-column',
      route: '/learn/atlas',
      initialDepthMeters: 50,
      instructionText: 'Kéo thanh trượt độ sâu để ngắm các tầng nước biển.',
    },
  },
];

export const INITIAL_CREATIVE_TEMPLATES_FALLBACK: CreativeTemplateDto[] = [
  {
    id: 'd1234567-89ab-4cde-8f01-234567890001',
    ownerId: null,
    isSeed: true,
    kind: 'drawing',
    title: 'Vẽ bạn biển',
    description: 'Vẽ và trang trí sinh vật biển yêu thích của bé.',
    previewUrl: '/assets/generated/craft/craft_desk_art.jpg',
    mediaId: null,
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['species'],
    payload: {
      svgTemplate: 'turtle',
      instructionText: 'Vẽ và trang trí sinh vật biển yêu thích của bé.',
      suggestedColors: ['#DC6B52', '#17657A', '#2EE6CA', '#F59E0B', '#10B981', '#3B82F6'],
    },
  },
  {
    id: 'd1234567-89ab-4cde-8f01-234567890002',
    ownerId: null,
    isSeed: true,
    kind: 'drawing',
    title: 'Tô màu Cua biển',
    description: 'Tô màu chú cua biển có hai chiếc càng khỏe khoắn.',
    previewUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    mediaId: null,
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['species'],
    payload: {
      svgTemplate: 'crab',
      instructionText: 'Tô màu chú cua biển có hai chiếc càng khỏe khoắn.',
      suggestedColors: ['#EF4444', '#F97316', '#F59E0B', '#17657A'],
    },
  },
  {
    id: 'd1234567-89ab-4cde-8f01-234567890003',
    ownerId: null,
    isSeed: true,
    kind: 'drawing',
    title: 'Tô màu Cá hề',
    description: 'Tô màu bạn cá hề cam và rạn san hô.',
    previewUrl: '/assets/generated/creatures/clownfish_isolated.png',
    mediaId: null,
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['species'],
    payload: {
      svgTemplate: 'clownfish',
      instructionText: 'Tô màu bạn cá hề cam và rạn san hô.',
      suggestedColors: ['#F97316', '#FFFFFF', '#12384B', '#10B981'],
    },
  },
  {
    id: 'd1234567-89ab-4cde-8f01-234567890004',
    ownerId: null,
    isSeed: true,
    kind: 'habitat',
    title: 'Sa bàn: Vùng cỏ biển',
    description: 'Sắp xếp cỏ biển, đá và các bạn rùa xanh, cá hề.',
    previewUrl: '/assets/habitat/scene-seagrass.png',
    mediaId: null,
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['environment'],
    payload: {
      presetId: 1,
      instructionText: 'Sắp xếp cỏ biển, đá và các bạn rùa xanh, cá hề.',
    },
  },
  {
    id: 'd1234567-89ab-4cde-8f01-234567890005',
    ownerId: null,
    isSeed: true,
    kind: 'habitat',
    title: 'Sa bàn: Rạn đá san hô',
    description: 'Xây dựng rạn đá và san hô cho sinh vật biển trú ẩn.',
    previewUrl: '/assets/habitat/scene-reef.png',
    mediaId: null,
    visibility: 'published',
    schemaVersion: 1,
    version: 1,
    topicSlugs: ['environment', 'species'],
    payload: {
      presetId: 2,
      instructionText: 'Xây dựng rạn đá và san hô cho sinh vật biển trú ẩn.',
    },
  },
];

export const INITIAL_CREATIVE_MATERIALS_FALLBACK: CreativeMaterialDto[] = [
  {
    id: 'e1234567-89ab-4cde-8f01-234567890001',
    ownerId: null,
    isSeed: true,
    kind: 'stamp',
    title: 'Tem hình Cua biển',
    mediaId: null,
    mediaUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    visibility: 'published',
    version: 1,
    payload: { stampId: 'crab', defaultScale: 1.0 },
  },
  {
    id: 'e1234567-89ab-4cde-8f01-234567890002',
    ownerId: null,
    isSeed: true,
    kind: 'stamp',
    title: 'Tem hình Sao biển',
    mediaId: null,
    mediaUrl: '/assets/generated/r2-cutouts/starfish_cutout.png',
    visibility: 'published',
    version: 1,
    payload: { stampId: 'starfish', defaultScale: 1.0 },
  },
  {
    id: 'e1234567-89ab-4cde-8f01-234567890003',
    ownerId: null,
    isSeed: true,
    kind: 'stamp',
    title: 'Tem hình Cá hề',
    mediaId: null,
    mediaUrl: '/assets/generated/creatures/clownfish_isolated.png',
    visibility: 'published',
    version: 1,
    payload: { stampId: 'clownfish', defaultScale: 1.0 },
  },
  {
    id: 'e1234567-89ab-4cde-8f01-234567890004',
    ownerId: null,
    isSeed: true,
    kind: 'habitat_item',
    title: 'Cỏ biển cao',
    mediaId: null,
    mediaUrl: '/assets/habitat/seagrass-tall.png',
    visibility: 'published',
    version: 1,
    payload: { assetId: 'seagrass-tall', category: 'seagrass', itemType: 'seagrass', defaultScale: 1.2 },
  },
  {
    id: 'e1234567-89ab-4cde-8f01-234567890005',
    ownerId: null,
    isSeed: true,
    kind: 'habitat_item',
    title: 'Tảng đá lớn',
    mediaId: null,
    mediaUrl: '/assets/habitat/rock-large.png',
    visibility: 'published',
    version: 1,
    payload: { assetId: 'rock-large', category: 'rocks', itemType: 'rock', defaultScale: 1.3 },
  },
  {
    id: 'e1234567-89ab-4cde-8f01-234567890006',
    ownerId: null,
    isSeed: true,
    kind: 'habitat_item',
    title: 'Rùa biển xanh 3D',
    mediaId: null,
    mediaUrl: '/assets/habitat/turtle-green.png',
    visibility: 'published',
    version: 1,
    payload: { assetId: 'turtle-green', category: 'creatures', itemType: 'turtle', defaultScale: 1.2 },
  },
];

export async function fetchPublicActivities(
  params: {
    groupId?: string;
    kind?: string;
    topicIds?: string[];
    q?: string;
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<ActivityDto>> {
  const qs = buildQueryString({
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    groupId: params.groupId,
    topicIds: params.topicIds,
    q: params.q,
    cursor: params.cursor,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<ActivityDto>>(`/api/v1/activities${qs}`, { signal });
}

export async function fetchPublicActivityById(
  id: string,
  signal?: AbortSignal,
): Promise<ActivityDto> {
  return apiRequest<ActivityDto>(`/api/v1/activities/${encodeURIComponent(id)}`, { signal });
}

export async function fetchTeacherActivities(
  params: {
    groupId?: string;
    kind?: string;
    topicIds?: string[];
    q?: string;
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<ActivityDto>> {
  const qs = buildQueryString({
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    topicIds: params.topicIds,
    q: params.q,
    visibility: params.visibility && params.visibility !== 'all' ? params.visibility : undefined,
    source: params.source && params.source !== 'all' ? params.source : undefined,
    groupId: params.groupId,
    cursor: params.cursor,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<ActivityDto>>(`/api/v1/teacher/activities${qs}`, { signal });
}

export async function fetchTeacherActivityById(
  id: string,
  signal?: AbortSignal,
): Promise<ActivityDto> {
  return apiRequest<ActivityDto>(`/api/v1/teacher/activities/${encodeURIComponent(id)}`, { signal });
}

export async function createTeacherActivityApi(payload: {
  kind: 'game' | 'scenario' | 'simulation';
  templateKey: string;
  title: string;
  description?: string;
  config?: Record<string, unknown>;
  coverMediaId?: string | null;
  narrationMediaId?: string | null;
  topicSlugs?: string[];
  visibility?: 'draft' | 'published' | 'hidden';
}) {
  return apiRequest<ActivityDto>('/api/v1/teacher/activities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherActivityApi(
  id: string,
  payload: Partial<{
    title: string;
    description: string;
    templateKey: string;
    config: Record<string, unknown>;
    coverMediaId: string | null;
    narrationMediaId: string | null;
    topicSlugs: string[];
    visibility: 'draft' | 'published' | 'hidden';
    draftOnly: boolean;
  }>,
) {
  return apiRequest<ActivityDto>(`/api/v1/teacher/activities/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function duplicateTeacherActivityApi(id: string) {
  return apiRequest<ActivityDto>(`/api/v1/teacher/activities/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
}

export async function deleteTeacherActivityApi(id: string) {
  return apiRequest<{ deleted: boolean; id: string }>(
    `/api/v1/teacher/activities/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

export async function fetchPublicCreativeTemplates(
  params: {
    kind?: string;
    topicIds?: string[];
    q?: string;
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<CreativeTemplateDto>> {
  const qs = buildQueryString({
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    topicIds: params.topicIds,
    q: params.q,
    cursor: params.cursor,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<CreativeTemplateDto>>(`/api/v1/creative-templates${qs}`, { signal });
}

export async function fetchPublicCreativeMaterials(
  params: {
    kind?: string;
    q?: string;
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<CreativeMaterialDto>> {
  const qs = buildQueryString({
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    q: params.q,
    cursor: params.cursor,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<CreativeMaterialDto>>(`/api/v1/creative-materials${qs}`, { signal });
}

export async function fetchTeacherCreativeTemplates(
  params: {
    kind?: string;
    topicIds?: string[];
    q?: string;
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<CreativeTemplateDto>> {
  const qs = buildQueryString({
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    topicIds: params.topicIds,
    q: params.q,
    visibility: params.visibility && params.visibility !== 'all' ? params.visibility : undefined,
    source: params.source && params.source !== 'all' ? params.source : undefined,
    cursor: params.cursor,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<CreativeTemplateDto>>(`/api/v1/teacher/creative-templates${qs}`, {
    signal,
  });
}

export async function createTeacherCreativeTemplateApi(payload: {
  kind?: 'drawing' | 'habitat';
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
  mediaId?: string | null;
  topicSlugs?: string[];
  visibility?: 'draft' | 'published' | 'hidden';
}) {
  return apiRequest<CreativeTemplateDto>('/api/v1/teacher/creative-templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherCreativeTemplateApi(
  id: string,
  payload: Partial<{
    kind: 'drawing' | 'habitat';
    title: string;
    description: string;
    payload: Record<string, unknown>;
    mediaId: string | null;
    topicSlugs: string[];
    visibility: 'draft' | 'published' | 'hidden';
    expectedVersion: number;
  }>,
) {
  return apiRequest<CreativeTemplateDto>(
    `/api/v1/teacher/creative-templates/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function duplicateTeacherCreativeTemplateApi(id: string) {
  return apiRequest<CreativeTemplateDto>(
    `/api/v1/teacher/creative-templates/${encodeURIComponent(id)}/duplicate`,
    { method: 'POST' },
  );
}

export async function deleteTeacherCreativeTemplateApi(id: string) {
  return apiRequest<{ deleted: boolean; id: string }>(
    `/api/v1/teacher/creative-templates/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

export async function fetchTeacherCreativeMaterials(
  params: {
    kind?: string;
    q?: string;
    visibility?: string;
    source?: 'all' | 'owned' | 'seed';
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<CatalogPage<CreativeMaterialDto>> {
  const qs = buildQueryString({
    kind: params.kind && params.kind !== 'all' ? params.kind : undefined,
    q: params.q,
    visibility: params.visibility && params.visibility !== 'all' ? params.visibility : undefined,
    source: params.source && params.source !== 'all' ? params.source : undefined,
    cursor: params.cursor,
    limit: params.limit ?? 20,
  });
  return apiRequest<CatalogPage<CreativeMaterialDto>>(`/api/v1/teacher/creative-materials${qs}`, {
    signal,
  });
}

export async function createTeacherCreativeMaterialApi(payload: {
  kind?: 'stamp' | 'habitat_item';
  title: string;
  payload?: Record<string, unknown>;
  mediaId?: string | null;
  visibility?: 'draft' | 'published' | 'hidden';
}) {
  return apiRequest<CreativeMaterialDto>('/api/v1/teacher/creative-materials', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherCreativeMaterialApi(
  id: string,
  payload: Partial<{
    kind: 'stamp' | 'habitat_item';
    title: string;
    payload: Record<string, unknown>;
    mediaId: string | null;
    visibility: 'draft' | 'published' | 'hidden';
    expectedVersion: number;
  }>,
) {
  return apiRequest<CreativeMaterialDto>(
    `/api/v1/teacher/creative-materials/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteTeacherCreativeMaterialApi(id: string) {
  return apiRequest<{ deleted: boolean; id: string }>(
    `/api/v1/teacher/creative-materials/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

export const INITIAL_TOPICS_FALLBACK: TopicDto[] = [
  { id: '1', slug: 'species', title: 'Sinh vật', iconKey: 'fish', sortOrder: 1 },
  { id: '2', slug: 'environment', title: 'Môi trường', iconKey: 'waves', sortOrder: 2 },
  { id: '3', slug: 'conservation', title: 'Bảo vệ biển', iconKey: 'shield', sortOrder: 3 },
];

function normalizeModelDto(m: Model3DDto): Model3DDto & {
  status: 'draft' | 'published' | 'hidden';
  summary: string;
  thumbnailUrl: string;
  externalUid: string;
  slug: string;
} {
  const status: 'draft' | 'published' | 'hidden' =
    m.visibility === 'draft' || m.visibility === 'hidden' ? m.visibility : 'published';
  return {
    ...m,
    status,
    summary: m.summary ?? m.description ?? '',
    thumbnailUrl: m.thumbnailUrl || m.coverUrl || '/assets/generated/creatures/sea_turtle_card.jpg',
    externalUid: m.externalUid || m.modelUid,
    slug:
      m.slug ||
      (m.title.toLowerCase().includes('rùa')
        ? 'turtle'
        : m.title.toLowerCase().includes('cá hề')
          ? 'clownfish'
          : m.title.toLowerCase().includes('sao biển')
            ? 'starfish'
            : m.id),
  };
}

function normalizeActivityDto(a: ActivityDto): ActivityDto & {
  status: 'draft' | 'published' | 'hidden';
  summary: string;
  thumbnailUrl: string;
  configVersion: number;
} {
  const status: 'draft' | 'published' | 'hidden' =
    a.visibility === 'draft' || a.visibility === 'hidden' ? a.visibility : 'published';
  return {
    ...a,
    status,
    summary: a.summary ?? a.description ?? '',
    thumbnailUrl: a.thumbnailUrl || a.coverUrl || '/assets/generated/stations/station_hermit_crab.jpg',
    configVersion: a.configVersion ?? a.version ?? 1,
  };
}

function normalizeTemplateDto(t: CreativeTemplateDto): CreativeTemplateDto & {
  status: 'draft' | 'published' | 'hidden';
  thumbnailUrl: string;
  narrationUrl: string | null;
} {
  const status: 'draft' | 'published' | 'hidden' =
    t.visibility === 'draft' || t.visibility === 'hidden' ? t.visibility : 'published';
  return {
    ...t,
    status,
    thumbnailUrl: t.thumbnailUrl || t.previewUrl || '/assets/generated/craft/craft_desk_art.jpg',
    narrationUrl: t.narrationUrl ?? (t.payload?.narrationUrl as string) ?? null,
  };
}

function normalizeMaterialDto(m: CreativeMaterialDto): CreativeMaterialDto & {
  status: 'draft' | 'published' | 'hidden';
  thumbnailUrl: string;
  assetUrl: string;
  topicSlugs: string[];
} {
  const status: 'draft' | 'published' | 'hidden' =
    m.visibility === 'draft' || m.visibility === 'hidden' ? m.visibility : 'published';
  return {
    ...m,
    status,
    thumbnailUrl: m.thumbnailUrl || m.mediaUrl || '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    assetUrl: m.assetUrl || m.mediaUrl || '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
    topicSlugs: m.topicSlugs || ['species'],
  };
}

export async function fetchTopics(): Promise<TopicDto[]> {
  try {
    const res = await apiRequest<{ items: TopicDto[] }>('/api/v1/topics');
    if (Array.isArray(res?.items) && res.items.length > 0) {
      return res.items;
    }
  } catch {
    // Fallback below
  }
  return INITIAL_TOPICS_FALLBACK;
}

export async function fetchInteractiveModels() {
  try {
    const page = await fetchPublicModels({ limit: 30 });
    return (page.items || []).map(normalizeModelDto);
  } catch {
    return INITIAL_MODELS_FALLBACK.map(normalizeModelDto);
  }
}

export async function listTeacherModels(params?: {
  status?: string;
  source?: 'all' | 'owned' | 'seed';
  q?: string;
  cursor?: string;
  limit?: number;
}) {
  try {
    const page = await fetchTeacherModels({
      visibility: params?.status,
      source: params?.source,
      q: params?.q,
      cursor: params?.cursor,
      limit: params?.limit ?? 50,
    });
    return (page.items || []).map(normalizeModelDto);
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      throw err;
    }
    return INITIAL_MODELS_FALLBACK.map(normalizeModelDto);
  }
}

export async function deleteTeacherModel(id: string): Promise<boolean> {
  try {
    const res = await deleteTeacherModelApi(id);
    return Boolean(res?.deleted);
  } catch {
    return false;
  }
}

export async function publishTeacherModel(id: string) {
  try {
    const item = await updateTeacherModelApi(id, { visibility: 'published' });
    return { item: normalizeModelDto(item) };
  } catch (err: any) {
    return { errorMessage: err?.message || 'Không thể hiển thị mô hình 3D.' };
  }
}

export async function fetchInteractiveActivitiesPage(
  params?: {
    groupId?: string;
    kind?: string;
    topicIds?: string[];
    q?: string;
    cursor?: string;
    limit?: number;
  },
  signal?: AbortSignal,
) {
  try {
    const page = await fetchPublicActivities({
      kind: params?.kind,
      groupId: params?.groupId,
      topicIds: params?.topicIds,
      q: params?.q,
      cursor: params?.cursor,
      limit: params?.limit ?? 9,
    }, signal);
    return {
      items: (page.items || []).map(normalizeActivityDto),
      total: page.total,
      nextCursor: page.nextCursor ?? null,
    };
  } catch (err) {
    if (!isShowcaseContext()) {
      throw err;
    }
    return {
      items: INITIAL_ACTIVITIES_FALLBACK.map(normalizeActivityDto),
      total: INITIAL_ACTIVITIES_FALLBACK.length,
      nextCursor: null,
    };
  }
}

export async function fetchInteractiveActivities(params?: {
  kind?: string;
  topicIds?: string[];
  q?: string;
  cursor?: string;
  limit?: number;
}) {
  try {
    const collected: ReturnType<typeof normalizeActivityDto>[] = [];
    let cursor = params?.cursor;
    let pagesFetched = 0;
    const maxPages = params?.cursor ? 1 : 10;

    do {
      const page = await fetchPublicActivities({
        kind: params?.kind,
        topicIds: params?.topicIds,
        q: params?.q,
        cursor,
        limit: params?.limit ?? 30,
      });
      const mapped = (page.items || []).map(normalizeActivityDto);
      collected.push(...mapped);
      cursor = page.nextCursor || undefined;
      pagesFetched += 1;
    } while (cursor && pagesFetched < maxPages);

    return collected;
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      throw err;
    }
    return INITIAL_ACTIVITIES_FALLBACK.map(normalizeActivityDto);
  }
}

export async function fetchInteractiveActivityById(id: string) {
  try {
    const item = await fetchPublicActivityById(id);
    return normalizeActivityDto(item);
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      if (err.status === 404) return null;
      throw err;
    }
    const fallback = INITIAL_ACTIVITIES_FALLBACK.find((a) => a.id === id);
    return fallback ? normalizeActivityDto(fallback) : null;
  }
}

export async function listTeacherActivities(params?: {
  kind?: string;
  status?: string;
  source?: 'all' | 'owned' | 'seed';
  q?: string;
  cursor?: string;
  limit?: number;
}) {
  try {
    const collected: ReturnType<typeof normalizeActivityDto>[] = [];
    let cursor = params?.cursor;
    let pagesFetched = 0;
    const maxPages = params?.cursor ? 1 : 10;

    do {
      const page = await fetchTeacherActivities({
        kind: params?.kind,
        visibility: params?.status,
        source: params?.source,
        q: params?.q,
        cursor,
        limit: params?.limit ?? 50,
      });
      collected.push(...(page.items || []).map(normalizeActivityDto));
      cursor = page.nextCursor || undefined;
      pagesFetched += 1;
    } while (cursor && pagesFetched < maxPages);

    return collected;
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      throw err;
    }
    return INITIAL_ACTIVITIES_FALLBACK.map(normalizeActivityDto);
  }
}

export async function createTeacherActivity(payload: {
  kind: 'game' | 'scenario' | 'simulation';
  templateKey: string;
  title: string;
  summary?: string;
  description?: string;
  thumbnailUrl?: string;
  topicSlugs?: string[];
  config?: Record<string, unknown>;
  status?: 'draft' | 'published' | 'hidden';
  visibility?: 'draft' | 'published' | 'hidden';
  coverMediaId?: string | null;
}) {
  try {
    const created = await createTeacherActivityApi({
      kind: payload.kind,
      templateKey: payload.templateKey,
      title: payload.title,
      description: payload.description || payload.summary || '',
      config: payload.config,
      coverMediaId: payload.coverMediaId,
      topicSlugs: payload.topicSlugs,
      visibility: payload.visibility || payload.status || 'draft',
    });
    return normalizeActivityDto(created);
  } catch {
    return null;
  }
}

export async function updateTeacherActivity(
  id: string,
  payload: Partial<{
    title: string;
    summary: string;
    description: string;
    templateKey: string;
    thumbnailUrl: string;
    config: Record<string, unknown>;
    topicSlugs: string[];
    status: 'draft' | 'published' | 'hidden';
    visibility: 'draft' | 'published' | 'hidden';
    draftOnly: boolean;
    coverMediaId: string | null;
  }>,
) {
  try {
    const updated = await updateTeacherActivityApi(id, {
      title: payload.title,
      description: payload.description ?? payload.summary,
      templateKey: payload.templateKey,
      config: payload.config,
      draftOnly: payload.draftOnly,
      coverMediaId: payload.coverMediaId,
      topicSlugs: payload.topicSlugs,
      visibility: payload.visibility || payload.status,
    });
    return normalizeActivityDto(updated);
  } catch {
    return null;
  }
}

export async function publishTeacherActivity(id: string) {
  try {
    const updated = await updateTeacherActivityApi(id, { visibility: 'published' });
    return { item: normalizeActivityDto(updated) };
  } catch (err: any) {
    return { errorMessage: err?.message || 'Không thể hiển thị hoạt động.' };
  }
}

export async function cloneTeacherActivity(id: string) {
  try {
    const cloned = await duplicateTeacherActivityApi(id);
    return normalizeActivityDto(cloned);
  } catch {
    return null;
  }
}

export async function deleteTeacherActivity(id: string): Promise<boolean> {
  try {
    const res = await deleteTeacherActivityApi(id);
    return Boolean(res?.deleted);
  } catch {
    return false;
  }
}

export async function fetchCreativeTemplates() {
  try {
    const page = await fetchPublicCreativeTemplates({ limit: 30 });
    return (page.items || []).map(normalizeTemplateDto);
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      throw err;
    }
    return INITIAL_CREATIVE_TEMPLATES_FALLBACK.map(normalizeTemplateDto);
  }
}

export async function listTeacherCreativeTemplates() {
  try {
    const page = await fetchTeacherCreativeTemplates({ limit: 50 });
    return (page.items || []).map(normalizeTemplateDto);
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      throw err;
    }
    return INITIAL_CREATIVE_TEMPLATES_FALLBACK.map(normalizeTemplateDto);
  }
}

export async function createTeacherCreativeTemplate(payload: {
  kind?: 'drawing' | 'habitat';
  title: string;
  thumbnailUrl?: string;
  topicSlugs?: string[];
  narrationUrl?: string | null;
  config?: Record<string, unknown>;
  status?: 'draft' | 'published' | 'hidden';
}) {
  try {
    const saved = await createTeacherCreativeTemplateApi({
      kind: payload.kind,
      title: payload.title,
      payload: payload.config,
      topicSlugs: payload.topicSlugs,
      visibility: payload.status || 'published',
    });
    return normalizeTemplateDto({
      ...saved,
      thumbnailUrl: payload.thumbnailUrl || saved.previewUrl,
      narrationUrl: payload.narrationUrl ?? null,
    });
  } catch {
    return null;
  }
}

export async function updateTeacherCreativeTemplate(
  id: string,
  payload: Partial<{
    kind: 'drawing' | 'habitat';
    title: string;
    thumbnailUrl: string;
    topicSlugs: string[];
    narrationUrl: string | null;
    config: Record<string, unknown>;
    status: 'draft' | 'published' | 'hidden';
  }>,
) {
  try {
    const saved = await updateTeacherCreativeTemplateApi(id, {
      kind: payload.kind,
      title: payload.title,
      payload: payload.config,
      topicSlugs: payload.topicSlugs,
      visibility: payload.status,
    });
    return normalizeTemplateDto({
      ...saved,
      thumbnailUrl: payload.thumbnailUrl || saved.previewUrl,
      narrationUrl: payload.narrationUrl ?? null,
    });
  } catch {
    return null;
  }
}

export async function deleteTeacherCreativeTemplate(id: string): Promise<boolean> {
  try {
    const res = await deleteTeacherCreativeTemplateApi(id);
    return Boolean(res?.deleted);
  } catch {
    return false;
  }
}

export async function listTeacherCreativeMaterials() {
  try {
    const page = await fetchTeacherCreativeMaterials({ limit: 50 });
    return (page.items || []).map(normalizeMaterialDto);
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      throw err;
    }
    return INITIAL_CREATIVE_MATERIALS_FALLBACK.map(normalizeMaterialDto);
  }
}

export async function createTeacherCreativeMaterial(payload: {
  kind?: 'stamp' | 'habitat_item';
  title: string;
  assetUrl?: string;
  thumbnailUrl?: string;
  topicSlugs?: string[];
  config?: Record<string, unknown>;
  status?: 'draft' | 'published' | 'hidden';
}) {
  try {
    const saved = await createTeacherCreativeMaterialApi({
      kind: payload.kind,
      title: payload.title,
      payload: payload.config,
      visibility: payload.status || 'published',
    });
    return normalizeMaterialDto({
      ...saved,
      assetUrl: payload.assetUrl || saved.mediaUrl,
      thumbnailUrl: payload.thumbnailUrl || payload.assetUrl || saved.mediaUrl,
      topicSlugs: payload.topicSlugs || ['species'],
    });
  } catch {
    return null;
  }
}

export async function updateTeacherCreativeMaterial(
  id: string,
  payload: Partial<{
    kind: 'stamp' | 'habitat_item';
    title: string;
    assetUrl: string;
    thumbnailUrl: string;
    topicSlugs: string[];
    config: Record<string, unknown>;
    status: 'draft' | 'published' | 'hidden';
  }>,
) {
  try {
    const saved = await updateTeacherCreativeMaterialApi(id, {
      kind: payload.kind,
      title: payload.title,
      payload: payload.config,
      visibility: payload.status,
    });
    return normalizeMaterialDto({
      ...saved,
      assetUrl: payload.assetUrl || saved.mediaUrl,
      thumbnailUrl: payload.thumbnailUrl || payload.assetUrl || saved.mediaUrl,
      topicSlugs: payload.topicSlugs || ['species'],
    });
  } catch {
    return null;
  }
}

export async function deleteTeacherCreativeMaterial(id: string): Promise<boolean> {
  try {
    const res = await deleteTeacherCreativeMaterialApi(id);
    return Boolean(res?.deleted);
  } catch {
    return false;
  }
}

export async function fetchResourcesCatalog(params?: { limit?: number; cursor?: string }) {
  try {
    const page = await fetchPublicResources({
      limit: params?.limit ?? 24,
      cursor: params?.cursor,
    });
    return {
      ...page,
      items: (page.items || []).map((r) => ({
        ...r,
        thumbnailUrl: r.thumbnailUrl || r.coverUrl || '/assets/generated/creatures/sea_turtle_card.jpg',
      })),
    };
  } catch (err) {
    if (err instanceof ApiClientError && !isShowcaseContext()) {
      throw err;
    }
    return {
      items: INITIAL_RESOURCES_FALLBACK.map((r) => ({
        ...r,
        thumbnailUrl: r.thumbnailUrl || r.coverUrl || '/assets/generated/creatures/sea_turtle_card.jpg',
      })),
      nextCursor: null,
      total: INITIAL_RESOURCES_FALLBACK.length,
    };
  }
}
