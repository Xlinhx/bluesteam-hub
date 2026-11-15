import React from 'react';
import {
  Home,
  BookOpen,
  Gamepad2,
  GraduationCap,
  Palette,
  UserRound,
} from 'lucide-react';
import type { LearnerNavKey, TeacherNavKey } from '../../data/categoryArtworkMap';
import './navigation-motion.css';

export type NavItemSpec<K extends string = string> = {
  key: K;
  label: string;
  icon: React.ReactNode;
} & ({ route: string; action?: never } | { route?: never; action: 'profile' | 'coming-soon' });

export const LEARNER_NAV_ITEMS: NavItemSpec<LearnerNavKey>[] = [
  {
    key: 'home',
    label: 'Trang chủ',
    route: '/home',
    icon: <Home className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'resources',
    label: 'Học liệu',
    route: '/resources',
    icon: <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'learning',
    label: 'Học tập',
    route: '/learning',
    icon: <GraduationCap className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'interactive',
    label: 'Tương tác',
    route: '/interactive',
    icon: <Gamepad2 className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'creative',
    label: 'Sáng tạo',
    route: '/studio',
    icon: <Palette className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    route: '/profile',
    icon: <UserRound className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
];

export const TEACHER_NAV_ITEMS: NavItemSpec<TeacherNavKey>[] = [
  {
    key: 'overview',
    label: 'Trang chủ',
    route: '/teacher',
    icon: <Home className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'resources',
    label: 'Học liệu',
    route: '/teacher/resources',
    icon: <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'learning',
    label: 'Học tập',
    action: 'coming-soon',
    icon: <GraduationCap className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'interactive',
    label: 'Tương tác',
    route: '/teacher/interactive',
    icon: <Gamepad2 className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'creative',
    label: 'Sáng tạo',
    route: '/teacher/creative',
    icon: <Palette className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    action: 'profile',
    icon: <UserRound className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
  },
];

export function resolveLearnerActiveNav(
  pathname: string,
  explicit?: LearnerNavKey,
): LearnerNavKey {
  if (explicit) return explicit;
  if (pathname === '/learning') return 'learning';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/resources')) return 'resources';
  if (
    pathname.startsWith('/interactive') ||
    pathname.startsWith('/creature') ||
    pathname.startsWith('/game') ||
    pathname.startsWith('/simulations') ||
    pathname.startsWith('/atlas')
  ) {
    return 'interactive';
  }
  if (pathname.startsWith('/studio') || pathname.startsWith('/creative')) {
    return 'creative';
  }
  return 'home';
}

export function resolveTeacherActiveNav(
  pathname: string,
  explicit?: TeacherNavKey,
): TeacherNavKey {
  if (explicit) return explicit;
  if (pathname.startsWith('/teacher/profile')) return 'profile';
  if (pathname.startsWith('/teacher/resources')) return 'resources';
  if (pathname.startsWith('/teacher/interactive')) return 'interactive';
  if (pathname.startsWith('/teacher/creative')) return 'creative';
  return 'overview';
}

export interface RoleNavigationProps {
  role: 'learner' | 'teacher';
  activeKey: string;
  onSelect: (item: NavItemSpec, trigger: HTMLButtonElement) => void;
  ariaLabel?: string;
  navigationRef?: React.Ref<HTMLElement>;
  collapsed?: boolean;
}

export function RoleNavigation({
  role,
  activeKey,
  onSelect,
  ariaLabel,
  navigationRef,
  collapsed = false,
}: RoleNavigationProps) {
  const items = role === 'learner' ? LEARNER_NAV_ITEMS : TEACHER_NAV_ITEMS;
  const defaultAria =
    role === 'learner' ? 'Điều hướng học sinh' : 'Điều hướng giáo viên';

  return (
    <nav
      ref={navigationRef}
      inert={collapsed}
      aria-label={ariaLabel || defaultAria}
      className="bluesteam-primary-nav"
    >
      {items.map((item) => {
        const isActive = activeKey === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={event => onSelect(item, event.currentTarget)}
            disabled={item.action === 'coming-soon'}
            aria-haspopup={item.action === 'profile' ? 'dialog' : undefined}
            aria-current={isActive ? 'page' : undefined}
            data-nav-key={item.key}
            title={item.label}
            className={`bluesteam-nav-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15586E] ${
              isActive
                ? 'bg-[#E0F3F7] text-[#07385D]'
                : 'text-[#12384B] hover:bg-[#D8EDF0]/55 hover:text-[#12384B]'
            }`}
          >
            <span className="bluesteam-nav-icon">{item.icon}</span>
            <span className="whitespace-nowrap">{item.label}{item.action === 'coming-soon' && <small className="bluesteam-nav-status">Sắp có</small>}</span>
          </button>
        );
      })}
    </nav>
  );
}
