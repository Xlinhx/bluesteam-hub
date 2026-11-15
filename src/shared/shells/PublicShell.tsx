import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { BlueSteamLogo } from '../ui/badges/BlueSteamLogo';
import { LanguageToggle } from '../ui/badges/LanguageToggle';
import { PublicLink } from '../ui/navigation/PublicLink';
import { Menu, X, BookOpen, Gamepad2, Palette, ArrowUpRight } from 'lucide-react';
import './PublicShell.css';

export interface PublicShellProps {
  children: ReactNode;
  activeNav?: 'resources' | 'interactive' | 'creative';
  variant?: 'landing' | 'default';
}

export function PublicShell({ children, activeNav, variant = 'default' }: PublicShellProps) {
  const { t } = useI18n();
  const landing = variant === 'landing';
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const items = [
    { key: 'resources', label: t('nav.public.resources'), path: '/resources', icon: BookOpen },
    { key: 'interactive', label: t('nav.public.interactive'), path: '/interactive', icon: Gamepad2 },
    { key: 'creative', label: t('nav.public.creative'), path: landing ? '/studio' : '/creative', icon: Palette },
  ] as const;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const returnFocus = trigger.current;
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>('a[href], button');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const closeOnDesktop = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', closeOnDesktop);
      returnFocus?.focus();
    };
  }, [open]);

  return (
    <div className={`public-shell ${landing ? 'public-shell--landing' : ''} min-h-screen flex flex-col`}>
      <a href="#public-main" className="public-skip-link">{t('common.skipToContent', 'Đến nội dung chính')}</a>
      <header className="public-header">
        <div className="public-header-inner">
          <PublicLink href="/" className="public-brand" aria-label="Về trang chủ Blue STEAM Hub"><BlueSteamLogo size="md" /></PublicLink>
          <nav className="public-desktop-nav" aria-label="Điều hướng công khai">
            {items.map(({ key, path, label, icon: Icon }) => (
              <PublicLink key={key} href={path} className="public-nav-link" aria-current={activeNav === key ? 'page' : undefined}>
                <Icon className="public-nav-icon" size={20} strokeWidth={1.6} aria-hidden="true" />
                <span className="public-nav-label">{label}</span>
              </PublicLink>
            ))}
          </nav>
          <div className="public-header-actions">
            <div className="public-language"><LanguageToggle compact={landing} /></div>
            {!landing && <PublicLink href="/login" className="public-login">{t('nav.public.login')}</PublicLink>}
            <PublicLink href="/entry" className="public-join">{t('nav.public.join')}<ArrowUpRight size={16} aria-hidden="true" /></PublicLink>
            <button ref={trigger} type="button" className="public-menu-trigger min-w-[48px] min-h-[48px]" onClick={() => setOpen(true)} aria-label="Mở menu điều hướng" aria-expanded={open} aria-controls="public-mobile-menu"><Menu size={23} /></button>
          </div>
        </div>
      </header>
      {open && <div className="public-drawer-backdrop" onClick={() => setOpen(false)}>
        <div ref={dialog} id="public-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu điều hướng" className="public-drawer" onClick={event => event.stopPropagation()}>
          <div className="public-drawer-heading"><BlueSteamLogo size="sm" /><button type="button" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={24} /></button></div>
          <nav aria-label="Menu di động">{items.map(({ key, label, path, icon: Icon }) => <PublicLink key={key} href={path} onClick={() => setOpen(false)}><Icon size={23} aria-hidden="true" />{label}<ArrowUpRight size={18} aria-hidden="true" /></PublicLink>)}</nav>
          {!landing && <PublicLink href="/login" onClick={() => setOpen(false)}>{t('nav.public.login')}</PublicLink>}
          <div className="public-drawer-bottom"><LanguageToggle /><PublicLink href="/entry" className="public-join" onClick={() => setOpen(false)}>{t('nav.public.join')}<ArrowUpRight size={16} aria-hidden="true" /></PublicLink></div>
        </div>
      </div>}
      <main id="public-main" className="flex-1 w-full" tabIndex={-1}>{children}</main>
    </div>
  );
}
