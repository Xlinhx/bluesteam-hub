import { resolveRouteDomain } from '../../app/router';
import type { AccountRole } from './accountSession';

export type RouteAccountRole = AccountRole | 'member';
export function routeAccountRole(path: string): RouteAccountRole | null {
  // These shared links already authenticate using a scoped scan/display token.
  if (path === '/creative/scan' || path === '/creative/sea') return null;
  const domain = resolveRouteDomain(path);
  if (domain === 'teacher' || path === '/presentation' || path.startsWith('/present/')) return 'teacher';
  if (domain !== 'learner') return null;
  if (path === '/home' || path === '/student' || path === '/profile') return 'student';
  // Teachers also open drawing and content workspaces from their preview tools.
  return 'member';
}
