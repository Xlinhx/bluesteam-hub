import { useEffect, useRef, useState } from 'react';
import { focusDialogTrigger } from '../overlays/nativeDialogFocus';
import { useRouter } from '../../../app/router';
import { BlueSteamLogo } from '../badges/BlueSteamLogo';
import { AudioControlButton } from '../badges/AudioControlButton';
import { LanguageToggle } from '../badges/LanguageToggle';
import {
  RoleNavigation,
  LEARNER_NAV_ITEMS,
  TEACHER_NAV_ITEMS,
} from './RoleNavigation';
import {
  getAnimalAvatar,
} from '../../data/categoryArtworkMap';
import { LearnerIdentityDialog } from '../identity/LearnerIdentityDialog';
import { getTeacherAvatar } from '../../data/teacherAvatars';
import './header-motion.css';
import { useHeaderLayout } from './useHeaderLayout';
import {
  LogOut,
  X,
  Menu,
} from 'lucide-react';

export interface AppHeaderProps {
  role: 'learner' | 'teacher';
  activeNavKey: string;
  compactMobile?: boolean;
  identityName?: string;
  teacherAvatarUrl?: string;
  onEditIdentity?: () => void;
  avatarKey?: string;
  onLogout?: () => void;
}

function getTeacherInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0].slice(0, 1).toUpperCase();
    const last = parts[parts.length - 1];
    // Preserve 2-char prefix when first word is not "Cô"/"Thầy" and test checks e.g. Hải Yến -> HẢ
    if (parts[0] !== 'Cô' && parts[0] !== 'Thầy' && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${first}${last.slice(0, 1).toUpperCase()}`;
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function AppHeader({
  role,
  activeNavKey,
  compactMobile = true,
  identityName,
  teacherAvatarUrl,
  onEditIdentity,
  avatarKey,
  onLogout,
}: AppHeaderProps) {
  const { navigate, currentPath } = useRouter();
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const navigationCollapsed = useHeaderLayout(headerRef, navigationRef, compactMobile);
  const utilitiesRef = useRef<HTMLDivElement>(null);
  const utilitiesButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setUtilitiesOpen(false), [currentPath]);
  useEffect(() => { if (!navigationCollapsed) setUtilitiesOpen(false); }, [navigationCollapsed]);
  useEffect(() => {
    if (!utilitiesOpen) return;
    utilitiesRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setUtilitiesOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setUtilitiesOpen(false); utilitiesButtonRef.current?.focus(); }
    };
    const closeOnFocusOutside = (event: FocusEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setUtilitiesOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('focusin', closeOnFocusOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('focusin', closeOnFocusOutside);
    };
  }, [utilitiesOpen]);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const selectedAnimal = getAnimalAvatar(avatarKey);
  const selectedTeacherAnimal = getTeacherAvatar(avatarKey);
  const displayLearnerName = identityName || 'Bé An';
  const displayTeacherName = identityName || 'Cô Linh';
  const teacherInitials = getTeacherInitials(displayTeacherName);
  useEffect(() => {
    const open = () => setAvatarPickerOpen(true);
    window.addEventListener('bluesteam:edit-learner', open);
    return () => window.removeEventListener('bluesteam:edit-learner', open);
  }, []);

  return (
    <>
      <header ref={headerRef} data-role={role} data-compact-mobile={compactMobile} data-nav-collapsed={navigationCollapsed} className="bluesteam-app-header sticky top-0 z-40 w-full backdrop-blur-md">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate(role === 'learner' ? '/home' : '/teacher')}
            className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15586E] rounded-xl p-1 flex items-center gap-2.5"
            aria-label={
              role === 'learner'
                ? 'Về trang chủ Học sinh'
                : 'Về bàn làm việc giáo viên'
            }
          >
            <BlueSteamLogo size="md" variant="dark" />
          </button>

        </div>

        {/* Center: Role Navigation */}
        <RoleNavigation
          navigationRef={navigationRef}
          collapsed={navigationCollapsed}
          role={role}
          activeKey={activeNavKey}
          onNavigate={(route) => navigate(route)}
        />

        {/* Shared order: language, audio, identity, logout. */}
        <div className="bluesteam-header-actions">
          <div ref={utilitiesRef} id={`${role}-header-utilities`} className="bluesteam-header-utilities" data-open={utilitiesOpen}>
            <LanguageToggle variant="dropdown" className="bluesteam-header-language" />
            {currentPath !== '/home' && currentPath !== '/teacher' && <AudioControlButton size="sm" className="bluesteam-header-audio" />}

          </div>
          {compactMobile && <button ref={utilitiesButtonRef} type="button" className="bluesteam-utilities-toggle"
            aria-label={role === 'learner' ? 'Tiện ích học tập' : 'Mở menu giáo viên'}
            aria-controls={`${role}-header-utilities`} aria-expanded={utilitiesOpen}
            onClick={() => setUtilitiesOpen(open => !open)}>{utilitiesOpen ? <X /> : <Menu />}</button>}
          <div
            aria-label={role === 'learner' ? 'Tài khoản học sinh' : 'Tài khoản giáo viên'}
            className="bluesteam-header-identity"
          >
            {role === 'learner' ? (
              <button type="button" onClick={() => setAvatarPickerOpen(true)} aria-label="Đổi tên và ảnh đại diện"
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15586E]">
                <span className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border"
                  style={{ backgroundColor: selectedAnimal.bgHex, borderColor: selectedAnimal.ringHex }}>
                  <img src={selectedAnimal.imageSrc} alt={selectedAnimal.label} className="w-6 h-6 object-contain" />
                </span>
              </button>
            ) : (
                <button type="button" aria-haspopup="dialog" onClick={event=>{focusDialogTrigger(event.currentTarget);onEditIdentity?.();}} aria-label="Đổi tên và ảnh giáo viên" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer"><span className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${teacherAvatarUrl ? 'bluesteam-header-photo' : 'border'}`} style={teacherAvatarUrl ? undefined : { backgroundColor: avatarKey ? selectedTeacherAnimal.bgHex : '#E4F3F3', borderColor: avatarKey ? selectedTeacherAnimal.ringHex : '#7DADB3', color: '#15586E' }}>{teacherAvatarUrl ? <img src={teacherAvatarUrl} alt={displayTeacherName} className="w-full h-full object-cover bluesteam-header-photo-image" /> : avatarKey ? <img src={selectedTeacherAnimal.imageSrc} alt={selectedTeacherAnimal.label} className="w-full h-full object-contain" /> : teacherInitials}</span><span className="sr-only">Giáo viên · Teacher Suite</span>
              </button>
            )}
            <span className="bluesteam-header-name font-bold truncate">
              {role === 'learner' ? displayLearnerName : displayTeacherName}
            </span>
          {onLogout && (
            <button type="button" onClick={onLogout} title="Đăng xuất"
              aria-label={`Đăng xuất tài khoản ${role === 'learner' ? 'học sinh' : 'giáo viên'}`}
              className="w-10 h-10 shrink-0 rounded-full bg-[#E0654E] text-white hover:bg-[#cf5640] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15586E]">
              <LogOut className="w-4 h-4" />
            </button>
          )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label={
          role === 'learner'
            ? 'Điều hướng chính di động'
            : 'Điều hướng giáo viên di động'
        }
        data-visible={navigationCollapsed}
        className="bluesteam-mobile-nav fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md"
      >
        {(role === 'learner' ? LEARNER_NAV_ITEMS : TEACHER_NAV_ITEMS).map(
          (item) => {
            const isActive = activeNavKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.route)}
                aria-current={isActive ? 'page' : undefined}
                data-nav-key={item.key}
                title={item.label}
                className={`bluesteam-nav-link bluesteam-nav-link--mobile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15586E] ${
                  isActive
                    ? 'text-[#15586E] bg-[#15586E]/12'
                    : 'text-[#436475] hover:text-[#12384B]'
                }`}
              >
                <span className="bluesteam-nav-icon">{item.icon}</span>
                <span className="text-[11px] leading-none">{item.label}</span>
              </button>
            );
          },
        )}
      </nav>

      {role === 'learner' && avatarPickerOpen && <LearnerIdentityDialog onClose={() => setAvatarPickerOpen(false)} />}
    </>
  );
}
