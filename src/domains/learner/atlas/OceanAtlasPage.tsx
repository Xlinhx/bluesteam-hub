import { useState } from 'react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import {
  ChevronRight,
  ChevronLeft,
  Ship,
  Grid,
  Image,
  Video,
  FileText,
  Gamepad2,
  Volume2,
  Play,
  X,
  Compass,
  Map,
  Sun,
  Fish,
  Waves,
  Eye,
} from 'lucide-react';
import { oceanAudio } from '../../../shared/audio/oceanAudio';

export function OceanAtlasPage() {
  const { query, navigate } = useRouter();

  // Mode: horizontal ('Từ bờ ra khơi') or vertical ('Lặn xuống biển')
  const [mode, setMode] = useState<'horizontal' | 'vertical'>(
    query.mode === 'vertical' ? 'vertical' : 'horizontal'
  );

  // Horizontal Atlas states
  const [showHumanActivities, setShowHumanActivities] = useState(true);
  const [showBoats, setShowBoats] = useState(true);
  const [showFishingNets, setShowFishingNets] = useState(true);
  const [selectedHorizontalPin, setSelectedHorizontalPin] = useState<'dune' | 'beach' | 'seagrass' | 'offshore' | 'abyss'>('seagrass');

  // Vertical Atlas states
  const [selectedDepth, setSelectedDepth] = useState<'surface' | 'shallow' | 'mid' | 'deep' | 'floor'>('mid');

  const horizontalPins = [
    { id: 'dune', label: 'Cồn cát', left: '7%', top: '17%', pinLineHeight: '40px' },
    { id: 'beach', label: 'Bờ biển', left: '22%', top: '21%', pinLineHeight: '60px' },
    { id: 'seagrass', label: 'Cỏ biển', left: '35%', top: '33%', pinLineHeight: '55px' },
    { id: 'offshore', label: 'Biển khơi', left: '60%', top: '24%', pinLineHeight: '50px' },
    { id: 'abyss', label: 'Biển sâu', left: '93%', top: '50%', pinLineHeight: '50px' },
  ] as const;

  // Dynamic data dictionary for all 5 Horizontal Atlas terrain zones
  const zoneDetails = {
    dune: {
      title: 'Cồn cát',
      image: '/assets/generated/stations/station_hermit_crab.jpg',
      desc: 'Cồn cát ven biển đóng vai trò là đê chắn sóng tự nhiên, giữ nước ngọt và bảo vệ bờ biển khỏi xói lở. Đây là nơi sinh sống của nhiều loài bò sát nhỏ, chim ven biển và thực vật chịu mặn.',
      species: [
        { name: 'Cua cát', image: '/assets/generated/stations/station_hermit_crab.jpg' },
        { name: 'Ốc mượn hồn', image: '/assets/generated/stations/station_hermit_crab.jpg' },
        { name: 'Rau muống biển', image: '/assets/generated/stations/station_seagrass_fish.jpg' },
        { name: 'Chim nhàn', image: '/assets/generated/stations/station_coral_reef.jpg' },
      ],
    },
    beach: {
      title: 'Bờ biển',
      image: '/assets/generated/stations/station_hermit_crab.jpg',
      desc: 'Vùng triều ngập nước theo con nước lớn ròng. Nền cát ẩm ướt là thế giới phong phú của các loài ốc mượn hồn, sò, nghêu và các đàn còng gió chạy thoăn thoắt.',
      species: [
        { name: 'Ốc mượn hồn', image: '/assets/generated/stations/station_hermit_crab.jpg' },
        { name: 'Còng gió', image: '/assets/generated/stations/station_hermit_crab.jpg' },
        { name: 'Sò huyết', image: '/assets/generated/stations/species_starfish.jpg' },
        { name: 'Hải âu', image: '/assets/generated/stations/station_coral_reef.jpg' },
      ],
    },
    seagrass: {
      title: 'Cỏ biển',
      image: '/assets/generated/stations/station_seagrass_fish.jpg',
      desc: 'Cỏ biển là những loài thực vật sống dưới nước ở vùng nước nông, tạo thành những thảm cỏ xanh mướt. Chúng là nơi cư trú, kiếm ăn và ươm mầm cho nhiều loài sinh vật biển, đồng thời góp phần giữ ổn định nền cát và làm sạch nước biển.',
      species: [
        { name: 'Cỏ biển', image: '/assets/generated/stations/station_seagrass_fish.jpg' },
        { name: 'Cá con', image: '/assets/generated/stations/station_seagrass_fish.jpg' },
        { name: 'Sao biển', image: '/assets/generated/stations/species_starfish.jpg' },
        { name: 'Nhím biển', image: '/assets/generated/stations/species_urchin.jpg' },
      ],
    },
    offshore: {
      title: 'Biển khơi',
      image: '/assets/generated/stations/station_coral_reef.jpg',
      desc: 'Vùng nước mở đón ánh nắng ngập tràn và dòng hải lưu dồi dào dinh dưỡng. Nơi đây quy tụ các rạn san hô rực rỡ, đàn cá thu bơi nhanh và các loài rùa biển lớn lặn ngụp kiếm ăn.',
      species: [
        { name: 'Rạn san hô', image: '/assets/generated/stations/station_coral_reef.jpg' },
        { name: 'Rùa biển', image: '/assets/generated/creatures/turtle_isolated.png' },
        { name: 'Cá hề', image: '/assets/ocean/specimen-clownfish.jpg' },
        { name: 'Cá ngừ', image: '/assets/generated/stations/station_seagrass_fish.jpg' },
      ],
    },
    abyss: {
      title: 'Biển sâu',
      image: '/assets/generated/backgrounds/ocean_vertical_atlas_strata.jpg',
      desc: 'Vùng nước sâu thẳm nơi ánh sáng mặt trời không thể chạm tới. Các loài sinh vật ở đây sở hữu khả năng tự phát quang kỳ diệu và cơ thể chịu được áp suất khổng lồ.',
      species: [
        { name: 'Cá cần câu', image: '/assets/generated/creatures/jellyfish_detail.jpg' },
        { name: 'Sứa phát quang', image: '/assets/generated/creatures/jellyfish_detail.jpg' },
        { name: 'Mực ống', image: '/assets/generated/stations/species_starfish.jpg' },
        { name: 'Hải quỳ sâu', image: '/assets/generated/stations/species_urchin.jpg' },
      ],
    },
  };

  const verticalLevels = [
    {
      id: 'surface',
      icon: Sun,
      title: 'Mặt nước',
      depth: '0m – 200m',
      desc: 'Nơi ánh sáng mạnh nhất (100% ánh sáng, 1–20 atm)',
    },
    {
      id: 'shallow',
      icon: Fish,
      title: 'Nước nông',
      depth: '200m – 1.000m',
      desc: 'Vùng ven bờ giàu sự sống (1% ánh sáng mờ, 20–100 atm)',
    },
    {
      id: 'mid',
      icon: Waves,
      title: 'Nước giữa',
      depth: '1.000m – 4.000m',
      desc: 'Bóng tối bao phủ, sứa phát quang Atolla (0% sáng, 100–400 atm)',
    },
    {
      id: 'deep',
      icon: Eye,
      title: 'Nước sâu',
      depth: '4.000m – 6.000m',
      desc: 'Vực thẳm lạnh giá, cá phát quang thích nghi (400–600 atm)',
    },
    {
      id: 'floor',
      icon: Compass,
      title: 'Đáy biển',
      depth: '6.000m – 11.000m+',
      desc: 'Rãnh sâu Mariana & miệng phun thủy nhiệt (>1.000 atm)',
    },
  ] as const;

  return (
    <LearnerShell activeNav="learn">
      <div className="relative min-h-[calc(100vh-72px)] bg-[#0B232F] overflow-hidden select-none font-sans flex flex-col">
        {/* Top Control Bar with Segmented Switch */}
        <div className="relative z-30 px-6 sm:px-10 py-3 flex items-center justify-between pointer-events-none">
          {/* Left info badge for vertical mode */}
          <div className="pointer-events-auto">
            {mode === 'vertical' ? (
              <button
                type="button"
                onClick={() => setMode('horizontal')}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-md text-[#12384B] hover:bg-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-[#17657A]" />
                <div className="text-left">
                  <div className="font-extrabold text-sm text-[#102A38]">Khám phá đại dương</div>
                  <div className="text-[11px] text-[#12384B]/70">Hành trình từ bờ ra khơi, lặn xuống biển sâu</div>
                </div>
              </button>
            ) : (
              <div className="text-white/80 text-xs font-bold tracking-wide uppercase px-2">
                Hải đồ tương tác BlueSTEAM
              </div>
            )}
          </div>

          {/* Center Segmented Toggle: 'Từ bờ ra khơi' vs 'Lặn xuống biển' */}
          <div className="pointer-events-auto flex items-center p-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-white/60">
            <button
              type="button"
              onClick={() => setMode('horizontal')}
              className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                mode === 'horizontal'
                  ? 'bg-[#102A38] text-white shadow-md'
                  : 'text-[#12384B]/75 hover:text-[#12384B]'
              }`}
            >
              Từ bờ ra khơi
            </button>
            <button
              type="button"
              onClick={() => setMode('vertical')}
              className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                mode === 'vertical'
                  ? 'bg-[#102A38] text-white shadow-md'
                  : 'text-[#12384B]/75 hover:text-[#12384B]'
              }`}
            >
              Lặn xuống biển
            </button>
          </div>

          {/* Right Controls */}
          <div className="pointer-events-auto">
            {mode === 'horizontal' ? (
              /* Human Activity Floating Card */
              <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/80 p-3 flex flex-col gap-2 min-w-[210px]">
                <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
                  <span className="text-xs font-extrabold text-[#102A38]">Hoạt động con người</span>
                  <button
                    type="button"
                    onClick={() => setShowHumanActivities((prev) => !prev)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      showHumanActivities ? 'bg-[#17657A]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        showHumanActivities ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {showHumanActivities && (
                  <div className="flex flex-col gap-1.5 text-xs text-[#12384B] font-bold">
                    <label className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80">
                      <div className="flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-[#17657A]" />
                        <span>Tàu thuyền</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={showBoats}
                        onChange={(e) => setShowBoats(e.target.checked)}
                        className="rounded accent-[#17657A] w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-80">
                      <div className="flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5 text-[#17657A]" />
                        <span>Khu vực đánh bắt</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={showFishingNets}
                        onChange={(e) => setShowFishingNets(e.target.checked)}
                        className="rounded accent-[#17657A] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              /* Vertical Atlas: Ocean Map Shortcut */
              <button
                type="button"
                onClick={() => setMode('horizontal')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#102A38] font-extrabold text-xs hover:bg-white transition-all cursor-pointer"
              >
                <Map className="w-4 h-4 text-[#17657A]" />
                <span>Bản đồ đại dương</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* MODE 1: HORIZONTAL ATLAS */}
        {mode === 'horizontal' && (
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
            {/* Panoramic Full-Bleed Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/generated/backgrounds/ocean_horizontal_atlas_panorama.jpg"
                alt="Bản đồ đại dương từ bờ ra khơi"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B232F]/40 via-transparent to-transparent pointer-events-none" />

              {/* Optional Fishing Net Overlay */}
              {showHumanActivities && showFishingNets && (
                <div
                  className="absolute right-[10%] top-[30%] w-72 h-44 border-2 border-dashed border-amber-300/70 rounded-3xl opacity-85 shadow-[0_0_15px_rgba(245,158,11,0.4)] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
              )}
            </div>

            {/* Interactive Pins on Terrain */}
            <div className="relative z-10 w-full flex-1">
              {horizontalPins.map((pin) => {
                const isSelected = selectedHorizontalPin === pin.id;
                return (
                  <div
                    key={pin.id}
                    className="absolute -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                    style={{ left: pin.left, top: pin.top }}
                    onClick={() => setSelectedHorizontalPin(pin.id)}
                  >
                    {/* Pin Bubble */}
                    <div
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg font-extrabold text-xs transition-all ${
                        isSelected
                          ? 'bg-white text-[#102A38] ring-4 ring-[#2EE6CA]/60 scale-110 shadow-[0_4px_16px_rgba(0,0,0,0.25)]'
                          : 'bg-white/90 text-[#12384B] hover:bg-white hover:scale-105'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSelected ? 'bg-[#17657A] animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{pin.label}</span>
                    </div>

                    {/* Pointer Line down to terrain */}
                    <div
                      className={`w-0.5 transition-colors ${
                        isSelected ? 'bg-[#2EE6CA]' : 'bg-white/70'
                      }`}
                      style={{ height: pin.pinLineHeight }}
                    />
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-[#2EE6CA] ring-2 ring-white' : 'bg-white/70'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Bottom Discovery Sheet (Khám phá vùng đã chọn) */}
            <div className="relative z-20 mx-4 sm:mx-6 mb-4 rounded-[28px] bg-white/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.2)] border border-white/80 p-5 lg:p-6 text-[#12384B]">
              <h2 className="font-serif font-bold text-2xl text-[#102A38] tracking-[-0.02em] mb-4">
                Khám phá vùng đã chọn
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Column 1: Featured Zone Information (5 cols) */}
                <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 pr-0 lg:pr-4 lg:border-r lg:border-slate-200">
                  <img
                    src={zoneDetails[selectedHorizontalPin].image}
                    alt={zoneDetails[selectedHorizontalPin].title}
                    className="w-48 h-32 rounded-2xl object-cover shadow-md flex-shrink-0"
                  />
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif font-bold text-2xl text-[#102A38] tracking-[-0.02em]">
                      {zoneDetails[selectedHorizontalPin].title}
                    </h3>
                    <p className="text-xs text-[#12384B]/80 leading-relaxed">
                      {zoneDetails[selectedHorizontalPin].desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/learn/turtle')}
                      className="self-start mt-1 px-4 py-1.5 rounded-full border border-slate-300 text-xs font-extrabold text-[#12384B] hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column 2: Một số loài tiêu biểu (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-2.5 px-0 lg:px-4 lg:border-r lg:border-slate-200">
                  <div className="text-xs font-extrabold text-[#102A38]">Một số loài tiêu biểu</div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {zoneDetails[selectedHorizontalPin].species.map((sp, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                        <img
                          src={sp.image}
                          alt={sp.name}
                          className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <span className="text-[11px] font-bold text-[#12384B]">{sp.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Khám phá thêm (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-2 pl-0 lg:pl-2">
                  <div className="text-xs font-extrabold text-[#102A38]">Khám phá thêm</div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigate('/resources')}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-xs font-extrabold text-[#12384B] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-[#17657A]" />
                        <span>Hình ảnh</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/resources/media')}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-xs font-extrabold text-[#12384B] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#17657A]" />
                        <span>Video</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/resources')}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-xs font-extrabold text-[#12384B] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#17657A]" />
                        <span>Tài liệu</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/interactive')}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-xs font-extrabold text-[#12384B] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-[#17657A]" />
                        <span>Trò chơi</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: VERTICAL OCEAN STRATA */}
        {mode === 'vertical' && (
          <div className="relative flex-1 flex overflow-hidden">
            {/* Vertical Ocean Strata Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/generated/backgrounds/ocean_vertical_atlas_strata.jpg"
                alt="Mặt cắt 5 tầng nước sâu"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/25 pointer-events-none" />
            </div>

            {/* Left Vertical Depth Ruler */}
            <div className="relative z-10 w-84 pl-8 lg:pl-12 py-8 flex flex-col justify-around">
              <div className="relative flex flex-col gap-6">
                {/* Connecting Vertical Line */}
                <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-white/40" />

                {verticalLevels.map((lvl) => {
                  const isSelected = selectedDepth === lvl.id;
                  const Icon = lvl.icon;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setSelectedDepth(lvl.id)}
                      className="relative flex items-center gap-4 group cursor-pointer"
                    >
                      {/* Node Bullet */}
                      <div
                        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#2EE6CA] text-[#0B232F] ring-6 ring-white/30 scale-125 shadow-[0_0_16px_#2EE6CA]'
                            : 'bg-white/80 text-[#12384B] group-hover:scale-110'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current" />
                      </div>

                      {/* Station Text */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-white font-black text-base drop-shadow-md">
                          <Icon className="w-4 h-4 text-[#2EE6CA]" />
                          <span>{lvl.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-[#2EE6CA] font-mono">
                            {lvl.depth}
                          </span>
                        </div>
                        <div className="text-xs text-white/80 drop-shadow">
                          {lvl.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Biological Inspector Card & Activity Card */}
            <div className="relative z-10 ml-auto w-96 pr-8 lg:pr-12 py-8 flex flex-col gap-5 justify-center">
              {/* Top Inspection Card: 'Quan sát sứa vương miện Atolla' */}
              <div className="rounded-[28px] bg-white/95 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.3)] border border-white/80 p-5 text-[#12384B] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#102A38] tracking-[-0.02em]">
                    Quan sát sứa biển sâu
                  </h3>
                  <button
                    type="button"
                    aria-label="Đóng bảng"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full h-44 rounded-2xl overflow-hidden shadow-inner relative bg-slate-900">
                  <img
                    src="/assets/generated/creatures/jellyfish_detail.jpg"
                    alt="Sứa phát quang Atolla"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h4 className="font-serif font-bold text-xl text-[#102A38] tracking-[-0.02em] mb-1">
                    Sứa vương miện Atolla (*Atolla wyvillei*)
                  </h4>
                  <p className="text-xs text-[#12384B]/80 leading-relaxed">
                    Loài sứa biển sâu này phát ra những xung ánh sáng xanh lam rực rỡ để tự vệ khi bị săn đuổi. Khác với sứa mặt trời ở tầng mặt, sứa Atolla chuyên thích nghi với tầng nước giữa lạnh và tối.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      oceanAudio.speak(
                        'Sứa vương miện Atolla sống ở tầng nước giữa sâu thẳm, phát ánh sáng sinh học xanh lam rực rỡ.'
                      )
                    }
                    className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-[#12384B] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Volume2 className="w-4 h-4 text-[#17657A]" />
                    <span>Nghe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      oceanAudio.speak('Bạn đang quan sát sứa phát quang Atolla bơi lội dưới biển sâu.')
                    }
                    className="w-11 h-11 rounded-full bg-[#17657A] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer transition-all"
                  >
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Mini Challenge Card: 'Thử ghép sinh vật vào tầng nước phù hợp' */}
              <div
                onClick={() => navigate('/interactive/habitat-placement')}
                className="rounded-2xl bg-[#0B232F]/90 backdrop-blur-md border border-white/20 p-4 text-white shadow-xl cursor-pointer hover:border-[#2EE6CA]/60 transition-all flex items-center justify-between group"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xl">
                    <span>⭐</span>
                    <span>🐚</span>
                    <span>🌿</span>
                    <span>🪼</span>
                  </div>
                  <div className="font-serif font-bold text-sm text-white group-hover:text-[#2EE6CA] transition-colors">
                    Thử ghép sinh vật vào tầng nước phù hợp
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Khám phá nơi cư trú của từng loài theo độ sâu
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#2EE6CA] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
