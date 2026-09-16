import { useState, useMemo } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { InteractiveSubNav } from '../../components/interactive/InteractiveSubNav';
import {
  IsometricCubeIcon,
  OceanSparkleIcon,
  RightArrowNavIcon,
  StarfishOutlineDoodle,
  FloatingBubbleIcon,
  OrganicWaveDivider,
  DragToRotateBadge,
} from '../../components/3d/Ocean3DSvgs';
import { Search } from 'lucide-react';

interface CreatureItem {
  id: string;
  name: string;
  category: 'turtle';
  image: string;
  path: string;
  alt: string;
}

const CREATURES_DATA: CreatureItem[] = [
  {
    id: 'turtle',
    name: 'Rùa biển',
    category: 'turtle',
    image: '/assets/generated/creatures/sea_turtle_card.jpg',
    path: '/3dmodel/turtle',
    alt: 'Rùa biển bơi trong rạn san hô',
  },
];

export function Ocean3DExplorePage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter creatures based on search query
  const filteredCreatures = useMemo(() => {
    return CREATURES_DATA.filter((creature) => {
      return (
        searchQuery.trim() === '' ||
        creature.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    });
  }, [searchQuery]);

  return (
    <LearnerShell activeNav="interactive">
      <div className="min-h-[calc(100vh-68px)] bg-[#FBF9F4] font-sans text-[#0E2942] select-none flex flex-col">
        {/* ========================================================================= */}
        {/* HERO BANNER SECTION: "Gặp gỡ những người bạn đại dương"                  */}
        {/* ========================================================================= */}
        <div className="relative w-full overflow-hidden bg-[#0A3D58] text-white">
          {/* Background Ocean & Coral Reef Banner Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/ocean_header_banner.jpg"
              alt="Đại dương xanh rực rỡ với rạn san hô và ánh nắng chiếu qua mặt nước"
              className="w-full h-full object-cover object-[center_40%]"
            />
            {/* Subtle atmospheric vignette gradient overlay for high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A3D58]/90 via-[#0A3D58]/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A3D58]/40 via-transparent to-[#0A3D58]/70 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 pt-10 sm:pt-14 pb-20 sm:pb-24 flex flex-col items-start justify-center">
            {/* Tag / Category Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-cyan-200 text-xs font-bold mb-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#2EE6CA] animate-pulse" />
              <span>Thế giới 3D sinh vật biển</span>
            </div>

            {/* Main Heading with beautiful responsive typography - kept on 1 line on desktop */}
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-[38px] leading-tight text-white tracking-tight drop-shadow-sm max-w-4xl sm:whitespace-nowrap">
              Gặp gỡ những người bạn <span className="whitespace-nowrap">đại dương</span>
            </h1>

            {/* Subtitle with proper spacing */}
            <p className="mt-2 text-xs sm:text-sm lg:text-base text-cyan-100/90 font-medium max-w-xl leading-relaxed drop-shadow-xs">
              Chọn một bạn, xoay thật gần và cùng khám phá.
            </p>
          </div>

          {/* Organic Wave Curve Divider at bottom of Hero */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
            <OrganicWaveDivider fillColor="#FBF9F4" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-NAVIGATION BAR (3 Tabs Centered Overlap)                             */}
        {/* ========================================================================= */}
        <div className="max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-12 flex justify-center -mt-4 sm:-mt-6 relative z-30">
          <InteractiveSubNav activeTab="3d" />
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: Heading, Search, Filter Pills & Cards Grid                    */}
        {/* ========================================================================= */}
        <div className="relative max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-12 pt-7 sm:pt-9 pb-16 flex-1 space-y-7">
          {/* Ambient Decorative Marine Elements */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            {/* Left margin bubbles */}
            <FloatingBubbleIcon size={20} className="absolute left-2 top-4 opacity-50" />
            <FloatingBubbleIcon size={12} className="absolute left-7 top-14 opacity-35" />
            <FloatingBubbleIcon size={16} className="absolute left-4 top-28 opacity-40" />

            {/* Right margin starfish & bubbles */}
            <StarfishOutlineDoodle className="w-9 h-9 sm:w-10 sm:h-10 text-[#17657A]/20 absolute right-4 sm:right-8 top-3 hidden sm:block" />
            <FloatingBubbleIcon size={18} className="absolute right-14 top-16 opacity-40 hidden sm:block" />
            <FloatingBubbleIcon size={10} className="absolute right-22 top-8 opacity-30 hidden sm:block" />
          </div>

          {/* Title Row + Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            {/* Title with Cyan Sparkle */}
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-[34px] text-[#0E2942] tracking-[-0.02em]">
                Bé muốn ngắm bạn nào?
              </h2>
              <OceanSparkleIcon className="w-5 h-5 text-[#2EE6CA] shrink-0" />
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#8A9BA8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sinh vật..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#E2E8ED] text-xs sm:text-sm font-semibold text-[#0E2942] placeholder-[#8A9BA8] focus:outline-none focus:ring-2 focus:ring-[#17657A]/40 focus:border-[#17657A] shadow-[0_1px_3px_rgba(16,42,56,0.04)] transition-all"
              />
            </div>
          </div>

          {/* Creature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {filteredCreatures.map((creature) => {
              return (
                <div
                  key={creature.id}
                  className="group rounded-[28px] bg-white border border-[#EAE5DB]/70 shadow-[0_4px_24px_rgba(16,42,56,0.06)] hover:shadow-[0_14px_36px_rgba(16,42,56,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Viewport / Image Container */}
                  <div className="w-[calc(100%-16px)] h-44 sm:h-48 mx-auto mt-2 sm:mt-2.5 relative rounded-[20px] overflow-hidden bg-[#1B8A9E] shadow-inner">
                    <div className="w-full h-full relative group/img overflow-hidden">
                      <img
                        src={creature.image}
                        alt={creature.alt}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Top-Right 360 Rotation SVG Badge matching mockup */}
                    <div className="absolute top-2.5 right-3.5 z-10 pointer-events-none">
                      <DragToRotateBadge />
                    </div>
                  </div>

                  {/* Bottom Bar: Isometric Cube Icon + Name + "Quan sát ➔" */}
                  <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2 mt-auto bg-white">
                    {/* Left: Soft circle with 3D Isometric Cube Icon + Creature Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#EBF2F7] flex items-center justify-center text-[#0E2942] shrink-0 shadow-xs">
                        <IsometricCubeIcon className="w-4 h-4 text-[#0E2942]" />
                      </div>
                      <span className="font-serif font-black text-base sm:text-lg text-[#0E2942] tracking-tight truncate">
                        {creature.name}
                      </span>
                    </div>

                    {/* Right: "Quan sát ➔" rounded pill button */}
                    <button
                      type="button"
                      onClick={() => navigate(creature.path)}
                      className="px-4 sm:px-4.5 py-1.5 sm:py-2 rounded-full bg-[#F3EFEB] hover:bg-[#0E2942] text-[#0E2942] hover:text-white font-bold text-xs sm:text-[13px] flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0 active:scale-95 shadow-xs"
                      aria-label={`Quan sát mô hình ${creature.name}`}
                    >
                      <span>Quan sát</span>
                      <RightArrowNavIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search Result State */}
          {filteredCreatures.length === 0 && (
            <div className="py-16 text-center text-[#5C7482] space-y-3">
              <p className="text-sm font-bold">Không tìm thấy sinh vật phù hợp với "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                }}
                className="px-5 py-2 rounded-full bg-[#0E2942] text-white text-xs font-bold cursor-pointer hover:bg-[#163B4E] transition-all"
              >
                Hiển thị lại sinh vật
              </button>
            </div>
          )}
        </div>
      </div>
    </LearnerShell>
  );
}
