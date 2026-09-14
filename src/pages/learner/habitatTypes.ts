/**
 * Data contracts and asset definitions for 3D Habitat Builder & Simulation Run
 * (Screens 28 & 29: /creative/habitat & /creative/habitat?mode=run)
 *
 * CRITICAL ARCHITECTURAL CONTRACT:
 * Build mode and Run mode share the EXACT same HabitatPlacedItem data structure.
 * Switching between modes NEVER resets, mutates, or drops placed objects or transforms.
 */

export interface HabitatPlacedItem {
  id: string;
  type: 'coral' | 'seagrass' | 'rock' | 'fish' | 'turtle' | 'anemone';
  assetId: string;
  nameVi: string;
  nameEn: string;
  x: number;          // Sandbed grid X coordinate (-7 to +7)
  y?: number;         // Elevation / height above sandbed (0 for benthic, >0 for swimmers)
  z: number;          // Sandbed grid Z coordinate (-4.5 to +4.5)
  rotation: number;   // Y-axis rotation in radians (0 to 2*PI)
  scale: number;      // Uniform scale multiplier (0.7 to 1.6)
  color?: string;     // Procedural tint or variation
}

export type HabitatToolType = 'move' | 'rotate' | 'zoom' | 'delete';
export type HabitatCategory = 'sand' | 'rocks' | 'seagrass' | 'creatures';

export interface AssetItemDef {
  id: string;
  category: HabitatCategory;
  type: 'coral' | 'seagrass' | 'rock' | 'fish' | 'turtle' | 'anemone';
  nameVi: string;
  nameEn: string;
  icon: string;
  defaultScale: number;
  descriptionVi: string;
}

export interface HabitatScenePreset {
  id: number;
  nameVi: string;
  nameEn: string;
  subTitleVi: string;
  subTitleEn: string;
  icon: string;
  items: HabitatPlacedItem[];
}

/**
 * Palette of assets available in the builder tray
 */
export const HABITAT_ASSET_PALETTE: Record<HabitatCategory, AssetItemDef[]> = {
  sand: [
    {
      id: 'sand-dune',
      category: 'sand',
      type: 'rock',
      nameVi: 'Gờ cát lượn',
      nameEn: 'Sand Ripple Dune',
      icon: '🏖️',
      defaultScale: 1.2,
      descriptionVi: 'Gờ cát mịn tạo hình thái dòng chảy đáy biển',
    },
    {
      id: 'sand-shell-patch',
      category: 'sand',
      type: 'rock',
      nameVi: 'Đốm vỏ sò cát',
      nameEn: 'Shell Scatter Patch',
      icon: '🐚',
      defaultScale: 0.9,
      descriptionVi: 'Mảnh vỏ sò vụn vỡ tự nhiên trên nền cát trắng',
    },
  ],
  rocks: [
    {
      id: 'rock-large',
      category: 'rocks',
      type: 'rock',
      nameVi: 'Tảng đá lớn',
      nameEn: 'Large Boulder',
      icon: '🪨',
      defaultScale: 1.3,
      descriptionVi: 'Khối đá hoa cương rạn vững chãi cho rêu và sinh vật bám',
    },
    {
      id: 'rock-small',
      category: 'rocks',
      type: 'rock',
      nameVi: 'Tảng đá nhỏ',
      nameEn: 'Small Stone',
      icon: '🪨',
      defaultScale: 0.8,
      descriptionVi: 'Đá cuội đáy biển thích hợp cho sinh vật nhỏ nấp',
    },
    {
      id: 'rock-cluster',
      category: 'rocks',
      type: 'rock',
      nameVi: 'Cụm đá',
      nameEn: 'Rock Cluster',
      icon: '⛰️',
      defaultScale: 1.1,
      descriptionVi: 'Quần thể đá rạn có hốc ngách tự nhiên',
    },
    {
      id: 'rock-flat',
      category: 'rocks',
      type: 'rock',
      nameVi: 'Đá phẳng',
      nameEn: 'Flat Ledge',
      icon: '🪨',
      defaultScale: 1.0,
      descriptionVi: 'Bề mặt phẳng đón ánh sáng mặt trời chiếu qua làn nước',
    },
  ],
  seagrass: [
    {
      id: 'seagrass-short',
      category: 'seagrass',
      type: 'seagrass',
      nameVi: 'Cỏ biển lùn',
      nameEn: 'Short Seagrass',
      icon: '🌱',
      defaultScale: 0.8,
      descriptionVi: 'Thảm cỏ non sát đáy, lọc nước biển và giữ cát',
    },
    {
      id: 'seagrass-tall',
      category: 'seagrass',
      type: 'seagrass',
      nameVi: 'Cỏ biển cao',
      nameEn: 'Tall Seagrass',
      icon: '🌿',
      defaultScale: 1.2,
      descriptionVi: 'Cỏ biển dài mượt đung đưa theo dòng hải lưu',
    },
    {
      id: 'seagrass-cluster',
      category: 'seagrass',
      type: 'seagrass',
      nameVi: 'Cỏ biển cụm',
      nameEn: 'Clustered Seagrass',
      icon: '🌾',
      defaultScale: 1.0,
      descriptionVi: 'Bụi cỏ biển rậm rạp che chở trứng cá và sinh vật ấu trùng',
    },
    {
      id: 'seagrass-spread',
      category: 'seagrass',
      type: 'seagrass',
      nameVi: 'Cỏ biển rải',
      nameEn: 'Spreading Seagrass',
      icon: '🍃',
      defaultScale: 1.1,
      descriptionVi: 'Thảm cỏ trải rộng tạo đồng cỏ ngập nước xanh tươi',
    },
    {
      id: 'rock-algae',
      category: 'seagrass',
      type: 'seagrass',
      nameVi: 'Tảo bám đá',
      nameEn: 'Rock Algae',
      icon: '🪨',
      defaultScale: 0.9,
      descriptionVi: 'Tảo diệp lục bám chặt vào bề mặt đá tạo thức ăn cho rùa biển',
    },
    {
      id: 'seagrass-broad',
      category: 'seagrass',
      type: 'seagrass',
      nameVi: 'Cỏ biển lá rộng',
      nameEn: 'Broadleaf Grass',
      icon: '🌿',
      defaultScale: 1.15,
      descriptionVi: 'Phiến lá bản rộng quang hợp mạnh mẽ',
    },
    {
      id: 'seagrass-curly',
      category: 'seagrass',
      type: 'seagrass',
      nameVi: 'Cỏ biển xoắn',
      nameEn: 'Curly Seagrass',
      icon: '🌱',
      defaultScale: 1.0,
      descriptionVi: 'Lá uốn lượn mềm mại như dải lụa dưới sóng',
    },
  ],
  creatures: [
    {
      id: 'turtle-green',
      category: 'creatures',
      type: 'turtle',
      nameVi: 'Rùa biển xanh',
      nameEn: 'Green Sea Turtle',
      icon: '🐢',
      defaultScale: 1.2,
      descriptionVi: 'Bò sát biển ăn cỏ biển, bơi lội tuần hoàn trong rạn san hô',
    },
    {
      id: 'clownfish',
      category: 'creatures',
      type: 'fish',
      nameVi: 'Cá hề sọc cam',
      nameEn: 'Clownfish',
      icon: '🐠',
      defaultScale: 0.75,
      descriptionVi: 'Cá rạn biển thông minh cộng sinh với hải quỳ',
    },
    {
      id: 'sea-anemone',
      category: 'creatures',
      type: 'anemone',
      nameVi: 'Hải quỳ mềm',
      nameEn: 'Sea Anemone',
      icon: '🪸',
      defaultScale: 1.0,
      descriptionVi: 'Động vật hình hoa có xúc tu bảo vệ bạn cá hề',
    },
    {
      id: 'coral-branch',
      category: 'creatures',
      type: 'coral',
      nameVi: 'San hô nhánh',
      nameEn: 'Staghorn Coral',
      icon: '🪸',
      defaultScale: 1.1,
      descriptionVi: 'Khung xương canxi vững chắc xây dựng tổ ấm đại dương',
    },
  ],
};

/**
 * Standard starter preset matching bluesteam-v2-creative-habitat-build.png & bluesteam-v2-creative-habitat-run.png
 */
export const DEFAULT_HABITAT_ITEMS: HabitatPlacedItem[] = [
  // Center large rock formation with algae and warning alert pin
  { id: 'item-rock-center', type: 'rock', assetId: 'rock-large', nameVi: 'Tảng đá lớn trung tâm', nameEn: 'Center Boulder', x: 2.2, z: 0.4, rotation: 0.3, scale: 1.45 },
  { id: 'item-rock-cluster-bg', type: 'rock', assetId: 'rock-cluster', nameVi: 'Cụm đá hậu cảnh', nameEn: 'Background Rock Cluster', x: -3.8, z: -2.2, rotation: -0.4, scale: 1.3 },
  { id: 'item-rock-small-1', type: 'rock', assetId: 'rock-small', nameVi: 'Đá cuội nhỏ', nameEn: 'Small Stone', x: -1.2, z: 1.8, rotation: 0.8, scale: 0.85 },
  { id: 'item-rock-flat-right', type: 'rock', assetId: 'rock-flat', nameVi: 'Đá phẳng rạn phải', nameEn: 'Right Flat Ledge', x: 4.8, z: -1.8, rotation: 1.1, scale: 1.25 },
  { id: 'item-rock-pebbles', type: 'rock', assetId: 'rock-small', nameVi: 'Cụm sỏi tiền cảnh', nameEn: 'Pebble Cluster', x: -0.5, z: 3.2, rotation: 0.2, scale: 0.7 },

  // Lush seagrass patches
  { id: 'item-seagrass-tall-active', type: 'seagrass', assetId: 'seagrass-tall', nameVi: 'Cỏ biển cao', nameEn: 'Tall Seagrass', x: 1.5, z: -1.8, rotation: 0.15, scale: 1.2 },
  { id: 'item-seagrass-left-back', type: 'seagrass', assetId: 'seagrass-tall', nameVi: 'Cỏ biển cao rậm', nameEn: 'Tall Seagrass Patch', x: -4.5, z: -1.2, rotation: 0.5, scale: 1.3 },
  { id: 'item-seagrass-left-front', type: 'seagrass', assetId: 'seagrass-short', nameVi: 'Cỏ biển lùn ven', nameEn: 'Short Seagrass Edge', x: -4.8, z: 1.2, rotation: -0.2, scale: 0.9 },
  { id: 'item-seagrass-center-front', type: 'seagrass', assetId: 'seagrass-cluster', nameVi: 'Cỏ biển cụm', nameEn: 'Clustered Seagrass', x: -2.5, z: 2.1, rotation: 0.4, scale: 1.1 },
  { id: 'item-seagrass-right-mid', type: 'seagrass', assetId: 'seagrass-broad', nameVi: 'Cỏ biển lá rộng', nameEn: 'Broadleaf Grass', x: 3.6, z: 2.3, rotation: -0.6, scale: 1.15 },
  { id: 'item-seagrass-near-rock', type: 'seagrass', assetId: 'seagrass-spread', nameVi: 'Cỏ biển rải kề đá', nameEn: 'Spreading Seagrass', x: 1.1, z: 1.4, rotation: 0.35, scale: 1.0 },

  // Corals and Anemones
  { id: 'item-coral-branch-1', type: 'coral', assetId: 'coral-branch', nameVi: 'San hô gạc nai', nameEn: 'Staghorn Coral', x: 4.2, z: 0.5, rotation: -0.2, scale: 1.0 },
  { id: 'item-anemone-1', type: 'anemone', assetId: 'sea-anemone', nameVi: 'Hải quỳ rực rỡ', nameEn: 'Sea Anemone', x: 3.4, z: -0.8, rotation: 0.0, scale: 0.95 },

  // Living creatures (swimming path participants)
  { id: 'item-turtle-main', type: 'turtle', assetId: 'turtle-green', nameVi: 'Rùa biển xanh bơi lội', nameEn: 'Swimming Green Turtle', x: -1.2, y: 1.6, z: 0.2, rotation: -0.4, scale: 1.25 },
  { id: 'item-fish-clownfish-1', type: 'fish', assetId: 'clownfish', nameVi: 'Cá hề sọc cam', nameEn: 'Clownfish', x: 2.8, y: 0.8, z: -0.2, rotation: 0.6, scale: 0.8 },
  { id: 'item-fish-clownfish-2', type: 'fish', assetId: 'clownfish', nameVi: 'Cá hề con', nameEn: 'Baby Clownfish', x: 3.8, y: 1.1, z: 1.2, rotation: -0.8, scale: 0.65 },
];

export const HABITAT_SCENE_PRESETS: HabitatScenePreset[] = [
  {
    id: 1,
    nameVi: 'Cảnh 1',
    nameEn: 'Scene 1',
    subTitleVi: 'Vùng cỏ biển',
    subTitleEn: 'Seagrass Meadow',
    icon: '🌿',
    items: DEFAULT_HABITAT_ITEMS,
  },
  {
    id: 2,
    nameVi: 'Cảnh 2',
    nameEn: 'Scene 2',
    subTitleVi: 'Rạn đá',
    subTitleEn: 'Rocky Reef',
    icon: '🪨',
    items: [
      { id: 'sc2-rock-main', type: 'rock', assetId: 'rock-large', nameVi: 'Tảng đá chính', nameEn: 'Main Rock', x: 0, z: 0, rotation: 0, scale: 1.6 },
      { id: 'sc2-rock-left', type: 'rock', assetId: 'rock-cluster', nameVi: 'Cụm đá trái', nameEn: 'Left Rocks', x: -3.5, z: -1, rotation: 0.8, scale: 1.3 },
      { id: 'sc2-rock-right', type: 'rock', assetId: 'rock-flat', nameVi: 'Đá phẳng phải', nameEn: 'Right Ledge', x: 3.5, z: 1, rotation: -0.5, scale: 1.2 },
      { id: 'sc2-coral-1', type: 'coral', assetId: 'coral-branch', nameVi: 'San hô gạc nai', nameEn: 'Coral Branch', x: 1.5, z: -1.5, rotation: 0.2, scale: 1.1 },
      { id: 'sc2-turtle', type: 'turtle', assetId: 'turtle-green', nameVi: 'Rùa biển xanh', nameEn: 'Green Turtle', x: -1, y: 1.5, z: 1, rotation: 0.4, scale: 1.2 },
    ],
  },
  {
    id: 3,
    nameVi: 'Cảnh 3',
    nameEn: 'Scene 3',
    subTitleVi: 'Vùng cát trống',
    subTitleEn: 'Open Sandbed',
    icon: '🏖️',
    items: [
      { id: 'sc3-rock-small', type: 'rock', assetId: 'rock-small', nameVi: 'Đá cuội', nameEn: 'Pebble', x: 1.5, z: 1, rotation: 0.2, scale: 0.8 },
      { id: 'sc3-seagrass-sparse', type: 'seagrass', assetId: 'seagrass-short', nameVi: 'Cỏ non', nameEn: 'Sprout', x: -2, z: -1, rotation: 0.5, scale: 0.9 },
      { id: 'sc3-clownfish', type: 'fish', assetId: 'clownfish', nameVi: 'Cá hề', nameEn: 'Clownfish', x: 0, y: 1.2, z: 0, rotation: 0, scale: 0.8 },
    ],
  },
];
