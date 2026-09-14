export type ConceptId = 'concept-a' | 'concept-b' | 'concept-c';

export interface ConceptMeta {
  id: ConceptId;
  shortKey: 'a' | 'b' | 'c';
  title: string;
  subtitle: string;
  tagline: string;
  heroCreature: string;
  pedagogicalFocus: string;
  visualLanguage: string;
  mockupUrl: string;
  colorScheme: string;
}

export const CONCEPTS: Record<ConceptId, ConceptMeta> = {
  'concept-a': {
    id: 'concept-a',
    shortKey: 'a',
    title: 'Phương án A — Khám Phá Điện Ảnh',
    subtitle: 'Khám phá điện ảnh (Cinematic Discovery) · Chìm sâu theo phương thẳng đứng',
    tagline: 'Một cách học sâu sắc hơn',
    heroCreature: 'Cá voi lưng gù khổng lồ uốn lượn dưới đường chân nước (Waterline Split-View)',
    pedagogicalFocus: 'Lặn sâu liên tục qua các tầng nước: Mặt nước → Nắng → Hoàng hôn → Thẳm sâu → Lớp học 4K',
    visualLanguage: 'Đường cong sóng hữu cơ mềm mại, độ thở lớn, ánh sáng thể tích caustics rực rỡ',
    mockupUrl: '/concepts/concept-a.jpg',
    colorScheme: 'Xanh ngọc bích sang xanh thẳm biển sâu, viền sóng tự nhiên',
  },
  'concept-b': {
    id: 'concept-b',
    shortKey: 'b',
    title: 'Phương án B — Bản Đồ Tri Thức Sống',
    subtitle: 'Bản đồ tri thức sống (Scientific Living Atlas) · Bách khoa toàn thư tương tác',
    tagline: 'Tập bản đồ sống cho những tâm trí tò mò',
    heroCreature: 'Cá voi bơi nghiêng kèm nhãn danh pháp Megaptera novaeangliae & cột trắc diện 0 - 6.000m+',
    pedagogicalFocus: 'Phân loại học thuật & 5 tab hệ sinh thái biển, tiêu bản rạn san hô, bàn chỉ huy giáo viên soạn bài',
    visualLanguage: 'Lưới biên tập trắc lượng, đường kẻ tóc mỏng, nhãn dữ liệu khoa học, mật độ thông tin cao',
    mockupUrl: '/concepts/concept-b.jpg',
    colorScheme: 'Xanh lam thẫm hoàng hôn, trắc diện độ sâu vật lý, phân tầng rõ nét',
  },
  'concept-c': {
    id: 'concept-c',
    shortKey: 'c',
    title: 'Phương án C — Hệ Sinh Thái Lớp Học',
    subtitle: 'Hệ sinh thái lớp học (Living Learning System) · Vòng đời sư phạm 3 bước thực chiến',
    tagline: 'Đại dương thật. Học tập thật. Thay đổi thật.',
    heroCreature: 'Cá voi sát thủ Orca 3D lao dốc chéo góc, động lực học cao, bọt khí sống động',
    pedagogicalFocus: 'Trẻ chạm tương tác rùa biển 3D → Bàn chỉ huy giáo viên Live Telemetry 24 học sinh → Lớp học chung 4K',
    visualLanguage: 'Module công nghệ bo tròn mềm mại, live poll thời gian thực, 3 thẻ cửa ngõ chân trang lớn',
    mockupUrl: '/concepts/concept-c.jpg',
    colorScheme: 'Xanh đại dương công nghệ, ngọc bích bọt biển, điểm nhấn tương tác trực tiếp',
  },
};
