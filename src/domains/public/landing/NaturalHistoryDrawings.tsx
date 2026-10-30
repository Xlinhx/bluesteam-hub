/** Decorative vector studies remain crisp independently of the raster artwork. */
export function ShellStudy() {
  const spiral = Array.from({ length: 180 }, (_, index) => {
    const angle = index / 179 * Math.PI * 5;
    const radius = 3 * Math.exp(angle * .21);
    return `${index ? 'L' : 'M'}${220 + Math.cos(angle) * radius},${220 + Math.sin(angle) * radius}`;
  }).join(' ');
  return <svg className="shell-study" viewBox="0 0 440 440" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth=".7">
      <circle cx="220" cy="220" r="168" strokeDasharray="3 7" /><circle cx="220" cy="220" r="123" /><circle cx="220" cy="220" r="73" strokeDasharray="2 5" />
      <path d="M20 220H420M220 20V420M65 65L375 375M65 375L375 65" opacity=".5" /><path className="shell-spiral" d={spiral} strokeWidth="1.2" pathLength="1" strokeDasharray="1" />
      {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${220 + Math.cos(i / 24 * Math.PI * 2) * 165} ${220 + Math.sin(i / 24 * Math.PI * 2) * 165}l${Math.cos(i / 24 * Math.PI * 2) * 10} ${Math.sin(i / 24 * Math.PI * 2) * 10}`} />)}
      <path d="M30 95h40m-20-20v40M350 345h40m-20-20v40" /><circle cx="50" cy="95" r="8" /><circle cx="370" cy="345" r="8" />
    </g>
  </svg>;
}

export function JellyfishStudy() {
  return <svg className="jellyfish-study" viewBox="0 0 340 530" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth=".8">
      <path d="M62 210C-2 77 111 14 205 68c62 35 77 111 46 179-16-32-46-34-65-17-31-31-70-40-124-20Z" />
      <path d="M62 210c35-80 129-99 189 37M70 198C47 108 119 60 162 62M88 189C59 110 129 65 172 68M110 187C86 109 144 71 182 72M141 195C126 129 166 87 193 80M169 207c-7-51 28-96 41-108M199 223c2-38 21-68 30-81" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${64 + i * 13} ${205 + Math.sin(i * .5) * 17} C${-5 + i * 16} ${285 + i * 3},${175 - i * 7} ${330 + i * 5},${25 + i * 10} ${450 + Math.sin(i) * 42}`} opacity={i % 3 === 0 ? 1 : .6} />)}
      <path d="M282 48V490M262 93h40M262 430h40M27 43h230" strokeDasharray="3 6" /><circle cx="282" cy="93" r="25" /><circle cx="282" cy="430" r="21" />
    </g>
  </svg>;
}
