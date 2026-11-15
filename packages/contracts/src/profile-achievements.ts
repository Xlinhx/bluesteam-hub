export const profileBadgeCatalog = [
  { id: 'species-1', artwork: 'badge-explore-1.webp', family: 'explore', target: 1, title: 'Chạm biển', unit: 'sinh vật khác nhau đã ghi vào sổ' },
  { id: 'species-5', artwork: 'badge-explore-2.webp', family: 'explore', target: 5, title: 'Bạn của biển', unit: 'sinh vật khác nhau đã ghi vào sổ' },
  { id: 'species-10', artwork: 'badge-explore-3.webp', family: 'explore', target: 10, title: 'Sổ tay đại dương', unit: 'sinh vật khác nhau đã ghi vào sổ' },
  { id: 'games-1', artwork: 'badge-interact-1.webp', family: 'interact', target: 1, title: 'Chơi cùng biển', unit: 'game khác nhau có thao tác hợp lệ' },
  { id: 'games-3', artwork: 'badge-interact-2.webp', family: 'interact', target: 3, title: 'Thử sức', unit: 'game khác nhau có thao tác hợp lệ' },
  { id: 'games-5', artwork: 'badge-interact-3.webp', family: 'interact', target: 5, title: 'Khéo tay khám phá', unit: 'game khác nhau có thao tác hợp lệ' },
  { id: 'creations-1', artwork: 'badge-create-1.webp', family: 'create', target: 1, title: 'Món quà đầu tiên', unit: 'sản phẩm khác nhau đã gửi vào lớp' },
  { id: 'creations-3', artwork: 'badge-create-2.webp', family: 'create', target: 3, title: 'Sắc màu của bé', unit: 'sản phẩm khác nhau đã gửi vào lớp' },
  { id: 'creations-5', artwork: 'badge-create-3.webp', family: 'create', target: 5, title: 'Xưởng biển nhỏ', unit: 'sản phẩm khác nhau đã gửi vào lớp' },
] as const;

export type ProfileBadgeRule = {
  id: string;
  family: 'explore' | 'interact' | 'create';
  target: number;
  title: string;
  unit: string;
  artwork?: string;
};
export type ProfileBadge = ProfileBadgeRule & {
  count: number;
  earnedAt: string | null;
  version: number;
  evidence?: { id:string; at:string; title:string; href?:string }[];
};
export type ProfileRecord = { id: string; title: string; image: string | null; at: string; family: 'explore' | 'interact' | 'create'; href?: string };
export type ProfileEvidence = { species: ProfileRecord[]; games: ProfileRecord[]; creations: ProfileRecord[]; badges: ProfileBadge[]; timeline: ProfileRecord[] };
