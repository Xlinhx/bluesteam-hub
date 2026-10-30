import { Inject, Injectable } from '@nestjs/common';
import { AppHttpException } from '../common/errors';
import { assertValidUuid } from '../common/validation';
import { MediaService } from '../media/media.service';
import { ArtworksRepository, type ArtworkDto } from './artworks.repository';

@Injectable()
export class ArtworksService {
  constructor(
    @Inject(MediaService) private readonly mediaService: MediaService,
    @Inject(ArtworksRepository) private readonly repo: ArtworksRepository,
  ) {}

  async getTeacherArtwork(teacherId:string,artworkId:string):Promise<ArtworkDto>{
    const found=await this.repo.findByIdWithOwnership(assertValidUuid(artworkId,'artworkId'));
    if(!found)throw new AppHttpException('ARTWORK_NOT_FOUND','Không tìm thấy tác phẩm',404);
    if(found.teacherId!==teacherId)throw new AppHttpException('FORBIDDEN','Cô không có quyền xem tác phẩm này',403);
    return found.artwork;
  }

  async listTeacherArtworks(params: {
    teacherId: string;
    kind?: 'drawing' | 'habitat';
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ArtworkDto[]; total: number }> {
    return this.repo.listTeacherArtworks(params);
  }

  async updateTeacherNote(params: {
    artworkId: string;
    teacherId: string;
    note: string;
  }): Promise<ArtworkDto> {
    const artworkId = assertValidUuid(params.artworkId, 'artworkId');
    const found = await this.repo.findByIdWithOwnership(artworkId);
    if (!found) {
      throw new AppHttpException('NOT_FOUND', 'Không tìm thấy tác phẩm', 404);
    }
    if (found.teacherId !== params.teacherId) {
      throw new AppHttpException(
        'FORBIDDEN',
        'Chỉ giáo viên sở hữu tác phẩm mới được ghi chú tác phẩm này',
        403,
      );
    }
    const cleanNote = (params.note || '').trim().slice(0, 500);
    await this.repo.upsertTeacherNote({
      artworkId,
      teacherId: params.teacherId,
      note: cleanNote,
    });
    const refreshed = await this.repo.findByIdWithOwnership(artworkId);
    return refreshed!.artwork;
  }

  async getArtworkForTeacherDownload(params: {
    artworkId: string;
    teacherId: string;
  }) {
    const artworkId = assertValidUuid(params.artworkId, 'artworkId');
    const found = await this.repo.findByIdWithOwnership(artworkId);
    if (!found) {
      throw new AppHttpException('NOT_FOUND', 'Không tìm thấy tác phẩm', 404);
    }
    if (found.teacherId !== params.teacherId) {
      throw new AppHttpException(
        'FORBIDDEN',
        'Chỉ giáo viên sở hữu tác phẩm mới được tải tác phẩm này',
        403,
      );
    }
    const streamInfo = await this.mediaService.getMediaForStream(found.artwork.sourceMediaId);
    return {
      artwork: found.artwork,
      streamInfo,
    };
  }
}
