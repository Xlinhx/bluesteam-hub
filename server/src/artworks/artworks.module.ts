import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { ArtworksRepository } from './artworks.repository';
import { ArtworksService } from './artworks.service';
import { ArtworksController } from './artworks.controller';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [ArtworksController],
  providers: [ArtworksRepository, ArtworksService],
  exports: [ArtworksRepository, ArtworksService],
})
export class ArtworksModule {}
