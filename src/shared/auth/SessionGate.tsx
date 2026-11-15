import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from '../../app/router';
import { demoStore } from '../realtime/demoStore';
import { applyAccountIdentity, fetchAccountSession } from './accountSession';
import type { RouteAccountRole } from './routeAccess';

const subscribeToClient = () => () => {};

/** The API remains the authority; cached names are never proof of a session. */
export function SessionGate({ role, children }: { role: RouteAccountRole; children: ReactNode }) {
  const { currentPath, navigate, query } = useRouter();
  const inviteCode = currentPath.split('?')[0] === '/profile' ? query.join : undefined;
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const [verifiedPath, setVerifiedPath] = useState<string | null>(null);
  const [error, setError] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true, version = 0;
    const check = async () => {
      const request = ++version;
      setError('');
      try {
        const account = await fetchAccountSession();
        if (!active || request !== version) return;
        if (!account || (role !== 'member' && account.role !== role)) {
          setVerifiedPath(null);
          navigate('/login', { replace: true, query: { role: role === 'member' ? 'student' : role, ...(inviteCode ? { join:inviteCode } : {}) }, preserveQuery: false });
          return;
        }
        const profile = demoStore.getProfile();
        if (profile.id !== account.id) applyAccountIdentity(account);
        else if (account.role === 'student' && account.avatarKey && account.avatarKey !== profile.avatarKey) {
          demoStore.setProfile({ ...profile, avatarKey:account.avatarKey });
        }
        setVerifiedPath(currentPath);
      } catch {
        if (active && request === version) setError('Chưa thể kiểm tra phiên đăng nhập. Vui lòng thử lại.');
      }
    };
    void check();
    const onFocus = () => { void check(); };
    window.addEventListener('focus', onFocus);
    return () => { active = false; window.removeEventListener('focus', onFocus); };
  }, [currentPath, role, navigate, retry, inviteCode]);
  const allowed = verifiedPath === currentPath;
  return <>
    {allowed && error && <div className="fixed bottom-24 right-4 z-50 max-w-sm rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-[#12384B] shadow-lg" role="status">{error} <button className="min-h-11 px-3 font-bold underline" onClick={() => setRetry(value => value + 1)}>Thử lại</button></div>}
    {!allowed && <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FAF8F5] text-[#12384B] p-6">
      {error ? <><p role="alert">{error}</p><button className="ocean-button" onClick={() => setRetry(value => value + 1)}>Thử lại</button></> : <p role="status">Đang kiểm tra phiên đăng nhập…</p>}
    </div>}
    <div hidden={!allowed}>{(allowed || !isClient) && children}</div>
  </>;
}
