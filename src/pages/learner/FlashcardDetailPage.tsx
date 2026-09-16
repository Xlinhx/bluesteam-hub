import { useState } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sprout,
  MapPin,
  Utensils,
  AlertTriangle,
  Compass,
    Shield,
  Sparkles,
} from 'lucide-react';

interface SpeciesDetail {
  id: string;
  name: string;
  scientificName: string;
  heroImage: string;
  isolatedImage: string;
  audioPronunciation: string;
  depth: string;
  diet: string;
  status: string;
  funFact: string;
  tabs: {
    trait: { image: string; quote: string; detail: string };
    habitat: { image: string; quote: string; detail: string };
    diet: { image: string; quote: string; detail: string };
    threat: { image: string; quote: string; detail: string };
  };
}

export function FlashcardDetailPage() {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'trait' | 'habitat' | 'diet' | 'threat'>('trait');
  const [currentSpeciesIndex, setCurrentSpeciesIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const speciesList: SpeciesDetail[] = [
    {
      id: 'turtle',
      name: 'Rùa biển',
      scientificName: 'Chelonia mydas',
      heroImage: '/assets/generated/creatures/green_turtle_hero.jpg',
      isolatedImage: '/assets/generated/creatures/turtle_isolated.png',
      audioPronunciation: 'Rùa biển. Rùa biển có mai cứng và dùng đôi vây bơi dài như cánh quạt để lướt êm trong làn nước.',
      depth: 'Tầng mặt đầy nắng (0 - 50m)',
      diet: 'Cỏ biển, rong biển tươi & tảo lục',
      status: 'Nguy cấp (Cần bảo vệ nghiêm ngặt)',
      funFact: 'Rùa xanh có thể nín thở dưới nước tới hơn 4 tiếng khi nghỉ ngơi!',
      tabs: {
        trait: {
          image: '/assets/generated/creatures/turtle_flipper_detail.jpg',
          quote: 'Rùa dùng vây để bơi.',
          detail: 'Đôi vây trước của rùa biển tiến hóa dài và dẹt giống như mái chèo, giúp rùa lướt nhanh và đổi hướng linh hoạt trong làn nước biển.',
        },
        habitat: {
          image: '/assets/generated/stations/station_seagrass_fish.jpg',
          quote: 'Thảm cỏ biển ấm áp là ngôi nhà của rùa.',
          detail: 'Rùa biển ưa thích các vùng biển ấm nhiệt đới và cận nhiệt đới, nơi có các thảm cỏ biển trù phú và rạn san hô chở che.',
        },
        diet: {
          image: '/assets/generated/stations/botanical_seagrass_specimen.jpg',
          quote: 'Rùa xanh ăn cỏ biển và rong biển tươi.',
          detail: 'Rùa biển trưởng thành là loài ăn thực vật biển, góp phần cắt tỉa và giúp các đồng cỏ biển luôn sinh trưởng khỏe mạnh.',
        },
        threat: {
          image: '/assets/generated/stations/ghost_net_field_sketch.jpg',
          quote: 'Rác thải nhựa và lưới đánh cá đe dọa rùa.',
          detail: 'Rùa dễ nhầm túi ni-lông trôi nổi với sứa biển. Chúng ta cần chung tay giữ sạch bãi biển và bảo vệ tổ trứng của rùa mẹ.',
        },
      },
    },
    {
      id: 'clownfish',
      name: 'Cá hề',
      scientificName: 'Amphiprion ocellaris',
      heroImage: '/assets/generated/stations/station_coral_reef.jpg',
      isolatedImage: '/assets/generated/creatures/clownfish_isolated.png',
      audioPronunciation: 'Cá hề cam. Chú cá nhỏ xinh xắn sống hòa thuận trong bụi hải quỳ có nọc độc.',
      depth: 'Rạn san hô nước cạn (1 - 15m)',
      diet: 'Tảo nhỏ & thức ăn thừa của hải quỳ',
      status: 'Ít quan tâm (Cần bảo vệ rạn san hô)',
      funFact: 'Lớp chất nhờn đặc biệt trên da giúp cá hề không bao giờ bị xúc tu hải quỳ chích!',
      tabs: {
        trait: {
          image: '/assets/generated/creatures/clownfish_isolated.png',
          quote: 'Thân hình cam rực rỡ với ba dải sọc trắng.',
          detail: 'Bộ vảy cam sáng nổi bật giúp cá hề nhận diện nhau trong khu rừng san hô rực rỡ.',
        },
        habitat: {
          image: '/assets/generated/stations/station_coral_reef.jpg',
          quote: 'Sống cộng sinh thân thiết cùng hải quỳ.',
          detail: 'Các xúc tu có gai độc của hải quỳ bảo vệ cá hề khỏi kẻ thù săn mồi lớn hơn.',
        },
        diet: {
          image: '/assets/generated/stations/station_coral_reef.jpg',
          quote: 'Ăn tảo nhỏ và dọn sạch cho hải quỳ.',
          detail: 'Cá hề dọn sạch các cặn bẩn và vi sinh vật bám trên xúc tu của hải quỳ.',
        },
        threat: {
          image: '/assets/generated/stations/ghost_net_field_sketch.jpg',
          quote: 'Hiện tượng tẩy trắng rạn san hô.',
          detail: 'Nước biển nóng lên làm san hô và hải quỳ bị suy thoái, khiến cá hề mất đi ngôi nhà trú ngụ.',
        },
      },
    },
    {
      id: 'stingray',
      name: 'Cá đuối',
      scientificName: 'Dasyatis americana',
      heroImage: '/assets/generated/backgrounds/ocean_horizontal_atlas_panorama.jpg',
      isolatedImage: '/assets/generated/creatures/stingray_isolated.png',
      audioPronunciation: 'Cá đuối. Thân hình dẹp như cánh diều, bơi lượn nhịp nhàng sát đáy cát mịn.',
      depth: 'Đáy cát ven bờ (2 - 30m)',
      diet: 'Cua nhỏ, tôm và động vật thân mềm',
      status: 'Cần theo dõi môi trường biển',
      funFact: 'Cá đuối có thể ngụy trang vùi mình dưới cát chỉ để lộ đôi mắt tinh anh!',
      tabs: {
        trait: {
          image: '/assets/generated/creatures/stingray_isolated.png',
          quote: 'Thân dẹp như cánh diều lướt êm.',
          detail: 'Cơ thể mềm dẻo lượn sóng nhịp nhàng giúp cá đuối bơi sát đáy biển mà không gây tiếng động.',
        },
        habitat: {
          image: '/assets/generated/backgrounds/ocean_split_beach.jpg',
          quote: 'Vùng đáy cát nông ven bờ.',
          detail: 'Nơi có dòng chảy êm dịu và tầng cát mịn để cá đuối ẩn mình.',
        },
        diet: {
          image: '/assets/generated/creatures/crab_isolated.png',
          quote: 'Hàm răng cứng để nghiền vỏ cua, sò.',
          detail: 'Cá đuối dùng cơ quan cảm ứng điện từ để tìm các con mồi ẩn sâu dưới cát.',
        },
        threat: {
          image: '/assets/generated/stations/ghost_net_field_sketch.jpg',
          quote: 'Lưới cào đáy phá hủy thảm cát.',
          detail: 'Hoạt động cào đáy công nghiệp làm xáo trộn nghiêm trọng hệ sinh thái đáy biển.',
        },
      },
    },
    {
      id: 'crab',
      name: 'Cua biển',
      scientificName: 'Scylla serrata',
      heroImage: '/assets/ocean/habitat-mangrove-bg.jpg',
      isolatedImage: '/assets/generated/creatures/crab_isolated.png',
      audioPronunciation: 'Cua biển. Sở hữu chiếc mai cứng cáp cùng đôi càng to khỏe để tự vệ.',
      depth: 'Rừng ngập mặn & bãi triều (0 - 10m)',
      diet: 'Cá nhỏ, giáp xác & xác sinh vật',
      status: 'Ổn định',
      funFact: 'Cua biển có khả năng bò ngang siêu nhanh nhờ cấu trúc khớp chân đặc biệt!',
      tabs: {
        trait: {
          image: '/assets/generated/creatures/crab_isolated.png',
          quote: 'Bộ giáp canxi và đôi càng mạnh mẽ.',
          detail: 'Đôi càng chắc khỏe dùng để kẹp thức ăn và báo hiệu cho đồng loại khi có kẻ thù.',
        },
        habitat: {
          image: '/assets/ocean/habitat-mangrove-bg.jpg',
          quote: 'Rừng đước ngập mặn và bãi bùn.',
          detail: 'Rễ cây đước chằng chịt tạo thành tổ trú ẩn an toàn cho cua con lớn lên.',
        },
        diet: {
          image: '/assets/generated/creatures/crab_isolated.png',
          quote: 'Dọn sạch rác hữu cơ ven bờ.',
          detail: 'Cua biển là những "công nhân vệ sinh" tích cực của hệ sinh thái bãi triều.',
        },
        threat: {
          image: '/assets/generated/stations/ghost_net_field_sketch.jpg',
          quote: 'Mất diện tích rừng ngập mặn.',
          detail: 'Bảo vệ rừng ngập mặn chính là bảo vệ nguồn sống của các loài cua và tôm cá con.',
        },
      },
    },
    {
      id: 'jellyfish',
      name: 'Sứa biển',
      scientificName: 'Aurelia aurita',
      heroImage: '/assets/generated/creatures/jellyfish_detail.jpg',
      isolatedImage: '/assets/generated/creatures/jellyfish_detail.jpg',
      audioPronunciation: 'Sứa biển. Cơ thể trong suốt mềm mại như một chiếc dù nhấp nhô theo làn sóng.',
      depth: 'Vùng nước khơi và ven biển (0 - 100m)',
      diet: 'Sinh vật phù du & ấu trùng cá',
      status: 'Rất phong phú',
      funFact: 'Cơ thể sứa có tới 95% là nước và sứa không hề có não bộ hay xương sống!',
      tabs: {
        trait: {
          image: '/assets/generated/creatures/jellyfish_detail.jpg',
          quote: 'Cơ thể trong suốt phát sáng nhẹ.',
          detail: 'Dù sứa co bóp nhịp nhàng tạo lực đẩy phản lực đưa sứa tiến lên phía trước.',
        },
        habitat: {
          image: '/assets/generated/backgrounds/ocean_vertical_atlas_strata.jpg',
          quote: 'Trôi theo các dòng hải lưu ấm.',
          detail: 'Sứa sống hòa mình vào đại dương bao la, di chuyển theo sự chuyển động của nước biển.',
        },
        diet: {
          image: '/assets/generated/creatures/jellyfish_detail.jpg',
          quote: 'Bắt sinh vật phù du bằng xúc tu.',
          detail: 'Các xúc tu mềm mại chứa tế bào châm giúp sứa giữ chặt con mồi nhỏ.',
        },
        threat: {
          image: '/assets/generated/stations/ghost_net_field_sketch.jpg',
          quote: 'Biến đổi khí hậu và ô nhiễm nguồn nước.',
          detail: 'Cần duy trì cân bằng sinh thái để các loài săn sứa như rùa biển không bị suy giảm.',
        },
      },
    },
    {
      id: 'seahorse',
      name: 'Cá ngựa',
      scientificName: 'Hippocampus',
      heroImage: '/assets/generated/stations/station_seagrass_fish.jpg',
      isolatedImage: '/assets/generated/creatures/seahorse_isolated.png',
      audioPronunciation: 'Cá ngựa. Chú cá kỳ lạ có chiếc đuôi uốn cong để móc chặt vào cọng cỏ biển.',
      depth: 'Thảm cỏ biển & rạn san hô (1 - 20m)',
      diet: 'Giáp xác nhỏ & tôm bé li ti',
      status: 'Sắp nguy cấp (Cần bảo vệ)',
      funFact: 'Ở loài cá ngựa, chính cá ngựa bố là người mang túi ấp và sinh ra các chú cá ngựa con!',
      tabs: {
        trait: {
          image: '/assets/generated/creatures/seahorse_isolated.png',
          quote: 'Chiếc đuôi cuốn thông minh và mõm dài.',
          detail: 'Mõm dài hoạt động như một ống hút tí hon hút nhanh các con giáp xác trôi qua.',
        },
        habitat: {
          image: '/assets/generated/stations/station_seagrass_fish.jpg',
          quote: 'Neo mình bên những ngọn cỏ biển xanh.',
          detail: 'Đuôi cá ngựa bám chặt vào nhánh cỏ để không bị dòng nước mạnh cuốn trôi.',
        },
        diet: {
          image: '/assets/generated/stations/botanical_seagrass_specimen.jpg',
          quote: 'Hút tôm nhỏ và sinh vật phù du.',
          detail: 'Cá ngựa kiên nhẫn rình mồi và đớp mồi chớp nhoáng với độ chính xác cao.',
        },
        threat: {
          image: '/assets/generated/stations/ghost_net_field_sketch.jpg',
          quote: 'Đánh bắt quá mức và phá hủy thảm cỏ.',
          detail: 'Cá ngựa là loài bơi chậm nên rất dễ bị tổn thương khi thảm cỏ biển bị xâm hại.',
        },
      },
    },
    {
      id: 'starfish',
      name: 'Sao biển',
      scientificName: 'Asteroidea',
      heroImage: '/assets/generated/stations/species_starfish.jpg',
      isolatedImage: '/assets/generated/stations/species_starfish.jpg',
      audioPronunciation: 'Sao biển. Năm cánh tay hình ngôi sao rực rỡ bám chắc trên các tảng đá san hô.',
      depth: 'Bãi đá ven bờ & rạn san hô (0 - 40m)',
      diet: 'Ngao, sò, ốc và xác động vật biển',
      status: 'Ổn định',
      funFact: 'Nếu không may bị đứt một cánh tay, sao biển có thể tự tái sinh mọc lại cánh tay mới!',
      tabs: {
        trait: {
          image: '/assets/generated/stations/species_starfish.jpg',
          quote: 'Hàng trăm chân ống nhỏ xíu dưới cánh tay.',
          detail: 'Chân ống sử dụng áp suất thủy lực giúp sao biển bám cực chắc vào đá và di chuyển chậm rãi.',
        },
        habitat: {
          image: '/assets/generated/stations/species_starfish.jpg',
          quote: 'Gờ đá ven bờ và rạn san hô sống.',
          detail: 'Nơi có nhiều khe nứt và vỏ sò phong phú là địa điểm yêu thích của sao biển.',
        },
        diet: {
          image: '/assets/generated/stations/species_starfish.jpg',
          quote: 'Mở vỏ sò bằng lực kéo bền bỉ.',
          detail: 'Sao biển dùng các cánh tay kéo hé vỏ sò rồi đưa dịch tiêu hóa vào để ăn con mồi.',
        },
        threat: {
          image: '/assets/generated/stations/ghost_net_field_sketch.jpg',
          quote: 'Axit hóa đại dương làm yếu khung xương.',
          detail: 'Khí nhà kính làm nước biển chua hơn, ảnh hưởng đến khả năng hình thành lớp gai canxi.',
        },
      },
    },
  ];

  const currentSpecies = speciesList[currentSpeciesIndex];

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentSpeciesIndex((prev) => (prev > 0 ? prev - 1 : speciesList.length - 1));
    oceanAudio.playChime(440, 0.1);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentSpeciesIndex((prev) => (prev < speciesList.length - 1 ? prev + 1 : 0));
    oceanAudio.playChime(554.37, 0.1);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    oceanAudio.playChime(isFlipped ? 493.88 : 659.25, 0.12);
  };

  const handleSpeak = () => {
    oceanAudio.playChime(523.25, 0.15);
    oceanAudio.speak(currentSpecies.audioPronunciation);
  };

  const activeTabData = currentSpecies.tabs[activeTab];

  return (
    <LearnerShell activeNav="resources">
      {/* Main Page Container with Ocean Ambient Atmosphere */}
      <div className="relative min-h-[calc(100vh-72px)] bg-gradient-to-b from-[#F2F8F9] via-[#FAF8F5] to-[#EBF5F8] text-[#102A38] font-sans select-none px-6 lg:px-12 py-8 overflow-hidden">
        {/* AMBIENT OCEAN DECORATIONS (Outside Cards - 2 Sides & Bottom) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {/* Left ambient: Sea-kelp silhouette & gentle water currents */}
          <div className="absolute left-0 top-1/4 -translate-x-8 opacity-15 text-[#17657A]">
            <svg className="w-56 h-96" viewBox="0 0 120 220" fill="currentColor">
              <path d="M25 220 C 15 160, 50 130, 30 80 C 18 45, 40 15, 25 0 C 10 20, 2 55, 8 95 C 15 140, -2 170, 25 220 Z" />
              <path d="M60 220 C 50 150, 85 110, 68 55 C 55 20, 72 5, 60 0 C 48 18, 38 50, 44 88 C 50 130, 32 170, 60 220 Z" opacity="0.7" />
              <path d="M95 220 C 88 175, 110 140, 98 90 C 85 55, 102 22, 92 0 C 80 20, 68 55, 75 98 C 82 140, 65 180, 95 220 Z" opacity="0.5" />
            </svg>
          </div>
          {/* Left floating bubbles */}
          <div className="absolute left-12 top-48 w-4 h-4 rounded-full border-2 border-[#17657A]/20 bg-white/30 backdrop-blur-xs animate-pulse" />
          <div className="absolute left-24 top-80 w-2.5 h-2.5 rounded-full border border-[#2EE6CA]/35 bg-teal-100/20" />
          <div className="absolute left-8 bottom-32 w-6 h-6 rounded-full border-2 border-[#17657A]/15 bg-white/20" />

          {/* Right ambient: Coral reef silhouettes & schooling fish */}
          <div className="absolute right-0 bottom-0 translate-x-6 opacity-15 text-[#17657A]">
            <svg className="w-64 h-80" viewBox="0 0 180 220" fill="currentColor">
              <path d="M45 220 C 50 175, 35 145, 55 100 C 68 80, 50 45, 60 12 C 72 35, 90 55, 82 90 C 95 125, 72 155, 90 220 Z" />
              <path d="M110 220 C 115 165, 100 130, 128 88 C 140 68, 122 35, 138 0 C 150 28, 160 55, 150 95 C 160 128, 138 165, 155 220 Z" opacity="0.8" />
              <path d="M155 220 C 150 185, 165 155, 160 120 C 155 95, 170 68, 165 35 C 172 58, 175 90, 170 128 C 165 160, 175 188, 175 220 Z" opacity="0.6" />
            </svg>
          </div>
          {/* Right swimming fish */}
          <div className="absolute right-14 top-36 opacity-20 text-[#17657A]">
            <svg className="w-28 h-16" viewBox="0 0 100 60" fill="currentColor">
              <path d="M10 20 Q 30 10, 50 20 Q 30 30, 10 20 Z M 10 20 L 0 12 L 0 28 Z" />
              <path d="M45 38 Q 60 30, 75 38 Q 60 46, 45 38 Z M 45 38 L 38 32 L 38 44 Z" opacity="0.8" />
              <path d="M65 15 Q 78 7, 90 15 Q 78 23, 65 15 Z M 65 15 L 59 10 L 59 20 Z" opacity="0.6" />
            </svg>
          </div>
          {/* Right floating bubbles */}
          <div className="absolute right-16 top-24 w-5 h-5 rounded-full border-2 border-[#2EE6CA]/30 bg-teal-100/20" />
          <div className="absolute right-28 bottom-72 w-3.5 h-3.5 rounded-full border border-[#17657A]/20 bg-white/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-8">
          {/* Top Bar: Breadcrumbs + Quay về danh sách */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/resources')}
                className="hover:text-[#17657A] cursor-pointer"
              >
                Học liệu
              </button>
              <span>›</span>
              <button
                type="button"
                onClick={() => navigate('/resources?view=catalog')}
                className="hover:text-[#17657A] cursor-pointer"
              >
                Thẻ học
              </button>
              <span>›</span>
              <span className="text-[#102A38] font-black">{currentSpecies.name}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="px-4 py-2 rounded-2xl bg-white border border-[#17657A]/20 text-[#102A38] hover:bg-slate-50 shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 font-bold"
            >
              <ChevronLeft className="w-4 h-4 text-[#17657A]" />
              <span>Quay về danh sách</span>
            </button>
          </div>

          {/* Main 2-Column Stage: 3D Flashcard (col-5) & Biological Inspector (col-7) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive 3D Card Flip (col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              {/* 3D Perspective Card Wrapper */}
              <div
                className="w-full h-[460px] cursor-pointer relative"
                style={{ perspective: '1200px' }}
                onClick={handleFlip}
              >
                <div
                  className="w-full h-full relative rounded-[32px] shadow-[0_12px_36px_rgba(18,56,75,0.12)] border border-[#17657A]/15 transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* FRONT FACE */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-white flex flex-col justify-between"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Big Hero Image */}
                    <div className="relative h-[320px] bg-sky-950 overflow-hidden">
                      <img
                        src={currentSpecies.heroImage}
                        alt={currentSpecies.name}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-black text-[#17657A] shadow-md flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#F67650]" />
                          <span>Sinh vật biển kỳ thú</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Title Area */}
                    <div className="p-6 bg-white flex flex-col items-center justify-center">
                      <h2 className="font-serif font-black text-3xl text-center text-[#102A38] tracking-tight">
                        {currentSpecies.name}
                      </h2>
                      <p className="text-xs italic text-[#17657A] font-serif mt-0.5">
                        {currentSpecies.scientificName}
                      </p>
                    </div>
                  </div>

                  {/* BACK FACE (180deg) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#0B2538] via-[#102A38] to-[#17657A] text-white p-7 flex flex-col justify-between"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <div>
                          <h3 className="font-serif font-black text-2xl text-white">
                            {currentSpecies.name}
                          </h3>
                          <span className="text-xs italic text-[#2EE6CA] font-serif">
                            {currentSpecies.scientificName}
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-wider text-teal-200">
                          Mặt sau hồ sơ
                        </span>
                      </div>

                      {/* Biological Traits Grid */}
                      <div className="space-y-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/10 flex items-start gap-2.5">
                          <Compass className="w-4 h-4 text-[#2EE6CA] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-white/70 block text-[10px] uppercase">
                              Độ sâu sinh sống
                            </span>
                            <span className="font-bold text-white">{currentSpecies.depth}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/10 flex items-start gap-2.5">
                          <Utensils className="w-4 h-4 text-[#F67650] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-white/70 block text-[10px] uppercase">
                              Thức ăn chủ yếu
                            </span>
                            <span className="font-bold text-white">{currentSpecies.diet}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/10 flex items-start gap-2.5">
                          <Shield className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-white/70 block text-[10px] uppercase">
                              Tình trạng bảo tồn
                            </span>
                            <span className="font-bold text-white">{currentSpecies.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Fun Fact Callout */}
                      <div className="p-3 rounded-2xl bg-teal-900/50 border border-teal-400/20 text-xs text-teal-100 font-medium leading-relaxed">
                        🌟 <strong>Góc tò mò:</strong> {currentSpecies.funFact}
                      </div>
                    </div>

                    <div className="text-center text-[11px] text-white/60 font-bold">
                      Nhấn vào thẻ hoặc nút "Lật thẻ" để quay lại mặt trước
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row: Nghe tên + Lật thẻ (min 56px touch target per V11-05) */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="px-7 py-3.5 min-h-[56px] min-w-[56px] rounded-full bg-[#17657A] hover:bg-[#125061] text-white font-black text-sm shadow-md flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Nghe tên</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlip}
                  className="px-7 py-3.5 min-h-[56px] min-w-[56px] rounded-full bg-white hover:bg-slate-50 border-2 border-[#17657A]/25 text-[#102A38] font-black text-sm shadow-xs flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
                >
                  {/* Card Flip Icon per V11-05 */}
                  <svg className="w-5 h-5 text-[#17657A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="5" width="14" height="15" rx="3" />
                    <path d="M8 2h10a3 3 0 0 1 3 3v11" />
                  </svg>
                  <span>{isFlipped ? 'Mặt trước' : 'Lật thẻ'}</span>
                </button>
              </div>

              {/* Sub-bar Prev / Next Buttons */}
              <div className="flex items-center justify-between pt-3 px-2 text-xs font-black text-slate-500 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-2 hover:text-[#102A38] cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#17657A]">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                  <span>Thẻ trước</span>
                </button>

                <span className="text-[11px] text-slate-400 font-bold">
                  {currentSpeciesIndex + 1} / {speciesList.length}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 hover:text-[#102A38] cursor-pointer transition-colors"
                >
                  <span>Thẻ tiếp theo</span>
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#17657A]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column: Biological Inspector Panel - Unified matching Mockup */}
            <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white border border-[#17657A]/20 shadow-[0_12px_36px_rgba(18,56,75,0.08)] overflow-hidden p-6 lg:p-8 space-y-6 relative">
              {/* Subtle top ocean strip on card */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#17657A] via-[#2EE6CA] to-[#17657A]" />

              {/* 4 Tabs: Đặc điểm, Nơi sống, Thức ăn, Mối đe dọa */}
              <div className="flex items-center gap-6 border-b border-slate-100 pb-3 font-black text-xs text-slate-500">
                {[
                  { key: 'trait', label: 'Đặc điểm', icon: Sprout },
                  { key: 'habitat', label: 'Nơi sống', icon: MapPin },
                  { key: 'diet', label: 'Thức ăn', icon: Utensils },
                  { key: 'threat', label: 'Mối đe dọa', icon: AlertTriangle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`flex items-center gap-2 pb-3 -mb-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'border-b-2 border-[#17657A] text-[#17657A] font-black'
                          : 'hover:text-[#102A38]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Large Macro Photo Detail */}
              <div className="relative h-72 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 shadow-inner">
                <img
                  src={activeTabData.image}
                  alt={activeTabData.quote}
                  className="w-full h-full object-cover object-center transition-all duration-500"
                />
              </div>

              {/* Dedicated Caption Callout Card matching Mockup */}
              <div className="p-6 rounded-2xl bg-[#F4F9F8] border border-[#17657A]/15 space-y-2">
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#102A38] tracking-tight">
                  {activeTabData.quote}
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {activeTabData.detail}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Sinh vật liên quan (Ocean Dock) */}
          <div className="pt-4 space-y-4">
            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-xs border border-[#17657A]/15 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2EE6CA] animate-pulse" />
                  <h4 className="font-serif font-black text-xl text-[#102A38]">
                    Sinh vật liên quan
                  </h4>
                  <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">
                    • Nhấn chọn từng loài để khám phá hồ sơ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/resources?view=catalog')}
                  className="text-[#17657A] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <span>Xem thêm</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 7 Species Thumbnails Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {speciesList.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentSpeciesIndex(idx);
                      setIsFlipped(false);
                      oceanAudio.playChime(500 + idx * 30, 0.1);
                    }}
                    className={`p-3 rounded-2xl bg-white shadow-xs border transition-all cursor-pointer flex flex-col items-center gap-2 hover:-translate-y-1 ${
                      currentSpeciesIndex === idx
                        ? 'border-2 border-[#17657A] ring-2 ring-[#17657A]/20 shadow-md bg-sky-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.isolatedImage}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-sm"
                      />
                    </div>
                    <span className="text-xs font-black text-[#102A38]">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
