import type { Page } from '@playwright/test';

/** Browser-local QA data. Exercises the production app without enabling demo routes or touching existing browser data. */
export async function seedLocalProfile(page: Page) {
  await page.evaluate(async () => {
    const dataUrl = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw Error('Fixture image unavailable: ' + url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob);
      });
    };
    const base = new Date('2026-10-20T02:00:00Z').getTime();
    const turtle = await dataUrl('/assets/generated/craft/child_crayon_turtle.jpg');
    const coral = await dataUrl('/assets/generated/craft/artwork_crayon_coral.png');
    const outline = await dataUrl('/assets/generated/craft/clownfish_coloring_lineart.png');
    const records = [
      { id: 'profile-demo-turtle', type: 'drawing', title: 'Bạn rùa của An', createdAt: base + 3, previewDataUrl: turtle, drawingData: { canvasDataUrl: turtle, template: 'turtle' }, isDraft: false, submissionState: 'local_only' },
      { id: 'profile-demo-coral', type: 'drawing', title: 'Rạn san hô rực rỡ', createdAt: base + 2, previewDataUrl: coral, drawingData: { canvasDataUrl: coral, template: 'coral' }, isDraft: false, submissionState: 'local_only' },
      { id: 'profile-demo-habitat', type: 'habitat', title: 'Góc biển của An', createdAt: base + 1, previewDataUrl: '/assets/generated/profile/profile-habitat-preview.png', habitatData: { items: [{ id: 'fixture-rock', type: 'rock', assetId: 'rock-arch', nameVi: 'Đá', nameEn: 'Rock', x: 0, z: 0, rotation: 0, scale: 1 }] }, isDraft: false, submissionState: 'local_only' },
      { id: 'profile-demo-draft', type: 'drawing', title: 'Bức tranh đang vẽ', createdAt: base + 5, previewDataUrl: outline, drawingData: { canvasDataUrl: outline, template: 'blank' }, isDraft: true, submissionState: 'local_only' },
    ];
    const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts');
    for (const record of records) await creativeStorage.saveArtwork(record as any);
    localStorage.setItem('ocean-demo:v2:profile', JSON.stringify({ schemaVersion: 2, role: 'student', id: JSON.parse(localStorage.getItem('ocean-demo:v2:profile') || '{}').id || 'local-design-demo', name: 'Bé An', avatarKey: 'crab' }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
}
