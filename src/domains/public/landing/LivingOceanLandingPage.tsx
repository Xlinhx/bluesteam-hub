import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Gamepad2, Palette } from 'lucide-react';
import { PublicShell } from '../../../shared/shells/PublicShell';
import { PublicLink } from '../../../shared/ui/navigation/PublicLink';
import { BlueSteamLogo } from '../../../shared/ui/badges/BlueSteamLogo';
import { useI18n } from '../../../shared/i18n/I18nContext';
import { OceanComparison } from './OceanComparison';
import { ShellStudy, JellyfishStudy } from './NaturalHistoryDrawings';
import { usePublicMotion } from '../components/usePublicMotion';
import './landing.css';

const ASSETS = '/assets/generated/landing-chibi/';

function Artwork({ name, alt, className = '', eager = false }: { name: string; alt: string; className?: string; eager?: boolean }) {
  return <img className={className} src={`${ASSETS}${name}-1600.webp`} srcSet={`${ASSETS}${name}-800.webp 800w, ${ASSETS}${name}-1600.webp 1600w`} sizes="(max-width: 700px) 100vw, 70vw" width="1536" height="1024" alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" />;
}

export function LivingOceanLandingPage() {
  const { locale } = useI18n();
  const english = locale === 'en';
  const root = useRef<HTMLDivElement>(null);
  const [activeStudy, setActiveStudy] = useState<string | null>(null);
  usePublicMotion(root, 'landing');

  const destinations = [
    { key: 'resources', path: '/resources', label: english ? 'Learning resources' : 'Học liệu', description: english ? 'A closer look at the living world.' : 'Mở ra thế giới sinh vật.', icon: BookOpen },
    { key: 'interactive', path: '/interactive', label: english ? 'Interact' : 'Tương tác', description: english ? 'Explore through experiments and play.' : 'Khám phá qua chơi và thử nghiệm.', icon: Gamepad2 },
    { key: 'creative', path: '/studio', label: english ? 'Create' : 'Sáng tạo', description: english ? 'Give your imagination a new shape.' : 'Cho trí tưởng tượng một hình hài.', icon: Palette },
  ];

  return <PublicShell variant="landing">
    <div ref={root} className="editorial-landing">
      <div className="landing-ocean">
      <section className="landing-hero" aria-labelledby="landing-title" data-artwork-drift>
        <div className="landing-hero-art"><ShellStudy /><Artwork name="hero" eager className="landing-hero-object" alt={english ? 'A pearlescent nautilus shell, chibi shark and small fish' : 'Vỏ ốc anh vũ ánh xà cừ, cá mập chibi và đàn cá nhỏ'} /></div>
        <div className="landing-content landing-hero-copy">
          <h1 id="landing-title">{english ? <>One ocean. <br />Endless discoveries.</> : <>Một đại dương. <br />Muôn cách khám phá.</>}</h1>
          <p>{english ? 'Resources, interaction and creativity.' : 'Học liệu, tương tác và sáng tạo.'}</p>
          <a className="landing-text-link" href="#discover">{english ? 'Discover Blue STEAM Hub' : 'Khám phá Blue STEAM Hub'}<ArrowRight size={27} strokeWidth={1.3} aria-hidden="true" /></a>
        </div>
      </section>

      <section id="discover" className="landing-discover" aria-labelledby="discover-title" data-study={activeStudy ?? 'rest'}>
        <div className="landing-jelly-scene" aria-hidden="true"><Artwork name="jellyfish" alt="" /><JellyfishStudy /></div>
        <div className="landing-content landing-discover-content">
          <div className="landing-discover-copy">
            <h2 id="discover-title">{english ? <>Look closer.<br />Understand more.</> : <>Nhìn gần. Hiểu sâu.</>}</h2>
            <div className="landing-destinations" onMouseLeave={() => setActiveStudy(null)}>
              {destinations.map(({ key, path, label, description, icon: Icon }) => <PublicLink key={key} href={path} className="landing-destination" onMouseEnter={() => setActiveStudy(key)} onFocus={() => setActiveStudy(key)} onBlur={() => setActiveStudy(null)}>
                <Icon className="destination-icon" size={30} strokeWidth={1.25} aria-hidden="true" />
                <span><strong>{label}</strong><small>{description}</small></span><ArrowRight className="destination-arrow" size={23} strokeWidth={1.2} aria-hidden="true" />
              </PublicLink>)}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-imagination" aria-labelledby="imagination-title">
        <div className="landing-content"><h2 id="imagination-title">{english ? 'From real life, to imagination.' : 'Từ thật, đến tưởng tượng.'}</h2></div>
        <OceanComparison english={english} />
      </section>

      <section className="landing-together" aria-labelledby="together-title" data-artwork-drift>
        <div className="landing-content landing-together-content">
          <div className="landing-together-copy">
            <h2 id="together-title">{english ? <>A wider world. <br />Discovered together.</> : <>Cùng nhau <br />mở rộng thế giới.</>}</h2>
            <p>{english ? 'Explore, connect and learn through experience.' : 'Khám phá, kết nối và học qua trải nghiệm.'}</p>
            <PublicLink href="/entry" className="public-join">{english ? 'Start exploring' : 'Bắt đầu khám phá'}<ArrowRight size={23} strokeWidth={1.2} aria-hidden="true" /></PublicLink>
          </div>
          <Artwork name="knowledge" className="landing-knowledge-object" alt={english ? 'Chibi whale and coral, with a diagram connecting books and creativity' : 'Cá voi chibi, san hô và sơ đồ kết nối học liệu với sáng tạo'} />
          <svg className="landing-connection" viewBox="0 0 1000 160" fill="none" aria-hidden="true"><path d="M20 35C180-5 200 160 390 110S540 140 680 60 835 50 980 20" stroke="currentColor" strokeWidth="1.2" pathLength="1" strokeDasharray="1" /><path pathLength="1" strokeDasharray="1" d="m25 30-8 6 11 2" stroke="currentColor" /></svg>
        </div>
      </section>
      </div>
      <footer className="landing-footer"><div className="landing-content"><PublicLink href="/" aria-label="Blue STEAM Hub"><BlueSteamLogo size="sm" /></PublicLink><span>{english ? 'Learn with the ocean.' : 'Học cùng đại dương.'}</span><PublicLink href="/entry">{english ? 'Explore together' : 'Cùng khám phá'}<ArrowUpRight size={16} aria-hidden="true" /></PublicLink></div></footer>
    </div>
  </PublicShell>;
}
