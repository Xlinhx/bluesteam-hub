/** Drawn specimens live in the copy's negative space, where photography cannot occlude them. */
export function HomeSpecimenMark({ kind = 'shore' }: { kind?: '3d' | 'resources' | 'games' | 'shore' }) {
  return <svg className="home-specimen-mark home-nautilus-mark" data-specimen={kind} viewBox="0 0 160 160" fill="none" aria-hidden="true" focusable="false">
    <g className="home-specimen-layer" data-form="shell">
      <path pathLength="1" d="M82 82c0-7-9-9-13-4-6 8 2 18 12 17 17-1 23-21 12-34C77 42 48 52 42 74c-9 34 25 60 56 48 44-18 47-76 7-100C62-4 11 24 12 72"/>
      <path d="M82 82 69 78M82 82 82 95M82 82 97 70M82 82 73 50M82 82 42 74M82 82 49 111M82 82 98 122M82 82 132 90M82 82 116 34M82 82 61 16M82 82 14 56"/>
      <circle cx="80" cy="80" r="72" strokeDasharray="2 6"/>
    </g>
    <g className="home-specimen-layer" data-form="kelp">
      <path d="M78 142Q68 95 79 15M78 116Q39 105 25 70Q64 76 76 99M77 90Q112 82 131 44Q87 56 78 72M79 64Q46 53 38 27Q70 29 80 50M80 42Q103 33 112 13Q85 18 79 33"/>
      <path d="M78 142Q93 109 104 94M75 140Q48 128 38 110M22 143H134" strokeDasharray="3 5"/>
    </g>
    <g className="home-specimen-layer" data-form="fish">
      <path d="M34 57Q69 16 106 57Q69 95 34 57L12 37V77ZM77 113Q103 87 132 113Q103 141 77 113L58 98V129Z"/>
      <circle cx="91" cy="55" r="3"/><circle cx="121" cy="112" r="2"/>
      <path d="M44 16Q94-3 139 41M105 11 140 42 141 18M20 139Q30 150 46 144" strokeDasharray="3 5"/>
    </g>
  </svg>;
}
