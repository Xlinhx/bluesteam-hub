import { useEffect, useState } from 'react';
import { fetchPublicActivities } from '../../../shared/api/catalog';
import { ActivityPlayPage } from './ActivityPlayPage';
import { ActivityShell } from '../../../shared/shells/ActivityShell';

/** Historical links resolve the published activity; progress is never fabricated from query parameters. */
export function HabitatPlacementGamePage() {
  const [id, setId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    fetchPublicActivities({kind:'game',q:'Về đúng nhà',limit:20},controller.signal).then(page => {
      if (controller.signal.aborted) return;
      const activity = page.items.find(item => item.isSeed && item.templateKey === 'sorting' && item.title === 'Về đúng nhà');
      if (!activity) throw new Error('Hoạt động này chưa được xuất bản. Bé quay lại danh mục để chọn nhé.');
      setId(activity.id);
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Chưa tải được hoạt động.'); });
    return () => controller.abort();
  },[retry]);
  if (id) return <ActivityPlayPage id={id}/>;
  return <ActivityShell title="Về đúng nhà" variant="light"><div className="p-12 text-center" role={error ? 'alert' : 'status'}>{error || 'Đang mở hoạt động từ thư viện…'}{error && <button className="block mx-auto mt-6 min-h-14 px-8 rounded-full bg-[#15586e] text-white font-bold" onClick={() => setRetry(value => value+1)}>Thử lại</button>}</div></ActivityShell>;
}