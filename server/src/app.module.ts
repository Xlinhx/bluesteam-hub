import {CreativeSessionsModule} from './creative-sessions/creative-sessions.module.js';
import {CreativeColoringUsageModule} from './creative-coloring-usage/creative-coloring-usage.module.js';
import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MediaModule } from './media/media.module.js';
import { HealthModule } from './health/health.module.js';
import { ContentModule } from './content/content.module.js';
import { ArtworksModule } from './artworks/artworks.module.js';
import { InteractiveUsageModule } from './interactive-usage/interactive-usage.module.js';

export interface AppModuleOptions {
  databaseUrl?: string;
  mediaStorageDir?: string;
}

@Module({})
export class AppModule {
  static register(options: AppModuleOptions = {}): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DatabaseModule.forRoot(options.databaseUrl),
        AuthModule,
        MediaModule.forRoot(options.mediaStorageDir),
        ContentModule,
        ArtworksModule,
        InteractiveUsageModule,
        CreativeSessionsModule,
        CreativeColoringUsageModule,
        HealthModule,
      ],
    };
  }
}
