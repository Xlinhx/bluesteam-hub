import { expect, it } from 'vitest';
import { resolveHabitatMaterials } from '../src/shared/creative/habitatMaterials';
import { HABITAT_ASSET_PALETTE } from '../src/shared/creative/habitatTypes';
import { createHabitatProject, readHabitatProject } from '../src/shared/creative/habitatProject';

it('uses published material names and scales and excludes unconfigured objects', () => {
  const assets = resolveHabitatMaterials({materials:[{id:'material-1',kind:'habitat_item',title:'Cỏ cô chọn',payload:{assetId:'seagrass-tall',defaultScale:1.4}}]});
  expect(assets).toHaveLength(1);
  expect(assets[0]).toMatchObject({id:'seagrass-tall',nameVi:'Cỏ cô chọn',defaultScale:1.4});
});
it('respects no-additional-materials while supporting legacy templates', () => {
  expect(resolveHabitatMaterials({materials:[]})).toEqual([]);
  expect(resolveHabitatMaterials({}).length).toBeGreaterThan(10);
});
it('never turns unsupported material definitions into an arbitrary 3D object', () => {
  expect(resolveHabitatMaterials({materials:[{kind:'stamp',payload:{assetId:'seagrass-tall'}},{kind:'habitat_item',payload:{assetId:'uploaded-image'}}]})).toEqual([]);
});
it('keeps project scenes independent of the shared presets', () => {
  const preset = HABITAT_ASSET_PALETTE.seagrass[0];
  const items=[{id:'one',assetId:preset.id,type:preset.type,nameVi:preset.nameVi,nameEn:preset.nameEn,x:0,z:0,rotation:0,scale:1}];
  const project=createHabitatProject(items);project.scenes[0].items[0].x=2;
  expect(items[0].x).toBe(0);
  expect(readHabitatProject(JSON.parse(JSON.stringify(project)),[])).toEqual(project);
  expect(()=>readHabitatProject({...project,version:99},[])).toThrow();
});
