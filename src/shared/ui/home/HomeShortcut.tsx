import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import './home-hub.css';

export const HOME_ART = {
  model: '/assets/generated/home/home_3d_atelier_v2.jpg',
  resources: '/assets/generated/home/home_resources_atelier_v2.jpg',
  games: '/assets/generated/home/home_games_atelier_v2.jpg',
  creative: '/assets/generated/craft/craft_desk_art.jpg',
  teacher: '/assets/generated/home/home_teacher_shore_crab.jpg',
};

export function HomeShortcut({ label, image, icon: Icon, onClick }: {
  label: string; image: string; icon: LucideIcon; onClick: () => void;
}) {
  return <button type="button" onClick={onClick} className="home-shortcut" data-artwork="creative">
    <img src={image} alt="" decoding="async" />
    <span className="home-shortcut-label"><Icon size={24} /><span>{label}</span><ArrowUpRight className="home-shortcut-arrow" size={21} /></span>
  </button>;
}
