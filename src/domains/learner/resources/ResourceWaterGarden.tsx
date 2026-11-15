import { useEffect, useRef } from 'react';
import './resource-water-garden.css';

/** Ambient artwork stays in the page margins, underneath the reading surfaces. */
export function ResourceWaterGarden() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = root.current;
    if (!layer) return;
    const sync = () => { layer.dataset.motionSleep = String(document.hidden); };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return <div ref={root} className="resource-water-garden" aria-hidden="true">
    <div className="resource-water-garden__frame">
      <img className="resource-water-garden__art resource-water-garden__art--left" width="640" height="960"
        src="/assets/learner-worlds/resource-seagrass-left.webp" alt="" decoding="async"/>
      <img className="resource-water-garden__art resource-water-garden__art--right" width="640" height="960"
        src="/assets/learner-worlds/resource-reef-right.webp" alt="" decoding="async"/>
      <div className="resource-water-garden__glints">
        <span/><span/><span/><span/><span/><span/>
      </div>
    </div>
  </div>;
}
