import { useEffect, useState } from 'react';
import { useRouter } from '../../../app/router';
import { type OceanItem, type OceanZone, useOceanData } from '../../../shared/api/learnerOcean';
import { LearnerResourceDetailLayout } from './LearnerResourceDetailLayout';
import { SourceResourceDetail } from '../../../shared/ui/media/SourceResourceDetail';
import { useSourceBookmarks } from './useSourceBookmarks';

export function SourceResourcePage({ id }: { id: string }) {
  const { query, navigate } = useRouter();
  const { saved, toggle } = useSourceBookmarks();
  const detail = useOceanData<OceanItem>('items/' + encodeURIComponent(id));
  const [lastItem, setLastItem] = useState<OceanItem>();
  useEffect(() => {
    if (detail.data) setLastItem(detail.data);
  }, [detail.data]);
  const item = detail.data ?? (detail.loading ? lastItem : undefined);
  const zones = useOceanData<{ zones: OceanZone[] }>(item?.zone === 'reef' ? 'zones' : null);
  const reef = zones.data?.zones.find(zone => zone.id === 'reef');

  return <LearnerResourceDetailLayout id={id} saved={saved.includes(id)}
    resourceKind={detail.data?.id===id?'source':undefined}
    topic={item?.group ? {title:item.group,onOpen:() => navigate('/resources', {query:{
      kind:item.kind === 'species' ? 'reef' : item.kind,
      habitat:item.kind === 'species' && item.zone !== 'reef' ? item.zone : undefined,
      shelf:item.group,
    }})} : undefined}
    onSave={() => { if (detail.data) toggle(id); }}
    onBack={() => navigate('/resources', {query:{
      ...(!query.kind && !query.habitat && !query.saved && query.view !== 'catalog' && {kind:item?.kind === 'species' ? 'reef' : item?.kind}), ...query, source:null,
    }})}>
    {detail.loading && <p className={item ? 'sr-only' : 'resource-empty'} role="status">Đang mở học liệu…</p>}
    {detail.errorStatus === 404 ? <p className="resource-empty" role="status">Học liệu này đã được gỡ khỏi thư viện.</p> :
      detail.error && <p className="resource-error" role="alert">{detail.error} <button onClick={detail.reload}>Thử lại</button></p>}
    {item && <div inert={detail.loading || undefined} aria-busy={detail.loading}><SourceResourceDetail key={item.id} item={item} reef={item.kind === 'species' ? reef : undefined}
      onOpen={target => navigate('/resources/' + encodeURIComponent(target), {query})}
      onOpenDrawing={template => navigate('/creative/drawing', {query:{...query,template,returnResource:item.id}})}/></div>}
  </LearnerResourceDetailLayout>;
}
