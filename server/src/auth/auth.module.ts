import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { TeacherSessionGuard } from './session.guard.js';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, TeacherSessionGuard],
  exports: [AuthService, TeacherSessionGuard],
})
export class AuthModule {}
