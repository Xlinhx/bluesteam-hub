import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from '../../app/router';
import { AppHeader } from '../ui/navigation/AppHeader';
import { resolveTeacherActiveNav } from '../ui/navigation/RoleNavigation';
import { type TeacherNavKey } from '../data/categoryArtworkMap';
import { demoStore } from '../realtime/demoStore';
import { getCachedTeacherProfile, fetchCurrentTeacherApi } from '../api/auth';
import { logoutAccount } from '../auth/accountSession';
import { TeacherIdentityDialog } from '../../domains/teacher/account/TeacherIdentityDialog';

export type TeacherNavDestination =
  | 'overview'
  | 'dashboard'
  | 'resources'
  | 'interactive'
  | 'creative'
  | 'lessons'
  | 'curriculum'
  | 'plan'
  | 'builder'
  | 'library'
  ;

export interface TeacherShellProps {
  children?: ReactNode;
  activeNav?: TeacherNavDestination;
  activeKey?: TeacherNavDestination;
  teacherName?: string;
  onLogout?: () => void;
}

export function TeacherShell({
  children,
  activeNav,
  activeKey,
  teacherName,
  onLogout,
}: TeacherShellProps) {
  const resolvedNav = activeNav ?? activeKey;

  const { currentPath, navigate } = useRouter();
  const [account, setAccount] = useState(getCachedTeacherProfile);
  const [editing, setEditing] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => {
    const update = () => setAccount(getCachedTeacherProfile());
    window.addEventListener('bluesteam:teacher-updated', update);
    void fetchCurrentTeacherApi().then(setAccount);
    return () => window.removeEventListener('bluesteam:teacher-updated', update);
  }, []);
  const profile = demoStore.getProfile();
  const profileTeacherName =
    profile?.role === 'teacher' && profile.name && !profile.name.includes('Coralie')
      ? profile.name
      : undefined;
  const resolvedName =
    teacherName !== undefined ? teacherName : account?.displayName || profileTeacherName || 'Giáo viên';

  const legacyToR2Map: Record<TeacherNavDestination, TeacherNavKey> = {
    overview: 'overview',
    dashboard: 'overview',
    lessons: 'overview',
    curriculum: 'interactive',
    plan: 'interactive',
    builder: 'interactive',
    resources: 'resources',
    library: 'resources',
    interactive: 'interactive',
    creative: 'creative',
  };

  const mappedNav = resolvedNav ? legacyToR2Map[resolvedNav] : undefined;
  const currentActiveKey = resolveTeacherActiveNav(currentPath, mappedNav);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await logoutAccount();
      navigate('/login', { query: { role: 'teacher' }, preserveQuery: false });
    } catch { setLogoutError('Chưa thể đăng xuất. Vui lòng thử lại.'); }
  };

  return (
    <div className={`bluesteam-role-shell ${currentPath === '/teacher' ? 'home-hub-shell' : ''} min-h-screen flex flex-col bg-[#FAF8F5] text-[#12384B] font-sans`}>
      <AppHeader
        role="teacher"
        activeNavKey={currentActiveKey}
        identityName={resolvedName}
        teacherAvatarUrl={account?.avatarUrl || undefined}
        avatarKey={account?.avatarKey || undefined}
        onEditIdentity={() => setEditing(true)}

        onLogout={handleLogout}
      />

      {logoutError && <p role="alert" className="p-4 text-red-700">{logoutError}</p>}
      <main className="flex-1 w-full relative">{children}</main>
      {editing && account && <TeacherIdentityDialog profile={account} onClose={() => setEditing(false)} />}
      {editing && !account && <div className="ocean-modal-backdrop"><div className="ocean-modal"><p>Cô đăng nhập để thay đổi hồ sơ nhé.</p><button className="ocean-button" onClick={() => navigate('/login')}>Đăng nhập</button><button className="ocean-button quiet" onClick={() => setEditing(false)}>Đóng</button></div></div>}
    </div>
  );
}
