import {Module} from '@nestjs/common';
import {CreativeSessionsService} from './creative-sessions.service.js';
import {CreativeSessionsController} from './creative-sessions.controller.js';
@Module({providers:[CreativeSessionsService],controllers:[CreativeSessionsController]})
export class CreativeSessionsModule{}
