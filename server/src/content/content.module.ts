import { Module } from '@nestjs/common';
import { TopicsController, TopicsService } from './topics/topics.controller.js';
import { ResourcesService } from './resources/resources.service.js';
import { ResourcesController } from './resources/resources.controller.js';
import { ResourceGroupsController } from './resources/resource-groups.controller.js';
import { ResourceGroupsService } from './resources/resource-groups.service.js';
import { ModelsService } from './models/models.service.js';
import { ModelsController } from './models/models.controller.js';
import { ActivitiesService } from './activities/activities.service.js';
import { ActivitiesController } from './activities/activities.controller.js';
import { InteractiveGroupsController } from './activities/interactive-groups.controller.js';
import { InteractiveGroupsService } from './activities/interactive-groups.service.js';
import { CreativeService } from './creative/creative.service.js';
import { CreativeController } from './creative/creative.controller.js';

@Module({
  controllers: [
    TopicsController,
    ResourcesController,
    ResourceGroupsController,
    ModelsController,
    ActivitiesController,
    InteractiveGroupsController,
    CreativeController,
  ],
  providers: [
    TopicsService,
    ResourcesService,
    ResourceGroupsService,
    ModelsService,
    ActivitiesService,
    InteractiveGroupsService,
    CreativeService,
  ],
  exports: [
    TopicsService,
    ResourcesService,
    ModelsService,
    ActivitiesService,
    CreativeService,
  ],
})
export class ContentModule {}
