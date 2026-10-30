import type { ActivityKind, ActivityRuntimeCapabilities } from './types';

export interface ActivityTemplateDefinition {
  templateKey: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  capabilities: ActivityRuntimeCapabilities;
  dedicatedRoute?: string;
}

export const ACTIVITY_TEMPLATE_REGISTRY: Record<string, ActivityTemplateDefinition> = {
  sorting: {
    templateKey: 'sorting',
    kind: 'game',
    title: 'Phân loại',
    subtitle: 'Kéo thả vật thể về đúng nơi ở hoặc nhóm tương ứng',
    thumbnailUrl: '/assets/generated/stations/station_hermit_crab.jpg',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: true,
      allowsTeacherCreate: false,
    },
  },
  matching: {
    templateKey: 'matching',
    kind: 'game',
    title: 'Ghép cặp',
    subtitle: 'Nối 2 hình giống nhau hoặc ghép sinh vật với bóng hình',
    thumbnailUrl: '/assets/generated/creatures/thumb_fish_sort_gamelab.png',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: true,
      allowsTeacherCreate: false,
    },
  },
  choice: {
    templateKey: 'choice',
    kind: 'game',
    title: 'Chọn đáp án đúng',
    subtitle: 'Chạm chọn hình đúng theo câu hỏi âm thanh của cô',
    thumbnailUrl: '/assets/generated/creatures/green_turtle_hero.jpg',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: true,
      allowsTeacherCreate: false,
    },
  },
  scenario: {
    templateKey: 'scenario',
    kind: 'scenario',
    title: 'Tình huống nhánh',
    subtitle: 'Đặt bé vào tình huống thực tế và chọn cách ứng xử phù hợp',
    thumbnailUrl: '/assets/generated/simulations/sim_bottle_beach.png',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: true,
      allowsTeacherCreate: false,
    },
  },
  'rescue-mission': {
    templateKey: 'rescue-mission',
    kind: 'simulation',
    title: 'Hành trình giải cứu',
    subtitle: 'Mô phỏng chuyên biệt giải cứu rùa biển và làm sạch vùng vịnh',
    thumbnailUrl: '/assets/generated/simulations/sim_rescue_hero_full.png',
    dedicatedRoute: '/interactive/rescue-mission',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: false,
      allowsTeacherCreate: false,
    },
  },
  'plastic-journey': {
    templateKey: 'plastic-journey',
    kind: 'simulation',
    title: 'Hành trình chai nhựa',
    subtitle: 'Mô phỏng chuyên biệt đường đi của rác nhựa ra đại dương',
    thumbnailUrl: '/assets/generated/simulations/sim_plastic_journey.png',
    dedicatedRoute: '/interactive/plastic-journey',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: false,
      allowsTeacherCreate: false,
    },
  },
  'water-column': {
    templateKey: 'water-column',
    kind: 'simulation',
    title: 'Khám phá tầng nước đại dương',
    subtitle: 'Mô phỏng chuyên biệt trượt độ sâu qua các tầng nước biển',
    thumbnailUrl: '/assets/ocean/atlas-vertical-bg.jpg',
    dedicatedRoute: '/learn/atlas',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: false,
      allowsTeacherCreate: false,
    },
  },
  'my-action': {
    templateKey: 'my-action',
    kind: 'simulation',
    title: 'Hành động của em',
    subtitle: 'Mô phỏng chuyên biệt tác động tích cực của bé với bờ biển',
    thumbnailUrl: '/assets/generated/simulations/sim_coastal_bay_landscape.png',
    dedicatedRoute: '/interactive/my-action',
    capabilities: {
      supportsPresentation: true,
      supportsScoring: false,
      allowsTeacherCreate: false,
    },
  },
};

export function getActivityTemplateDefinition(templateKey: string): ActivityTemplateDefinition {
  const key = (templateKey || '').trim().toLowerCase();
  if (ACTIVITY_TEMPLATE_REGISTRY[key]) {
    return ACTIVITY_TEMPLATE_REGISTRY[key];
  }
  throw new Error(`Unsupported activity template: ${templateKey}`);
}
