import { HttpStatus } from '@nestjs/common';
import { AppError } from './errors.js';

export type Actor =
  | { kind:'teacher'; teacherId:string; email:string; displayName:string; sessionId:string; }
  | { kind:'student'; learnerId:string; email:string; displayName:string; sessionId:string; };

export function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const rawVal = part.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(rawVal);
    } catch {
      result[key] = rawVal;
    }
  }
  return result;
}

export function assertTeacherActor(actor?: Actor | null): Extract<Actor, { kind: 'teacher' }> {
  if (!actor || actor.kind !== 'teacher') {
    throw new AppError(
      'UNAUTHORIZED',
      'Vui lòng đăng nhập tài khoản giáo viên để thực hiện thao tác này.',
      HttpStatus.UNAUTHORIZED,
    );
  }
  return actor;
}

export function assertOwnerMatch(ownerId: string | null | undefined, teacherId: string): void {
  if (!ownerId || ownerId !== teacherId) {
    throw new AppError(
      'FORBIDDEN_NOT_OWNER',
      'Bạn không có quyền chỉnh sửa nội dung thuộc giáo viên khác hoặc dữ liệu gốc hệ thống.',
      HttpStatus.FORBIDDEN,
    );
  }
}
