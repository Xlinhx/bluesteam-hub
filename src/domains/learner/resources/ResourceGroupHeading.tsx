import {Waves} from 'lucide-react';
import type {ResourceGroup} from '../../../shared/api/resourceGroups';
import {cropImageStyle} from '../../../shared/ui/visuals/resourceCoverCrop';
import {ResourceSurface} from '../../../shared/ui/visuals/ResourceSurface';
export function ResourceGroupHeading({group}:{group:ResourceGroup|null|undefined}) {
 return <section className="resource-group-heading" aria-label="Nhóm đang khám phá" data-ready={Boolean(group)}>
  <ResourceSurface variant="group"/>
  <span className="resource-group-heading-portrait">{group?.coverUrl?<img src={group.coverUrl} alt="" style={cropImageStyle(group.coverCrop)}/>:<Waves size={48}/>}</span>
  <h2>{group?.title || 'Học liệu trong nhóm'}</h2>
  <svg className="resource-group-heading-current" viewBox="0 0 1000 70" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 35C180-20 250 85 430 35S720-10 1000 35"/><path pathLength="1" d="M0 47C180-8 250 97 430 47S720 2 1000 47"/></svg>
 </section>;
}
