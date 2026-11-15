import {
  Controller,
  Inject,
  Post,
  Patch,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { PERSISTED_ANIMAL_AVATAR_KEYS } from '@bluesteam/contracts';
import { AuthService, TEACHER_SESSION_COOKIE } from './auth.service.js';
import { TeacherSessionGuard } from './session.guard.js';
import { parseWithZod } from '../common/validation.js';
import { parseCookieHeader } from '../common/authorization.js';
import { AppError } from '../common/errors.js';

const LoginInputSchema = z.object({
  role: z.enum(['teacher', 'student']).default('teacher'),
  email: z.string().trim().toLowerCase().pipe(z.union([
    z.string().email('Email không đúng định dạng').max(254),
    z.enum(['giaovien', 'hocsinh']),
  ])),
  password: z.string().min(4, 'Mật khẩu quá ngắn').max(200),
});

const RegisterInputSchema = z.object({
  role: z.enum(['teacher', 'student']),
  email: z.string().trim().email('Email không đúng định dạng').max(254),
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự').max(200),
  displayName: z.string().trim().min(1, 'Vui lòng nhập tên hiển thị').max(80),
});

function formatSessionCookie(token: string, expiresAt: Date, isSecure: boolean): string {
  const parts = [
    `${TEACHER_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function formatClearSessionCookie(isSecure: boolean): string {
  const parts = [
    `${TEACHER_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  private async respondWithSession(role: 'teacher' | 'student', email: string, password: string, req: any, res: any) {
    const result = await this.authService.loginAccount(role, email, password, req.ip || 'local');
    // Replace the previous account session when switching roles on this browser.
    await this.authService.revokeSessionByToken(parseCookieHeader(req.headers?.cookie)[TEACHER_SESSION_COOKIE]);
    const secure = process.env.NODE_ENV === 'production' && (req.protocol === 'https' || req.headers?.['x-forwarded-proto'] === 'https');
    res.setHeader('Set-Cookie', formatSessionCookie(result.rawToken, result.expiresAt, secure));
    res.setHeader('Cache-Control', 'no-store');
    const { role: accountRole, ...profile } = result.account;
    return { account: result.account, ...(accountRole === 'teacher' ? { teacher: profile } : {}), expiresAt: result.expiresAt.toISOString() };
  }

  @Post('register')
  async register(@Body() body: unknown, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const input = parseWithZod(RegisterInputSchema, body, 'INVALID_REGISTRATION_INPUT');
    await this.authService.registerAccount(input as Required<z.infer<typeof RegisterInputSchema>>, req.ip || 'local');
    return this.respondWithSession(input.role, input.email, input.password, req, res);
  }

  @Get('session')
  async session(@Req() req: any, @Res({ passthrough: true }) res: any) {
    res.setHeader('Cache-Control', 'no-store');
    const actor = await this.authService.resolveActorFromRequest(req);
    if (!actor) throw new AppError('UNAUTHORIZED', 'Phiên đã hết hạn. Vui lòng đăng nhập lại.', 401);
    const account = actor.kind === 'teacher'
      ? { ...await this.authService.getTeacherProfile(actor.teacherId), role: 'teacher' }
      : { id: actor.learnerId, email: actor.email, displayName: actor.displayName, avatarKey: actor.avatarKey, role: 'student' };
    return { account };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const input = parseWithZod(LoginInputSchema, body, 'INVALID_LOGIN_INPUT');
    return this.respondWithSession(input.role, input.email, input.password, req, res);
  }

  @Get('me')
  @UseGuards(TeacherSessionGuard)
  async me(@Req() req: any) {
    return { teacher: await this.authService.getTeacherProfile(req.actor.teacherId) };
  }

  @Patch('me')
  @UseGuards(TeacherSessionGuard)
  async updateMe(@Req() req: any, @Body() body: unknown) {
    const input = parseWithZod(z.object({
      displayName: z.string().trim().min(1).max(80),
      avatarKey: z.enum(PERSISTED_ANIMAL_AVATAR_KEYS).nullable(),
      avatarMediaId: z.string().uuid().nullable(),
    }).refine(v => !(v.avatarKey && v.avatarMediaId), 'Chỉ chọn một nguồn ảnh'), body, 'INVALID_PROFILE');
    return { teacher: await this.authService.updateTeacherProfile(req.actor.teacherId, {
      displayName: input.displayName!, avatarKey: input.avatarKey ?? null, avatarMediaId: input.avatarMediaId ?? null,
    }) };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const cookies = parseCookieHeader(req.headers?.cookie);
    const token = cookies[TEACHER_SESSION_COOKIE];
    await this.authService.revokeSessionByToken(token);

    const isSecure =
      process.env.NODE_ENV === 'production' &&
      (req.protocol === 'https' || req.headers?.['x-forwarded-proto'] === 'https');
    res.setHeader('Set-Cookie', formatClearSessionCookie(isSecure));
    return { ok: true };
  }
}
