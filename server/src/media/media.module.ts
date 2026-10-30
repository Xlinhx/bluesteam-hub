import { DynamicModule, Global, Module } from '@nestjs/common';
import path from 'node:path';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { MEDIA_STORAGE_DIR_TOKEN } from './storage.adapter.js';

@Global()
@Module({})
export class MediaModule {
  static forRoot(mediaStorageDir?: string): DynamicModule {
    const resolvedDir =
      mediaStorageDir ||
      process.env.MEDIA_STORAGE_DIR ||
      process.env.UPLOAD_DIR ||
      path.resolve(process.cwd(), 'storage', 'media');

    return {
      module: MediaModule,
      controllers: [MediaController],
      providers: [
        {
          provide: MEDIA_STORAGE_DIR_TOKEN,
          useValue: resolvedDir,
        },
        MediaService,
      ],
      exports: [MediaService, MEDIA_STORAGE_DIR_TOKEN],
    };
  }
}
