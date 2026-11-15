import { useState, type CSSProperties } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

export function OceanComparison({ english }: { english: boolean }) {
  const [position, setPosition] = useState(48);
  return (
    <div className="ocean-comparison" data-testid="ocean-comparison" style={{ '--split': `${position}%` } as CSSProperties}>
      <img className="comparison-art" src="/assets/generated/landing-chibi/reef-art-1600.webp" srcSet="/assets/generated/landing-chibi/reef-art-800.webp 800w, /assets/generated/landing-chibi/reef-art-1600.webp 1600w" sizes="100vw" width="1672" height="941" alt={english ? 'The reef reimagined with chibi ocean characters' : 'Rạn san hô với các nhân vật đại dương chibi'} loading="lazy" />
      <div className="comparison-photo"><img src="/assets/generated/landing-editorial/reef-1600.webp" srcSet="/assets/generated/landing-editorial/reef-800.webp 800w, /assets/generated/landing-editorial/reef-1600.webp 1600w" sizes="100vw" width="1672" height="941" alt={english ? 'Clownfish, anemone and branching coral' : 'Cá hề, hải quỳ và san hô phân nhánh'} loading="lazy" /></div>
      <span className="comparison-label comparison-label--left">{english ? 'Observe' : 'Quan sát'}</span>
      <span className="comparison-label comparison-label--right">{english ? 'Create' : 'Sáng tạo'}</span>
      <span className="comparison-divider" aria-hidden="true"><span><ChevronsLeftRight size={22} /></span></span>
      <input type="range" min="0" max="100" value={position} onChange={event => setPosition(Number(event.target.value))} aria-label={english ? 'Compare photograph and illustration' : 'Chuyển giữa ảnh thật và tranh vẽ'} aria-valuetext={english ? `${position}% photograph` : `${position}% ảnh thật`} />
    </div>
  );
}
