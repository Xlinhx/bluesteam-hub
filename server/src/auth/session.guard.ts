import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AppError } from '../common/errors.js';

@Injectable()
export class TeacherSessionGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const actor = await this.authService.resolveActorFromRequest(req);
    if (!actor || actor.kind !== 'teacher') {
      throw new AppError(
        'UNAUTHORIZED',
        'Phiên đăng nhập của cô đã hết hạn hoặc chưa đăng nhập.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    req.actor = actor;
    req.teacher = {
      id: actor.teacherId,
      email: actor.email,
      displayName: actor.displayName,
    };
    return true;
  }
}

export { TeacherSessionGuard as TeacherAuthGuard };
