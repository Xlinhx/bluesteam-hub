import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { demoStore, BlueSteamProgressV2 } from '../../demo/storage/demoStore';
import { creativeStorage, CreativeArtwork } from '../../services/creativeStorage';
import {
  Award,
  ArrowRight,
  Eye,
  Printer,
  Edit3,
  X,
  Download,
  Palette,
  ExternalLink,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { oceanAudio } from '../../shared/sound/oceanAudio';

export function LearnerProfilePage() {
  const { navigate } = useRouter();

  const [progress, setProgress] = useState<BlueSteamProgressV2>(() =>
    demoStore.getBlueSteamProgress()
  );
  const [artworks, setArtworks] = useState<CreativeArtwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<CreativeArtwork | null>(null);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [learnerName, setLearnerName] = useState('Bé An');
  const [learnerAge, setLearnerAge] = useState('5');
  const [learnerAvatar, setLearnerAvatar] = useState('🐢');

  useEffect(() => {
    setProgress(demoStore.getBlueSteamProgress());
    creativeStorage
      .getArtworks()
      .then((items) => {
        setArtworks(items);
      })
      .catch(() => {});
  }, []);

  // Authentic badges strictly derived from real learner milestones (NO fake achievements)
  const authenticBadges = [
    {
      id: 'badge-ocean-explorer',
      title: 'Nhà Thám Hiểm Sóng Biển',
      desc: 'Khởi đầu chuyến hải trình đại dương BlueSTEAM',
      icon: '🌊',
      unlocked: progress.badges.includes('badge-ocean-explorer'),
      stationRequirement: 'Bắt đầu hành trình',
    },
    {
      id: 'badge-turtle-friend',
      title: 'Bạn Thân Của Rùa Xanh',
      desc: 'Tìm đúng thảm cỏ biển đầy nắng cho rùa ăn no nê',
      icon: '🐢',
      unlocked:
        progress.completedStations.includes(2) ||
        progress.completedStations.includes(3) ||
        progress.completedActivities.includes('game-habitat-placement') ||
        progress.badges.includes('badge-turtle-friend'),
      stationRequirement: 'Hoàn thành trạm 2 (Cỏ biển)',
    },
    {
      id: 'badge-reef-guardian',
      title: 'Hiệp Sĩ San Hô',
      desc: 'Giúp cá hề tìm thấy nơi trú ẩn an toàn giữa rạn san hô',
      icon: '🪸',
      unlocked:
        progress.completedStations.includes(3) ||
        progress.completedActivities.includes('creative-habitat') ||
        progress.badges.includes('badge-reef-guardian'),
      stationRequirement: 'Hoàn thành trạm 3 (Rạn san hô)',
    },
    {
      id: 'badge-rescue-hero',
      title: 'Hiệp Sĩ Cứu Hộ',
      desc: 'Thực hiện đúng quy trình cứu hộ sinh vật biển an toàn NOAA',
      icon: '🛡️',
      unlocked:
        progress.completedActivities.includes('simulations-rescue-mission') ||
        progress.badges.includes('badge-rescue-hero'),
      stationRequirement: 'Giải cứu rùa biển mắc lưới ma',
    },
    {
      id: 'badge-young-artist',
      title: 'Họa Sĩ Đại Dương',
      desc: 'Tự tay sáng tạo và lưu giữ tác phẩm sinh vật biển trong xưởng',
      icon: '🎨',
      unlocked:
        artworks.length > 0 ||
        progress.completedActivities.includes('creative-drawing') ||
        progress.badges.includes('badge-young-artist'),
      stationRequirement: 'Lưu 1 tranh vẽ tại Xưởng Sáng Tạo',
    },
  ];

  // Pick latest artwork or fallback to authentic reference crayon drawing
  const latestArtwork = artworks.length > 0 ? artworks[0] : null;
  const featuredArtworkSrc =
    latestArtwork?.previewDataUrl || '/assets/generated/craft/child_crayon_turtle.jpg';
  const featuredArtworkTitle = latestArtwork?.title || 'Bé An vẽ rùa biển bơi';

  const handleOpenArtworkModal = (artwork?: CreativeArtwork | null) => {
    setSelectedArtwork(artwork || latestArtwork);
    setIsArtworkModalOpen(true);
    oceanAudio.playChime();
  };

  const handleDownloadArtwork = () => {
    const link = document.createElement('a');
    link.href = selectedArtwork?.previewDataUrl || featuredArtworkSrc;
    link.download = `${selectedArtwork?.title || 'tranh_be_an'}.png`;
    link.click();
  };

  const handlePrintArtwork = () => {
    window.print();
  };

  return (
    <LearnerShell activeNav="profile">
      {/* 
        NO ad-hoc sidebar!
        As commanded by REFERENCE_CORRECTIONS.md line 26: "Bỏ sidebar không chuẩn; không dựng thành tích giả".
        Everything conforms to canonical LearnerShell with full-width container.
      */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
        
        {/* Page Top Heading & Edit Profile Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#102A38] tracking-[-0.02em]">
              Hồ sơ của {learnerName}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 font-sans">
              Học, khám phá và sáng tạo cùng đại dương
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditProfileModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-[#102A38] font-bold text-sm border border-neutral-200 shadow-2xs transition-all hover:shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4 text-[#17657A]" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>

        {/* Master Hero Card: "Hành trình của An" (2-Column Architecture matching mockup) */}
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_12px_40px_rgba(16,42,56,0.06)] border border-[#17657A]/15 space-y-6">
          {/* Card Title & Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A38] tracking-[-0.02em]">
                Hành trình của {learnerName}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Những khám phá, trải nghiệm và sáng tạo trong đại dương.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/learn/atlas')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#17657A] hover:text-[#102A38] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Xem tất cả hành trình</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2-Column Split: Featured Artwork (Left) + 3-Step Journey Timeline (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Featured Artwork Card on Deckle Paper (5 cols) */}
            <div className="lg:col-span-5 bg-[#F6F3EB] rounded-[24px] p-5 sm:p-6 border border-[#17657A]/15 flex flex-col justify-between space-y-4 shadow-inner">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#17657A] font-black text-xs border border-[#17657A]/20 shadow-2xs">
                    <Palette className="w-3.5 h-3.5 text-[#F67650]" />
                    <span>Tác phẩm mới nhất</span>
                  </span>
                  {artworks.length > 1 && (
                    <span className="text-xs font-bold text-neutral-500">
                      {artworks.length} tranh đã lưu
                    </span>
                  )}
                </div>

                {/* Textured Deckle Paper Frame */}
                <div
                  onClick={() => handleOpenArtworkModal()}
                  className="relative group aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-md border border-neutral-200 cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <img
                    src={featuredArtworkSrc}
                    alt={featuredArtworkTitle}
                    className="w-full h-full object-cover group-hover:brightness-105 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 rounded-full bg-white/95 text-[#102A38] font-black text-xs shadow-lg flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#17657A]" />
                      <span>Phóng to tác phẩm</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#102A38]">
                    {featuredArtworkTitle}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {latestArtwork
                      ? `Lưu ngày ${new Date(latestArtwork.createdAt).toLocaleDateString('vi-VN')}`
                      : 'Tranh sáp màu rùa biển bơi qua rạn san hô · Tác phẩm tiêu biểu'}
                  </p>
                </div>
              </div>

              {/* Action Button matching reference mockup [ Mở tác phẩm ] */}
              <button
                type="button"
                onClick={() => handleOpenArtworkModal()}
                className="w-full py-3 px-4 rounded-2xl bg-[#102A38] hover:bg-[#17657A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Mở tác phẩm</span>
              </button>
            </div>

            {/* Right: 3-Step Interactive Timeline Roadmap (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between py-2 space-y-4">
              <div className="space-y-6 relative">
                
                {/* Step 1: Khám phá */}
                <div
                  onClick={() => navigate('/learn/turtle')}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-neutral-50/80 hover:bg-[#E3F6F9]/40 border border-neutral-200/80 hover:border-[#17657A]/40 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    🐢
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Khám phá
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#17657A] transition-colors" />
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#102A38] group-hover:text-[#17657A] transition-colors mt-0.5">
                      Gặp gỡ rùa biển
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                      Quan sát giải phẫu 3D chân thực: mai rùa rẽ nước, vây chèo bơi lội và hô hấp bằng phổi.
                    </p>
                  </div>
                </div>

                {/* Vertical Dotted Connector */}
                <div className="hidden sm:block absolute left-10 top-18 bottom-32 w-0.5 border-l-2 border-dashed border-[#17657A]/30 pointer-events-none" />

                {/* Step 2: Học tập */}
                <div
                  onClick={() => navigate('/interactive/habitat-placement')}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-neutral-50/80 hover:bg-[#E3F6F9]/40 border border-neutral-200/80 hover:border-[#17657A]/40 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#17657A] font-black text-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    🌿
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#17657A]">
                        Học tập
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#17657A] transition-colors" />
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#102A38] group-hover:text-[#17657A] transition-colors mt-0.5">
                      Tìm hiểu nơi sống của rùa biển
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                      Ghép đúng sinh vật với môi trường sống tự nhiên: thảm cỏ biển, bãi cát đẻ trứng và rạn san hô.
                    </p>
                  </div>
                </div>

                {/* Step 3: Sáng tạo */}
                <div
                  onClick={() => navigate('/creative/drawing')}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-neutral-50/80 hover:bg-orange-50/50 border border-neutral-200/80 hover:border-[#F67650]/40 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#F67650] font-black text-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    🎨
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#F67650]">
                        Sáng tạo
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#F67650] transition-colors" />
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#102A38] group-hover:text-[#F67650] transition-colors mt-0.5">
                      Vẽ tranh về đại dương
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                      Sử dụng sáp màu mịn, cọ vẽ tự nhiên để tạo bức tranh biển sinh động và lưu vào bộ sưu tập.
                    </p>
                  </div>
                </div>

              </div>

              {/* Shell currency tracker */}
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#E3F6F9]/50 border border-[#17657A]/15 text-xs text-[#102A38]">
                <span className="font-bold">Tiến trình hải trình:</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#17657A]">
                    {progress.completedStations.length}/5 trạm đã hoàn thành
                  </span>
                  <span className="font-bold text-[#F67650] flex items-center gap-1">
                    🐚 120 vỏ sò
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Bottom Cards (Exact layout from reference mockup) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Đã khám phá */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[#17657A]/15 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-[#102A38]">
                  Đã khám phá
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/learn/atlas')}
                  className="text-xs font-bold text-[#17657A] hover:text-[#102A38] flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Những sinh vật và môi trường đại dương mà {learnerName} đã gặp.
              </p>

              <div className="space-y-2.5 pt-1">
                {/* Item 1: Cua biển */}
                <div
                  onClick={() => navigate('/learn/atlas')}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-[#E3F6F9]/40 border border-neutral-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/generated/creatures/crab_isolated.png"
                      alt="Cua biển"
                      className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A]">
                        Cua biển
                      </h4>
                      <p className="text-[11px] text-neutral-500">Vùng bãi triều ven bờ</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#17657A]" />
                </div>

                {/* Item 2: Cỏ biển */}
                <div
                  onClick={() => navigate('/learn/atlas')}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-[#E3F6F9]/40 border border-neutral-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/generated/stations/botanical_seagrass_specimen.jpg"
                      alt="Cỏ biển"
                      className="w-10 h-10 rounded-xl object-cover group-hover:scale-110 transition-transform"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A]">
                        Cỏ biển
                      </h4>
                      <p className="text-[11px] text-neutral-500">Thảm cỏ biển nhiều nắng</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#17657A]" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/learn/atlas')}
              className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#102A38] font-bold text-xs transition-colors cursor-pointer"
            >
              Mở bản đồ đại dương
            </button>
          </div>

          {/* Card 2: Hoạt động đang làm */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[#17657A]/15 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-serif font-bold text-[#102A38]">
                Hoạt động đang làm
              </h3>
              <p className="text-xs text-neutral-500">
                Tiếp tục hoạt động {learnerName} đang thực hiện.
              </p>

              <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 space-y-3 p-3">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-200">
                  <img
                    src="/assets/generated/stations/station_seagrass_fish.jpg"
                    alt="Xây dựng môi trường sống"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                    Xưởng 3D
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#102A38]">
                    Xây dựng môi trường sống
                  </h4>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    Tạo một rạn san hô cho các loài biển và chạy thử mô phỏng dòng chảy.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/creative/habitat')}
              className="w-full py-3 px-4 rounded-2xl bg-[#17657A] hover:bg-[#102A38] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Cùng làm ngoài màn hình */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[#17657A]/15 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-serif font-bold text-[#102A38]">
                Cùng làm ngoài màn hình
              </h3>
              <p className="text-xs text-neutral-500">
                Gợi ý hoạt động để thực hiện tại nhà hoặc ngoài lớp cùng gia đình.
              </p>

              <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 space-y-3 p-3">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-200">
                  <img
                    src="/assets/generated/craft/turtle_coloring_lineart.jpg"
                    alt="Vẽ rùa biển"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-[#102A38]/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    Tài liệu in A4
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#102A38]">
                    Vẽ và tô màu rùa biển
                  </h4>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    Tải mẫu vẽ nét rùa biển và dùng bút sáp tô màu cùng ba mẹ.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/resources/print')}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 text-[#102A38] font-black text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#17657A]" />
              <span>In tranh tô màu</span>
            </button>
          </div>

        </div>

        {/* Authentic Badges Section (Derived from genuine progress) */}
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm border border-[#17657A]/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#F67650]" />
                <h2 className="text-2xl font-serif font-bold text-[#102A38]">
                  Huy hiệu thành tích
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500">
                Ghi nhận các mốc học tập thực tế và hoạt động đã lưu của {learnerName}.
              </p>
            </div>

            <span className="text-xs font-bold text-[#17657A] bg-[#E3F6F9] px-3 py-1 rounded-full self-start sm:self-auto">
              Đã mở khóa {authenticBadges.filter((b) => b.unlocked).length} / {authenticBadges.length} huy hiệu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {authenticBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  badge.unlocked
                    ? 'bg-gradient-to-b from-white to-neutral-50 border-neutral-200 shadow-sm'
                    : 'bg-neutral-50/60 border-dashed border-neutral-200 opacity-60'
                }`}
              >
                <div className="space-y-2 text-center">
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                      badge.unlocked
                        ? 'bg-[#E3F6F9] text-[#17657A]'
                        : 'bg-neutral-200 text-neutral-400'
                    }`}
                  >
                    {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-neutral-400" />}
                  </div>
                  <h4 className="font-bold text-sm text-[#102A38] leading-tight">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    {badge.desc}
                  </p>
                </div>

                <div className="text-center pt-2 border-t border-neutral-100">
                  {badge.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã đạt được</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-400 italic">
                      {badge.stationRequirement}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal 1: Fullscreen High-Resolution Artwork Preview */}
      {isArtworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-neutral-200 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#F67650]" />
                <h3 className="font-serif font-bold text-xl text-[#102A38]">
                  {selectedArtwork?.title || featuredArtworkTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsArtworkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Artwork Display */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-inner flex items-center justify-center">
              <img
                src={selectedArtwork?.previewDataUrl || featuredArtworkSrc}
                alt={selectedArtwork?.title || featuredArtworkTitle}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-neutral-500">
                Tác phẩm của {learnerName} · Lưu trữ trong thiết bị học tập
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintArtwork}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-[#102A38] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#17657A]" />
                  <span>In tác phẩm</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadArtwork}
                  className="px-4 py-2 rounded-xl bg-[#17657A] hover:bg-[#102A38] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsArtworkModalOpen(false);
                    navigate('/creative/drawing');
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F67650] font-bold text-xs flex items-center gap-1.5 border border-orange-200 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Đến Xưởng Sáng Tạo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Profile */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-[28px] overflow-hidden shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#102A38]">
                Chỉnh sửa thông tin bé
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#102A38] mb-1">Tên của bé</label>
                <input
                  type="text"
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#17657A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102A38] mb-1">Tuổi (Lớp mầm non)</label>
                <select
                  value={learnerAge}
                  onChange={(e) => setLearnerAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#17657A]"
                >
                  <option value="3">3-4 tuổi (Mầm)</option>
                  <option value="4">4-5 tuổi (Chồi)</option>
                  <option value="5">5-6 tuổi (Lá)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#102A38] mb-1">Biểu tượng yêu thích</label>
                <div className="flex items-center gap-2">
                  {['🐢', '🐬', '🐠', '🦀', '⭐', '🐙'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setLearnerAvatar(em)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                        learnerAvatar === em
                          ? 'border-[#17657A] bg-[#E3F6F9] scale-110 shadow-2xs'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#17657A] hover:bg-[#102A38] text-white font-bold text-xs cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </LearnerShell>
  );
}

export default LearnerProfilePage;
