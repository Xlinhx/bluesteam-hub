const artwork = '/assets/creative/c02-reference';

export function ScanLifeIllustration() {
  return <div className="scan-life-illustration" role="img" aria-label="Tranh cá voi bằng sáp màu và chú cá cam từ trang giấy bơi vào biển.">
    <div className="scan-life-wood" />
    <img className="scan-life-drawing" src={`${artwork}/scan-drawing.webp`} alt="" />
    <img className="scan-life-fish-paper" src={`${artwork}/scan-fish-paper.webp`} alt="" />
    <img className="scan-life-fish-water" src={`${artwork}/scan-fish-water.webp`} alt="" />
    <svg className="scan-life-arrow" viewBox="0 0 100 75" aria-hidden="true">
      <path d="M4 67C29 69 31 14 82 25M75 12L86 26 72 32" fill="none" stroke="#15586e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <svg className="scan-life-splash" viewBox="0 0 45 50" aria-hidden="true">
      <path d="M7 29Q9 12 18 9M19 36L36 22M24 43L40 41" fill="none" stroke="#15586e" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </div>;
}
