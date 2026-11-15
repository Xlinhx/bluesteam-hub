import { useState } from 'react';
import { ArrowRight, Waves } from 'lucide-react';
import type { ResourceGroup } from '../../../shared/api/resourceGroups';
import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import './resource-group-gallery.css';

function GroupCover({ url, crop }: { url: string | null; crop: ResourceGroup['coverCrop'] }) {
  const [failed, setFailed] = useState(false);
  return <span className="resource-group-portrait" aria-hidden="true">
    {url && !failed
      ? <img src={url} alt="" style={crop && cropImageStyle(crop)} decoding="async" onError={() => setFailed(true)} />
      : <Waves size={44} />}
  </span>;
}

export function ResourceGroupGallery({ groups, onOpen }: {
  groups: ResourceGroup[];
  onOpen: (id: string) => void;
}) {
  return <div className="resource-group-gallery">
    <div className="resource-group-list">
      {groups.map(group => {
        const titleId = `resource-group-${group.id}`;
        return <section key={group.id} className="resource-group-section" aria-labelledby={titleId}>
          <button type="button" className="resource-group-link" data-ocean-action="group"
            aria-label={`Mở nhóm ${group.title}`} onClick={() => onOpen(group.id)}>
            <GroupCover key={group.coverUrl} url={group.coverUrl} crop={group.coverCrop} />
            <span id={titleId} className="resource-group-name">{group.title}</span>
            <span className="resource-group-summary">
              {group.libraryMemberCount ?? group.memberCount} học liệu <ArrowRight size={21} aria-hidden="true" />
            </span>
          </button>
        </section>;
      })}
    </div>
    <svg className="resource-group-gallery-wave" viewBox="0 0 1200 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 22C210 -9 280 33 502 19S722 7 887 17S1075 27 1200 4" vectorEffect="non-scaling-stroke" />
    </svg>
  </div>;
}
