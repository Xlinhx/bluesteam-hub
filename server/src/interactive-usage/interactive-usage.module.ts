import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module.js';
import { InteractiveUsageService } from './interactive-usage.service.js';
import { InteractiveUsageReportService } from './interactive-usage-report.service.js';
import { InteractiveUsageController } from './interactive-usage.controller.js';
@Module({imports:[ContentModule],controllers:[InteractiveUsageController],providers:[InteractiveUsageService,InteractiveUsageReportService]})
export class InteractiveUsageModule {}
