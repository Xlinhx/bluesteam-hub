import type { CreativeArtwork } from '../../../shared/creative/creativeStorage';
import type { SavedArtworkView } from '../../../shared/creative/artworkCompletion';
import type { ArtworkPageCursor } from '../../../shared/creative/collectionPaging';

export interface ProfileArtworkSectionModel {
  kind: CreativeArtwork['type'];
  items: SavedArtworkView[];
}

export interface ProfileArtworkPage extends ProfileArtworkSectionModel {
  total: number;
  nextCursor: ArtworkPageCursor | null;
  loadingMore: boolean;
  moreError: boolean;
}
