import { creativeStorage } from '../../creative/creativeStorage';
import { DEFAULT_HABITAT_ITEMS } from '../../creative/habitatTypes';
import { demoStore } from '../../realtime/demoStore';

/** Explicit development fixture; never runs for an ordinary empty profile. */
export async function seedProfileDemo() {
  if ((await creativeStorage.getArtworks()).length) return;
  demoStore.setProfile({ role: 'student', id: 'local-design-demo', name: 'Bé An', avatarKey: 'crab' });
  const base = new Date('2026-10-20T02:00:00Z').getTime();
  const examples = [
    { id: 'profile-demo-turtle', title: 'Bạn rùa của An', image: '/assets/generated/craft/child_crayon_turtle.jpg' },
    { id: 'profile-demo-coral', title: 'Rạn san hô rực rỡ', image: '/assets/generated/craft/artwork_crayon_coral.png' },
  ];
  for (const [index, entry] of examples.entries()) {
    const response = await fetch(entry.image); if (!response.ok) throw new Error('Chưa tải được tranh mẫu.');
    const blob = await response.blob();
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
    await creativeStorage.saveArtwork({id: entry.id, type: 'drawing', title: entry.title, createdAt: base + 3 - index, previewDataUrl: data, drawingData: {canvasDataUrl: data, template: 'turtle'}, isDraft: false, submissionState: 'local_only'});
  }
  const draft = await creativeStorage.getArtworkById('profile-demo-turtle');
  if (draft) await creativeStorage.saveArtwork({...draft, id:'profile-demo-draft', title:'Bức tranh đang vẽ', createdAt:base+5, isDraft:true});
  await creativeStorage.saveArtwork({ id: 'profile-demo-habitat', type: 'habitat', title: 'Góc biển của An', createdAt: base + 1, previewDataUrl: '/assets/generated/profile/profile-habitat-preview.png', habitatData: {items: DEFAULT_HABITAT_ITEMS as any}, submissionState: 'local_only' });
}
