/** Current playable content is layered over, and never rewrites, the historical archive. */
export function withInteractiveDesignSeed(source: any): any {
  const data = structuredClone(source);
  // Public provider records verified against /v3/models; archived prototype IDs returned 404.
  const models: Record<string, {uid:string;creator:string;license:string}> = {
    'model:clownfish':{uid:'47ba2679d91a4f14b3fc0bf8e3805af5',creator:'zixisun02',license:'CC-BY-4.0'},
    'model:turtle':{uid:'c92be549c8194136914883309a13a6b5',creator:'C.J..Goldman',license:'CC-BY-4.0'},
    'model:starfish':{uid:'32de6a92ad104e20aaa841c8e3eef93f',creator:'Digital Atlas of Ancient Life',license:'CC0-1.0'},
    'model:jellyfish':{uid:'d89af687535340609df38ef3325b285a',creator:'n-',license:'CC-BY-4.0'},
    'model:stingray':{uid:'87fc0c78eafa4a9f95b5739d9b9a23c0',creator:'Ian Christopher',license:'CC-BY-4.0'},
  };
  for (const model of data.reusableContent.models3d) {
    const verified=models[model.sourceKey];
    if (!verified) continue;
    const canonicalUrl=`https://sketchfab.com/3d-models/${verified.uid}`;
    model.modelUid=verified.uid; model.canonicalUrl=canonicalUrl;
    model.attribution={creator:verified.creator,license:verified.license,sourceUrl:canonicalUrl};
  }
  const home = data.reusableContent.activities.find((activity: any) => activity.sourceKey === 'activity:home-sorting');
  if (home) {
    home.coverUrl = '/assets/generated/interactive/habitat-scene.png';
    home.config = { templateKey: 'sorting', instructionText: 'Chạm vào một bạn, rồi chạm nơi sống.', allowRetry: true, scoringEnabled: true,
      backgroundUrl: '/assets/generated/interactive/habitat-scene.png',
      targets: [
        { id: 'zone-coral', label: 'Rạn san hô', bounds: { x: .06, y: .5, width: .25, height: .16 } },
        { id: 'zone-seagrass', label: 'Cỏ biển', bounds: { x: .375, y: .5, width: .25, height: .16 } },
        { id: 'zone-rock', label: 'Vùng đá', bounds: { x: .69, y: .5, width: .25, height: .16 } },
      ], objects: [
        { id: 'obj-clownfish', label: 'Cá hề', imageUrl: '/assets/generated/creatures/clownfish_isolated.png', acceptedTargetIds: ['zone-coral'] },
        { id: 'obj-bluefish', label: 'Cá xanh', imageUrl: '/assets/generated/creatures/blue_fish_isolated.png', acceptedTargetIds: ['zone-coral'] },
        { id: 'obj-seahorse', label: 'Cá ngựa', imageUrl: '/assets/generated/creatures/seahorse_isolated.png', acceptedTargetIds: ['zone-seagrass'] },
        { id: 'obj-urchin', label: 'Nhím biển', imageUrl: '/assets/generated/interactive/urchin-cutout.png', acceptedTargetIds: ['zone-rock'] },
        { id: 'obj-starfish', label: 'Sao biển', imageUrl: '/assets/generated/r2-cutouts/starfish_cutout.png', acceptedTargetIds: ['zone-coral','zone-rock'] },
        { id: 'obj-seashell', label: 'Vỏ sò', imageUrl: '/assets/generated/r2-cutouts/seashell_cutout.png', acceptedTargetIds: ['zone-rock'] },
      ] };
  }
  return data;
}

export const INITIAL_INTERACTIVE_GROUPS = [
  { key: 'ocean-home', title: 'Ngôi nhà đại dương', cover: '/assets/generated/interactive/habitat-scene.png', activities: ['home-sorting','pair-matching','choose-animal','shell-fish-sorting','shadow-matching','sim-water-column'], models: ['clownfish','turtle','starfish','stingray','jellyfish'] },
  { key: 'clean-ocean', title: 'Giữ biển sạch', cover: '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg', activities: ['beach-cleanup','clean-beach-scenario','sim-rescue-mission','sim-plastic-journey'], models: [] },
];
