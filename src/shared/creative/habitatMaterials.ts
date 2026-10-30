import { HABITAT_ASSET_PALETTE, type AssetItemDef } from './habitatTypes';

/** Compatibility with templates predating configurable classroom materials. */
export function resolveHabitatMaterials(config: Record<string, any>): AssetItemDef[] {
  const catalog = Object.values(HABITAT_ASSET_PALETTE).flat();
  if (!Array.isArray(config.materials)) return catalog;
  const selected = new Map<string,AssetItemDef>();
  for (const material of config.materials) {
    const asset = catalog.find(a=>a.id===material?.payload?.assetId);
    if (!asset || material.kind!=='habitat_item') continue;
    const scale=Number(material.payload.defaultScale ?? asset.defaultScale);
    selected.set(asset.id,{...asset,nameVi:material.title || asset.nameVi,defaultScale:Number.isFinite(scale)?Math.max(.5,Math.min(2,scale)):asset.defaultScale});
  }
  return [...selected.values()];
}
