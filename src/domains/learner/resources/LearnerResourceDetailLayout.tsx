import { useEffect, type ReactNode } from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { oceanApi } from '../../../shared/api/learnerOcean';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { useBookmarkMotion } from '../../../shared/ui/motion/useBookmarkMotion';
import '../../../shared/ui/media/resource-detail.css';

export function LearnerResourceDetailLayout({ id, creative, resourceKind, topic, saved, onBack, onSave, children }: {
  id: string;
  creative?: boolean;
  resourceKind?: 'source' | 'published';
  topic?: { title: string; image?: string; onOpen?: () => void };
  saved: boolean;
  onBack: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!resourceKind || creative) return;
    void oceanApi('resource-views', {
      method:'POST', body:JSON.stringify({id,kind:resourceKind}), keepalive:true,
    }).catch(() => {});
  }, [creative, id, resourceKind]);
  const bookmark = useBookmarkMotion(saved, id);
  const saveLabel = saved ? 'Bỏ lưu học liệu' : 'Lưu học liệu';
  return <div className="resource-detail-shell">
    <LearnerShell activeNav={creative ? 'creative' : 'resources'} compactMobileHeader>
      <div className={`w-full text-[#12384B] font-sans ${creative ? 'bg-[#FAF8F5]' : 'resource-detail-water'}`}>
        <div className="resource-detail-page" data-resource-id={id}>
          <div className="resource-detail-toolbar">
            <div className="resource-detail-trail">
              <button type="button" onClick={onBack} className="resource-detail-back">
                <ArrowLeft className="w-5 h-5 text-[#17657A]"/><span>{creative ? 'Tranh tô màu' : 'Học liệu'}</span>
              </button>
              {topic && (topic.onOpen ? <button type="button" className="resource-detail-topic" onClick={topic.onOpen}>
                {topic.image && <img src={topic.image} alt=""/>}{topic.title}
              </button> : <span className="resource-detail-topic">
                {topic.image && <img src={topic.image} alt=""/>}{topic.title}
              </span>)}
            </div>
            <button ref={bookmark} type="button" onClick={onSave} aria-pressed={saved} aria-label={saveLabel}
              className="resource-detail-save" title={saveLabel}>
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-[#17657A] text-[#17657A]' : ''}`}/>
            </button>
          </div>
          {children}
        </div>
      </div>
    </LearnerShell>
  </div>;
}
