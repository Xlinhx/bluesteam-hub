import { useState, type ReactNode } from 'react';
import { logoutAccount } from '../auth/accountSession';
import { useRouter } from '../../app/router';
import { AppHeader } from '../ui/navigation/AppHeader';
import { resolveLearnerActiveNav } from '../ui/navigation/RoleNavigation';
import type { LearnerNavKey } from '../data/categoryArtworkMap';
import { useLocalIdentity } from '../ui/identity/useLocalIdentity';

export type LearnerNavDestination =
  | 'home'
  | 'resources'
  | 'interactive'
  | 'creative'
  | 'learn'
  | 'profile';

export interface LearnerShellProps {
  children: ReactNode;
  activeNav?: LearnerNavDestination;
  learnerName?: string;
  avatarKey?: string;
  learnerAvatar?: string;
  variant?: 'default' | 'ocean';
  compactMobileHeader?: boolean;
}

export function LearnerShell({
  children,
  activeNav,
  learnerName,
  avatarKey,
  learnerAvatar,
  variant = 'default',
  compactMobileHeader = true,
}: LearnerShellProps) {
  const { currentPath, navigate } = useRouter();
  const profile = useLocalIdentity();
  const [logoutError, setLogoutError] = useState('');
  const resolvedName =
    learnerName || (profile?.role === 'student' ? profile.name : undefined) || 'Bé An';
  const rawAvatar = avatarKey || learnerAvatar || profile?.avatarKey;
  const resolvedAvatar =
    rawAvatar && !rawAvatar.startsWith('/') ? rawAvatar : 'turtle';

  const mappedNav: LearnerNavKey | undefined =
    activeNav === 'learn'
      ? 'interactive'
      : activeNav;
  const activeKey = resolveLearnerActiveNav(currentPath, mappedNav);

  return (
    <div
      className={`bluesteam-role-shell ${activeKey === 'home' ? 'home-hub-shell' : ''} min-h-screen flex flex-col font-sans select-none ${
        variant === 'ocean'
          ? 'bg-[#0D2230] text-[#FAF8F5]'
          : 'bg-[#FAF8F5] text-[#12384B]'
      }`}
    >
      <AppHeader
        role="learner"
        compactMobile={compactMobileHeader}
        activeNavKey={activeKey}
        identityName={resolvedName}
        avatarKey={resolvedAvatar}
        onLogout={async () => {
          try {
            await logoutAccount();
            navigate('/login', { query: { role: 'student' }, preserveQuery: false });
          } catch { setLogoutError('Chưa thể đăng xuất. Vui lòng thử lại.'); }
        }}
      />

      {logoutError && <p role="alert" className="p-4 text-red-700">{logoutError}</p>}
      <main className="flex-1 w-full relative">{children}</main>
    </div>
  );
}
