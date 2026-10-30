import {Module} from '@nestjs/common';
import {CreativeColoringUsageController} from './creative-coloring-usage.controller.js';
import {CreativeColoringUsageService} from './creative-coloring-usage.service.js';
@Module({providers:[CreativeColoringUsageService],controllers:[CreativeColoringUsageController]})
export class CreativeColoringUsageModule{}
