export function TurtleColoringSVG() {
  return (
    <svg
      viewBox="0 0 600 800"
      className="w-full h-auto max-h-[680px] stroke-[#12384B] fill-none"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ocean Frame */}
      <rect x="20" y="20" width="560" height="760" rx="24" strokeWidth="3" strokeDasharray="8 6" className="stroke-[#17657A]/40" />
      
      {/* Title block inside sheet */}
      <text x="300" y="65" textAnchor="middle" fill="#12384B" stroke="none" className="font-extrabold text-xl">
        RÙA XANH VÀ THẢM CỎ BIỂN — BÉ TẬP TÔ MÀU
      </text>
      <text x="300" y="90" textAnchor="middle" fill="#17657A" stroke="none" className="text-sm italic">
        BlueSTEAM • Living Ocean Educational Sheets • Khổ A4
      </text>

      {/* Sun rays from top left */}
      <path d="M 50 120 L 120 180" stroke="#F67650" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M 90 120 L 180 200" stroke="#F67650" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M 140 120 L 250 210" stroke="#F67650" strokeWidth="2" strokeDasharray="6 4" />

      {/* Bubbles */}
      <circle cx="210" cy="240" r="14" fill="#F6F3EB" />
      <circle cx="230" cy="205" r="9" fill="#F6F3EB" />
      <circle cx="215" cy="175" r="6" fill="#F6F3EB" />

      {/* Turtle Head & Eye */}
      <path d="M 220 330 C 200 300, 210 270, 240 265 C 270 260, 290 280, 285 315 Z" fill="#F6F3EB" strokeWidth="4" />
      <circle cx="250" cy="285" r="5" fill="#12384B" stroke="none" />
      <circle cx="248" cy="283" r="1.5" fill="#FFF" stroke="none" />

      {/* Left Front Flipper (Main) */}
      <path d="M 250 350 C 230 330, 160 330, 100 370 C 80 385, 95 410, 130 405 C 190 395, 230 385, 260 380 Z" fill="#F6F3EB" strokeWidth="4" />
      
      {/* Right Front Flipper (Perspective) */}
      <path d="M 330 330 C 370 310, 440 315, 480 345 C 495 360, 480 380, 450 375 C 390 365, 350 360, 320 355 Z" fill="#F6F3EB" strokeWidth="3.5" />

      {/* Carapace (Turtle Shell) */}
      <ellipse cx="330" cy="420" rx="120" ry="95" fill="#F6F3EB" strokeWidth="5" />

      {/* Carapace Scutes (Pattern for coloring) */}
      <polygon points="330,355 370,380 370,425 330,450 290,425 290,380" strokeWidth="3" />
      <polygon points="330,450 365,475 365,510 330,515 295,510 295,475" strokeWidth="3" />
      <line x1="330" y1="355" x2="330" y2="330" strokeWidth="3" />
      <line x1="370" y1="380" x2="430" y2="370" strokeWidth="3" />
      <line x1="370" y1="425" x2="445" y2="425" strokeWidth="3" />
      <line x1="365" y1="475" x2="435" y2="475" strokeWidth="3" />
      <line x1="290" y1="380" x2="230" y2="375" strokeWidth="3" />
      <line x1="290" y1="425" x2="215" y2="425" strokeWidth="3" />
      <line x1="295" y1="475" x2="225" y2="475" strokeWidth="3" />

      {/* Rear Flippers */}
      <path d="M 380 505 C 410 535, 440 570, 430 590 C 415 600, 390 580, 370 540 Z" fill="#F6F3EB" strokeWidth="3.5" />
      <path d="M 280 505 C 250 535, 220 570, 230 590 C 245 600, 270 580, 290 540 Z" fill="#F6F3EB" strokeWidth="3.5" />

      {/* Little Tail */}
      <polygon points="325,515 330,545 335,515" fill="#F6F3EB" strokeWidth="3" />

      {/* Sandy Seafloor & Seagrass */}
      <path d="M 20 710 Q 150 690, 300 710 T 580 700 L 580 780 L 20 780 Z" fill="#F6F3EB" strokeWidth="3" />
      
      {/* Seagrass Clusters */}
      <path d="M 70 710 C 60 630, 90 570, 80 520 C 75 570, 100 640, 85 710" fill="#F6F3EB" strokeWidth="3.5" />
      <path d="M 105 715 C 115 650, 95 600, 115 550 C 130 610, 120 670, 115 715" fill="#F6F3EB" strokeWidth="3.5" />
      <path d="M 460 705 C 440 620, 470 560, 455 490 C 475 555, 460 635, 480 705" fill="#F6F3EB" strokeWidth="3.5" />
      <path d="M 495 710 C 520 630, 500 580, 525 530 C 530 595, 515 660, 510 710" fill="#F6F3EB" strokeWidth="3.5" />

      {/* Small Starfish on sand */}
      <polygon points="260,735 266,748 280,748 269,756 273,770 260,760 247,770 251,756 240,748 254,748" fill="#F6F3EB" strokeWidth="2.5" />
    </svg>
  );
}

export function ClownfishColoringSVG() {
  return (
    <svg
      viewBox="0 0 600 800"
      className="w-full h-auto max-h-[680px] stroke-[#12384B] fill-none"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="20" y="20" width="560" height="760" rx="24" strokeWidth="3" strokeDasharray="8 6" className="stroke-[#17657A]/40" />
      
      <text x="300" y="65" textAnchor="middle" fill="#12384B" stroke="none" className="font-extrabold text-xl">
        CÁ HỀ VÀ VƯỜN HẢI QUỲ — BÉ TẬP TÔ MÀU
      </text>
      <text x="300" y="90" textAnchor="middle" fill="#17657A" stroke="none" className="text-sm italic">
        BlueSTEAM • Living Ocean Educational Sheets • Khổ A4
      </text>

      {/* Sea Anemone Tentacles Background */}
      <path d="M 120 700 C 100 560, 160 480, 140 380 C 170 470, 160 580, 160 700" strokeWidth="4" />
      <path d="M 180 700 C 160 520, 230 450, 200 350 C 230 450, 210 580, 220 700" strokeWidth="4" />
      <path d="M 380 700 C 370 540, 440 460, 410 360 C 450 450, 430 580, 420 700" strokeWidth="4" />
      <path d="M 440 700 C 460 550, 500 480, 480 390 C 510 470, 480 590, 475 700" strokeWidth="4" />

      {/* Bubbles */}
      <circle cx="280" cy="230" r="12" fill="#F6F3EB" />
      <circle cx="310" cy="190" r="8" fill="#F6F3EB" />

      {/* Clownfish Body */}
      <path d="M 180 380 C 230 300, 380 300, 430 380 C 400 450, 250 470, 180 380 Z" fill="#F6F3EB" strokeWidth="5" />

      {/* 3 Iconic Clownfish White Stripes */}
      {/* Stripe 1 (Head) */}
      <path d="M 235 325 C 245 355, 245 400, 230 430 L 255 435 C 270 400, 270 355, 255 320 Z" fill="#FFF" strokeWidth="3" />
      
      {/* Stripe 2 (Mid-body with bulge) */}
      <path d="M 310 308 C 330 350, 335 410, 315 450 L 340 448 C 360 405, 355 350, 335 310 Z" fill="#FFF" strokeWidth="3" />

      {/* Stripe 3 (Tail base) */}
      <path d="M 400 345 C 410 370, 410 395, 400 415 L 415 410 C 425 390, 425 370, 415 350 Z" fill="#FFF" strokeWidth="3" />

      {/* Fish Eye */}
      <circle cx="205" cy="355" r="9" fill="#12384B" stroke="none" />
      <circle cx="202" cy="352" r="3" fill="#FFF" stroke="none" />

      {/* Mouth */}
      <path d="M 180 380 Q 190 385, 185 395" strokeWidth="3" />

      {/* Dorsal Fin (Top) */}
      <path d="M 260 318 C 300 270, 370 280, 390 330 Z" fill="#F6F3EB" strokeWidth="4" />

      {/* Caudal Fin (Tail) */}
      <path d="M 425 370 C 475 320, 500 340, 490 385 C 500 425, 470 445, 425 395 Z" fill="#F6F3EB" strokeWidth="4" />

      {/* Pectoral Fin (Side) */}
      <path d="M 270 410 C 290 440, 305 470, 280 480 C 265 470, 260 440, 265 415 Z" fill="#F6F3EB" strokeWidth="3.5" />

      {/* Bottom Reef Rock Floor */}
      <path d="M 20 700 Q 180 670, 340 700 T 580 680 L 580 780 L 20 780 Z" fill="#F6F3EB" strokeWidth="3.5" />
    </svg>
  );
}

export function DepthMatchWorksheetSVG() {
  return (
    <svg
      viewBox="0 0 600 800"
      className="w-full h-auto max-h-[680px] stroke-[#12384B] fill-none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="20" y="20" width="560" height="760" rx="24" strokeWidth="3" strokeDasharray="8 6" className="stroke-[#17657A]/40" />
      
      <text x="300" y="65" textAnchor="middle" fill="#12384B" stroke="none" className="font-extrabold text-xl">
        AI Ở TẦNG NƯỚC NÀO? — BÀI TẬP NỐI HÌNH
      </text>
      <text x="300" y="90" textAnchor="middle" fill="#17657A" stroke="none" className="text-sm italic">
        Bé hãy dùng bút chì nối sinh vật bên trái với tầng nước sinh sống thích hợp bên phải!
      </text>

      {/* Column Headers */}
      <text x="140" y="140" textAnchor="middle" fill="#17657A" stroke="none" className="font-bold text-base">
        [ Sinh Vật Biển ]
      </text>
      <text x="440" y="140" textAnchor="middle" fill="#17657A" stroke="none" className="font-bold text-base">
        [ Tầng Nước Sống ]
      </text>

      {/* Left Item 1: Turtle */}
      <rect x="50" y="170" width="180" height="150" rx="16" strokeWidth="2.5" className="stroke-[#17657A]/60" />
      <text x="140" y="200" textAnchor="middle" fill="#12384B" stroke="none" className="font-bold text-base">
        1. Rùa Xanh
      </text>
      <ellipse cx="140" cy="250" rx="35" ry="25" strokeWidth="2.5" />
      <circle cx="100" cy="245" r="10" strokeWidth="2" />
      <circle cx="230" cy="245" r="8" fill="#F67650" stroke="#12384B" strokeWidth="2" />

      {/* Left Item 2: Lanternfish */}
      <rect x="50" y="360" width="180" height="150" rx="16" strokeWidth="2.5" className="stroke-[#17657A]/60" />
      <text x="140" y="390" textAnchor="middle" fill="#12384B" stroke="none" className="font-bold text-base">
        2. Cá Lồng Đèn
      </text>
      <ellipse cx="140" cy="440" rx="40" ry="18" strokeWidth="2.5" />
      <circle cx="120" cy="450" r="3" fill="#12384B" stroke="none" />
      <circle cx="135" cy="452" r="3" fill="#12384B" stroke="none" />
      <circle cx="150" cy="450" r="3" fill="#12384B" stroke="none" />
      <circle cx="230" cy="435" r="8" fill="#F67650" stroke="#12384B" strokeWidth="2" />

      {/* Left Item 3: Anglerfish */}
      <rect x="50" y="550" width="180" height="150" rx="16" strokeWidth="2.5" className="stroke-[#17657A]/60" />
      <text x="140" y="580" textAnchor="middle" fill="#12384B" stroke="none" className="font-bold text-base">
        3. Cá Vây Chân
      </text>
      <ellipse cx="140" cy="635" rx="35" ry="30" strokeWidth="2.5" />
      <path d="M 130 605 C 130 580, 160 575, 170 590" strokeWidth="2.5" />
      <circle cx="172" cy="592" r="4" fill="#12384B" stroke="none" />
      <circle cx="230" cy="625" r="8" fill="#F67650" stroke="#12384B" strokeWidth="2" />

      {/* Right Item A: Twilight Zone (Scrambled position A -> Lanternfish) */}
      <rect x="350" y="170" width="200" height="150" rx="16" strokeWidth="2.5" className="stroke-[#17657A]/60" />
      <circle cx="350" cy="245" r="8" fill="#2EE6CA" stroke="#12384B" strokeWidth="2" />
      <text x="450" y="215" textAnchor="middle" fill="#12384B" stroke="none" className="font-bold text-base">
        Tầng Hoàng Hôn
      </text>
      <text x="450" y="240" textAnchor="middle" fill="#17657A" stroke="none" className="text-sm font-semibold">
        200m - 1,000m
      </text>
      <text x="450" y="270" textAnchor="middle" fill="#64748B" stroke="none" className="text-xs">
        Ánh sáng lam le lói
      </text>

      {/* Right Item B: Midnight Zone (Scrambled position B -> Anglerfish) */}
      <rect x="350" y="360" width="200" height="150" rx="16" strokeWidth="2.5" className="stroke-[#17657A]/60" />
      <circle cx="350" cy="435" r="8" fill="#2EE6CA" stroke="#12384B" strokeWidth="2" />
      <text x="450" y="405" textAnchor="middle" fill="#12384B" stroke="none" className="font-bold text-base">
        Tầng Nửa Đêm
      </text>
      <text x="450" y="430" textAnchor="middle" fill="#17657A" stroke="none" className="text-sm font-semibold">
        1,000m - 4,000m
      </text>
      <text x="450" y="460" textAnchor="middle" fill="#64748B" stroke="none" className="text-xs">
        Tối đen & Áp suất lớn
      </text>

      {/* Right Item C: Sunlit Zone (Scrambled position C -> Turtle) */}
      <rect x="350" y="550" width="200" height="150" rx="16" strokeWidth="2.5" className="stroke-[#17657A]/60" />
      <circle cx="350" cy="625" r="8" fill="#2EE6CA" stroke="#12384B" strokeWidth="2" />
      <text x="450" y="595" textAnchor="middle" fill="#12384B" stroke="none" className="font-bold text-base">
        Tầng Mặt Trời
      </text>
      <text x="450" y="620" textAnchor="middle" fill="#17657A" stroke="none" className="text-sm font-semibold">
        0m - 200m
      </text>
      <text x="450" y="650" textAnchor="middle" fill="#64748B" stroke="none" className="text-xs">
        Nắng ấm & Thảm cỏ biển
      </text>

      {/* Teacher / Parent grading footer box */}
      <rect x="50" y="720" width="500" height="45" rx="8" strokeWidth="1.5" strokeDasharray="4 4" className="stroke-gray-400" />
      <text x="70" y="748" fill="#64748B" stroke="none" className="text-xs font-semibold">
        Điểm / Đánh giá của cô giáo: ....................................... Ngày: ..... / ..... / 2026
      </text>
    </svg>
  );
}

export function CurrentMazeWorksheetSVG() {
  return (
    <svg
      viewBox="0 0 600 800"
      className="w-full h-auto max-h-[680px] stroke-[#12384B] fill-none"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="20" y="20" width="560" height="760" rx="24" strokeWidth="3" strokeDasharray="8 6" className="stroke-[#17657A]/40" />
      
      <text x="300" y="65" textAnchor="middle" fill="#12384B" stroke="none" className="font-extrabold text-xl">
        DÒNG HẢI LƯU ĐƯA RÙA CON VỀ NHÀ — MÊ CUNG
      </text>
      <text x="300" y="90" textAnchor="middle" fill="#17657A" stroke="none" className="text-sm italic">
        Bé hãy vẽ đường giúp Rùa con bơi theo dòng nước sạch, tránh các đám rác thải nhé!
      </text>

      {/* Start indicator top-left */}
      <circle cx="80" cy="150" r="28" fill="#2EE6CA" stroke="#12384B" strokeWidth="3" />
      <text x="80" y="156" textAnchor="middle" fill="#12384B" stroke="none" className="font-black text-sm">
        XUẤT PHÁT
      </text>

      {/* End indicator center */}
      <circle cx="300" cy="430" r="45" fill="#F67650" stroke="#12384B" strokeWidth="3" />
      <text x="300" y="425" textAnchor="middle" fill="#FFF" stroke="none" className="font-black text-sm">
        RẠN SAN HÔ
      </text>
      <text x="300" y="445" textAnchor="middle" fill="#FFF" stroke="none" className="text-xs">
        VỀ NHÀ
      </text>

      {/* Maze Coral Walls */}
      {/* Outer Boundary Wall */}
      <path d="M 120 150 L 520 150 L 520 700 L 80 700 L 80 190" strokeWidth="5" />

      {/* Layer 1 Internal Ring */}
      <path d="M 140 210 L 460 210 L 460 640 L 140 640 L 140 270" strokeWidth="4" />

      {/* Layer 2 Internal Ring */}
      <path d="M 200 270 L 400 270 L 400 580 L 200 580 L 200 350" strokeWidth="4" />

      {/* Obstacle 1: Ghost Fishing Net */}
      <g transform="translate(430, 230)">
        <rect x="0" y="0" width="50" height="50" fill="#CBD5E1" stroke="#EF4444" strokeWidth="3" />
        <line x1="0" y1="0" x2="50" y2="50" stroke="#EF4444" strokeWidth="2" />
        <line x1="0" y1="50" x2="50" y2="0" stroke="#EF4444" strokeWidth="2" />
        <text x="25" y="65" textAnchor="middle" fill="#EF4444" stroke="none" className="text-[10px] font-bold">Lưới rác</text>
      </g>

      {/* Obstacle 2: Plastic Bag */}
      <g transform="translate(160, 480)">
        <polygon points="10,5 35,5 40,30 25,40 5,30" fill="#CBD5E1" stroke="#EF4444" strokeWidth="3" />
        <text x="22" y="55" textAnchor="middle" fill="#EF4444" stroke="none" className="text-[10px] font-bold">Túi nilon</text>
      </g>

      {/* Safe Path Guide Arrows */}
      <path d="M 170 180 L 320 180" stroke="#17657A" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M 480 300 L 480 450" stroke="#17657A" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M 370 610 L 250 610" stroke="#17657A" strokeWidth="2" strokeDasharray="6 4" />

      <text x="300" y="745" textAnchor="middle" fill="#64748B" stroke="none" className="text-xs">
        Bé hãy nhớ: Nhặt sạch rác trên bờ biển giúp các bạn rùa con luôn bơi lội an toàn!
      </text>
    </svg>
  );
}
