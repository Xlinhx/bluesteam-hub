export type AssetType = 'image' | 'model-3d' | 'audio' | 'video' | 'vector-svg';

export interface AssetProvenance {
  id: string;
  type: AssetType;
  url: string;
  source: string;
  creator?: string;
  license: string;
  attributionText?: string;
  isGenerated: boolean;
  generationMethod?: string;
  version: string;
  altText: string;
  intrinsicDimensions?: {
    width: number;
    height: number;
  };
}
