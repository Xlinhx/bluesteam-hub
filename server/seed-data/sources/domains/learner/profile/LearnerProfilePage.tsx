import { useState, useEffect } from 'react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { demoStore, BlueSteamProgressV2 } from '../../../shared/realtime/demoStore';
import { creativeStorage, CreativeArtwork } from '../creative-studio/creativeStorage';
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
  User,
  Check,
} from 'lucide-react';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { TiltCard } from '../../../shared/ui/cards/TiltCard';

export function LearnerProfilePage() {
  const { navigate } = useRouter();

  const [progress, setProgress] = useState<BlueSteamProgressV2>(() =>
    demoStore.getBlueSteamProgress()
  );
  const [artworks, setArtworks] = useState<CreativeArtwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<CreativeArtwork | null>(null);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Profile data initialized from demoStore
  const initialProfile = demoStore.getProfile();
  const resolveLearnerAvatar = (key?: string, gender?: 'boy' | 'girl') => {
    if (key && (key.startsWith('/') || key.startsWith('http') || key.startsWith('data:'))) {
      return key;
    }
    return gender === 'girl' ? '/assets/avatar_mai.png' : '/assets/avatar_an.png';
  };

  const [learnerName, setLearnerName] = useState(() =>
    initialProfile.role === 'student' && initialProfile.name ? initialProfile.name : 'Bé An'
  );
  const [learnerAge, setLearnerAge] = useState(() => initialProfile.age || '5');
  const [learnerGender, setLearnerGender] = useState<'boy' | 'girl'>(() => initialProfile.gender || 'boy');
  const [learnerAvatar, setLearnerAvatar] = useState(() =>
    resolveLearnerAvatar(initialProfile.avatarKey, initialProfile.gender || 'boy')
  );

  // Draft state for modal editing
  const [draftName, setDraftName] = useState(learnerName);
  const [draftAge, setDraftAge] = useState(learnerAge);
  const [draftGender, setDraftGender] = useState(learnerGender);
  const [draftAvatar, setDraftAvatar] = useState(learnerAvatar);

  const handleOpenEditModal = () => {
    setDraftName(learnerName);
    setDraftAge(learnerAge);
    setDraftGender(learnerGender);
    setDraftAvatar(learnerAvatar);
    setIsEditProfileModalOpen(true);
  };

  const handleSelectGender = (gender: 'boy' | 'girl') => {
    setDraftGender(gender);
    if (gender === 'boy') {
      setDraftAvatar('/assets/avatar_an.png');
      if (draftName === 'Bé Mai') setDraftName('Bé An');
    } else {
      setDraftAvatar('/assets/avatar_mai.png');
      if (draftName === 'Bé An') setDraftName('Bé Mai');
    }
  };

  const handleSaveProfile = () => {
    const finalName = draftName.trim() || (draftGender === 'boy' ? 'Bé An' : 'Bé Mai');
    setLearnerName(finalName);
    setLearnerAge(draftAge);
    setLearnerGender(draftGender);
    setLearnerAvatar(draftAvatar);
    demoStore.setProfile({
      role: 'student',
      id: 'student-demo',
      name: finalName,
      avatarKey: draftAvatar,
      gender: draftGender,
      age: draftAge,
    });
    setIsEditProfileModalOpen(false);
    oceanAudio.playChime();
  };

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

  // Pick latest artwork or fallback to authentic reference crayon drawing from mockup
  const latestArtwork = artworks.length > 0 ? artworks[0] : null;
  const featuredArtworkSrc =
    latestArtwork?.previewDataUrl || '/assets/generated/craft/child_crayon_turtle_mockup.png';
  const featuredArtworkTitle = latestArtwork?.title || 'Bức tranh của An';

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
    <LearnerShell activeNav="profile" learnerName={learnerName} learnerAvatar={learnerAvatar}>
      {/* 
        NO ad-hoc sidebar!
        As commanded by REFERENCE_CORRECTIONS.md line 26: "Bỏ sidebar không chuẩn; không dựng thành tích giả".
        Everything conforms to canonical LearnerShell with full-width container.
      */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
        
        {/* Page Top Heading & Edit Profile Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] rounded-full shrink-0"
              aria-label="Đổi ảnh hồ sơ"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md border border-[#17657A]/20">
                <img
                  src={learnerAvatar}
                  alt={learnerName}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = learnerGender === 'girl' ? '/assets/avatar_mai.png' : '/assets/avatar_an.png';
                  }}
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                <Edit3 className="w-4 h-4" />
              </div>
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#102A38] tracking-[-0.02em]">
                  Hồ sơ của {learnerName}
                </h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E3F6F9] text-[#17657A] border border-[#17657A]/20 shadow-2xs">
                  {learnerGender === 'girl' ? 'Bé Gái' : 'Bé Trai'} • {learnerAge === '3' ? '3-4 tuổi (Mầm)' : learnerAge === '4' ? '4-5 tuổi (Chồi)' : '5-6 tuổi (Lá)'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-neutral-600 font-sans">
                Học, khám phá và sáng tạo cùng đại dương
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-[#102A38] font-bold text-sm border border-neutral-200 shadow-2xs transition-all hover:shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Edit3 className="w-4 h-4 text-[#17657A]" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>

        {/* Master Hero Card: "Hành trình của An" (Matching Mockup Image 1) */}
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgba(16,42,56,0.06)] border border-[#17657A]/15 space-y-6">
          {/* Card Title & Link - Clean header without dividing border line */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A38] tracking-[-0.02em]">
                Hành trình của {learnerName.replace('Bé ', '')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Những khám phá, trải nghiệm và sáng tạo trong đại dương.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/learn/atlas')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#17657A] hover:text-[#102A38] transition-colors cursor-pointer shrink-0"
            >
              <span>Xem tất cả hành trình</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2-Column Split: Featured Artwork (Left) + 3 Action Badges Timeline (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Featured Artwork Card (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              {/* Drawing Container */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-neutral-200/90 shadow-xs">
                <img
                  src={featuredArtworkSrc}
                  alt={featuredArtworkTitle}
                  className="w-full h-full object-cover"
                />

                {/* Action Button matching reference mockup [ Mở tác phẩm ] */}
                <button
                  type="button"
                  onClick={() => handleOpenArtworkModal()}
                  className="absolute bottom-3 right-3 py-2 px-4 rounded-xl bg-[#0B4D57] hover:bg-[#146472] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer z-10"
                >
                  <Eye className="w-4 h-4" />
                  <span>Mở tác phẩm</span>
                </button>
              </div>

              {/* Title & subtitle below drawing */}
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#102A38]">
                  {featuredArtworkTitle}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  An vẽ chú rùa biển đang bơi dưới đại dương.
                </p>
              </div>
            </div>

            {/* Right: 3 Action Badges with Vertical Connecting Dots (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center py-2">
              <div className="space-y-0.5">
                
                {/* Step 1: Khám phá */}
                <div
                  onClick={() => navigate('/3dmodel/turtle')}
                  className="flex items-center gap-4 py-2 hover:bg-neutral-50/80 -mx-3 px-3 rounded-2xl transition-colors cursor-pointer group"
                >
                  {/* Large pastel circular badge */}
                  <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#B3EDE7] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/assets/generated/badges/badge_explore_action.png"
                      alt="Khám phá"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-serif font-bold text-[#102A38] group-hover:text-[#17657A] transition-colors">
                      Khám phá
                    </h4>
                    <p className="text-sm text-neutral-600 font-medium mt-0.5">
                      Gặp gỡ rùa biển
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#102A38] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* 2 Vertical Connecting Dots between Step 1 and Step 2 */}
                <div className="flex flex-col items-center w-[72px] sm:w-[80px] py-1.5 space-y-2">
                  <span className="w-2 h-2 rounded-full bg-[#187588]" />
                  <span className="w-2 h-2 rounded-full bg-[#187588]" />
                </div>

                {/* Step 2: Học tập */}
                <div
                  onClick={() => navigate('/interactive/habitat-placement')}
                  className="flex items-center gap-4 py-2 hover:bg-neutral-50/80 -mx-3 px-3 rounded-2xl transition-colors cursor-pointer group"
                >
                  {/* Large pastel circular badge */}
                  <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#B6EFE3] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/assets/generated/badges/badge_learn_action.png"
                      alt="Học tập"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-serif font-bold text-[#102A38] group-hover:text-[#17657A] transition-colors">
                      Học tập
                    </h4>
                    <p className="text-sm text-neutral-600 font-medium mt-0.5">
                      Tìm hiểu nơi sống của rùa biển
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#102A38] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* 2 Vertical Connecting Dots between Step 2 and Step 3 */}
                <div className="flex flex-col items-center w-[72px] sm:w-[80px] py-1.5 space-y-2">
                  <span className="w-2 h-2 rounded-full bg-[#187588]" />
                  <span className="w-2 h-2 rounded-full bg-[#187588]" />
                </div>

                {/* Step 3: Sáng tạo */}
                <div
                  onClick={() => navigate('/creative/drawing')}
                  className="flex items-center gap-4 py-2 hover:bg-neutral-50/80 -mx-3 px-3 rounded-2xl transition-colors cursor-pointer group"
                >
                  {/* Large pastel circular badge */}
                  <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#FFD1C4] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src="/assets/generated/badges/badge_create_action.png"
                      alt="Sáng tạo"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-serif font-bold text-[#102A38] group-hover:text-[#F67650] transition-colors">
                      Sáng tạo
                    </h4>
                    <p className="text-sm text-neutral-600 font-medium mt-0.5">
                      Vẽ tranh về đại dương
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#102A38] shrink-0 group-hover:translate-x-0.5 transition-transform" />
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
            {authenticBadges.map((badge) =>
              badge.unlocked ? (
                <TiltCard
                  key={badge.id}
                  maxTilt={8}
                  glare={true}
                  className="p-4 rounded-2xl border border-neutral-200/90 shadow-xs bg-gradient-to-b from-white to-neutral-50 flex flex-col justify-between space-y-3 cursor-pointer group card-tactile-lift"
                >
                  <div className="space-y-2 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-xs bg-[#E3F6F9] text-[#17657A] group-hover:scale-110 transition-transform duration-300">
                      {badge.icon}
                    </div>
                    <h4 className="font-bold text-sm text-[#102A38] leading-tight group-hover:text-[#17657A] transition-colors">
                      {badge.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      {badge.desc}
                    </p>
                  </div>

                  <div className="text-center pt-2 border-t border-neutral-100">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã đạt được</span>
                    </span>
                  </div>
                </TiltCard>
              ) : (
                <div
                  key={badge.id}
                  className="p-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 opacity-60 flex flex-col justify-between space-y-3 select-none"
                >
                  <div className="space-y-2 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-xs bg-neutral-200 text-neutral-400">
                      <Lock className="w-5 h-5 text-neutral-400" />
                    </div>
                    <h4 className="font-bold text-sm text-[#102A38] leading-tight">
                      {badge.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      {badge.desc}
                    </p>
                  </div>

                  <div className="text-center pt-2 border-t border-neutral-100">
                    <span className="text-[10px] text-neutral-400 italic">
                      {badge.stationRequirement}
                    </span>
                  </div>
                </div>
              )
            )}
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

      {/* Modal 2: Edit Profile (Elevated Craft with Gender & Detailed Cartoon Avatars) */}
      {isEditProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E28]/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsEditProfileModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-gradient-to-b from-white via-white to-[#F6FBFC] rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(16,42,56,0.25)] border border-slate-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient subtle glow decorations */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-44 h-44 bg-[#17657A]/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-44 h-44 bg-amber-200/20 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#17657A]/10 flex items-center justify-center text-[#17657A] shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#102A38] leading-tight">
                    Chỉnh sửa thông tin bé
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                    Chọn nhân vật và cập nhật thông tin học sinh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Đóng popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs relative">
              {/* Gender & Avatar Selection (2 Cards) */}
              <div>
                <label className="block font-bold text-[#102A38] mb-2 text-xs">
                  Nhân vật đại diện (Nam / Nữ)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Bé Trai (An) */}
                  <button
                    type="button"
                    onClick={() => handleSelectGender('boy')}
                    className={`relative p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all duration-150 cursor-pointer ${
                      draftGender === 'boy'
                        ? 'border-[#17657A] bg-[#F0F9FB] shadow-[0_4px_16px_rgba(23,101,122,0.12)] scale-[1.01]'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src="/assets/avatars/student_boy.png"
                        alt="Bé Trai"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/avatar_an.png';
                        }}
                      />
                      {draftGender === 'boy' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#17657A] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#102A38] leading-tight truncate">
                        Bé Trai
                      </div>
                      <div className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                        Học sinh nam
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Bé Gái (Mai) */}
                  <button
                    type="button"
                    onClick={() => handleSelectGender('girl')}
                    className={`relative p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all duration-150 cursor-pointer ${
                      draftGender === 'girl'
                        ? 'border-[#17657A] bg-[#F0F9FB] shadow-[0_4px_16px_rgba(23,101,122,0.12)] scale-[1.01]'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src="/assets/avatars/student_girl.png"
                        alt="Bé Gái"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/avatar_mai.png';
                        }}
                      />
                      {draftGender === 'girl' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#17657A] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#102A38] leading-tight truncate">
                        Bé Gái
                      </div>
                      <div className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                        Học sinh nữ
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block font-bold text-[#102A38] mb-1.5 text-xs">
                  Tên của bé
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Nhập tên bé..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-[#102A38] placeholder:text-slate-400 focus:outline-none focus:border-[#17657A] focus:ring-3 focus:ring-[#17657A]/15 transition-all shadow-2xs"
                />
              </div>

              {/* Age Select */}
              <div>
                <label className="block font-bold text-[#102A38] mb-1.5 text-xs">
                  Độ tuổi (Lớp mầm non)
                </label>
                <div className="relative">
                  <select
                    value={draftAge}
                    onChange={(e) => setDraftAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-[#102A38] focus:outline-none focus:border-[#17657A] focus:ring-3 focus:ring-[#17657A]/15 transition-all shadow-2xs appearance-none cursor-pointer pr-10"
                  >
                    <option value="3">3-4 tuổi (Lớp Mầm)</option>
                    <option value="4">4-5 tuổi (Lớp Chồi)</option>
                    <option value="5">5-6 tuổi (Lớp Lá)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 relative">
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-slate-600 hover:text-[#102A38] hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-2.5 rounded-full bg-[#17657A] hover:bg-[#102A38] text-white text-xs font-bold shadow-md shadow-[#17657A]/20 hover:shadow-lg hover:shadow-[#17657A]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </LearnerShell>
  );
}

export default LearnerProfilePage;
