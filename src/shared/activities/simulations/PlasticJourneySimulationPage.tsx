import { useState, useRef } from 'react';
import { useWaypointMotion } from './useSimulationMotion';
import { useRouter } from '../../../app/router';
import { useI18n } from '../../i18n/I18nContext';
import { ActivityShell } from '../../shells/ActivityShell';
import { ArrowLeft, ArrowRight, Pause, Play, Sprout } from 'lucide-react';

export function PlasticJourneySimulationPage({ onBack, onUsageInteraction }: { onBack?: () => void; onUsageInteraction?: (payload: import('@bluesteam/contracts').UsagePayload) => void } = {}) {
  const { navigate } = useRouter();
  const { locale } = useI18n();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentWaypoint, setCurrentWaypoint] = useState(1); // 0..4 representing the 5 degradation stages
  const marker=useRef<HTMLSpanElement>(null);
  useWaypointMotion(marker,currentWaypoint,isPlaying);

  const waypoints = [
    {
      id: 'shore',
      stepNum: 1,
      labelVi: 'Trên bờ',
      labelEn: 'On Shore',
      subVi: 'Nguồn phát sinh từ đất liền',
      subEn: 'Origin from land and beaches',
      descVi: 'Chai nhựa bị bỏ quên trên bãi cát, chịu tác động ban đầu của sóng triều và nắng.',
      descEn: 'Plastic bottle left on sand, starting exposure to sun and tides.',
      x: '16%',
      y: '32%',
      icon: '🌴',
      color: '#17657A',
    },
    {
      id: 'drift',
      stepNum: 2,
      labelVi: 'Theo dòng nước',
      labelEn: 'Ocean Drift',
      subVi: 'Thủy triều cuốn ra hải lưu',
      subEn: 'Tides carry debris into currents',
      descVi: 'Sóng biển cuốn trôi chai dạt ra ngoài khơi, trôi theo dòng hải lưu ven bờ.',
      descEn: 'Waves carry the bottle into coastal and oceanic currents.',
      x: '38%',
      y: '48%',
      icon: '≈',
      color: '#008CA5',
    },
    {
      id: 'habitat',
      stepNum: 3,
      labelVi: 'Gần nơi sống',
      labelEn: 'Near Habitats',
      subVi: 'Rạn san hô & bãi cỏ biển',
      subEn: 'Coral reefs and seagrass beds',
      descVi: 'Mảnh nhựa trôi vào vùng kiếm ăn của rùa biển và đàn cá; nguy cơ mắc kẹt và nuốt phải.',
      descEn: 'Plastic enters sensitive marine feeding grounds; wildlife risk entanglement and ingestion.',
      x: '58%',
      y: '62%',
      icon: '🪸',
      color: '#2EE6CA',
    },
    {
      id: 'microplastics',
      stepNum: 4,
      labelVi: 'Vỡ vụn vi nhựa',
      labelEn: 'Microplastics',
      subVi: 'Tia cực tím quang hóa & sóng đập',
      subEn: 'Photo-degradation into micro-particles',
      descVi: 'Tia UV và lực va đập của sóng bẻ gãy polymer, phân rã thành vô số hạt vi nhựa (< 5mm).',
      descEn: 'Sunlight and wave action break the plastic down into millions of tiny microplastics (<5mm).',
      x: '75%',
      y: '72%',
      icon: '⚡',
      color: '#E5A93C',
    },
    {
      id: 'deepsea',
      stepNum: 5,
      labelVi: 'Lắng đọng đáy biển',
      labelEn: 'Benthic Deposit',
      subVi: 'Chuỗi thức ăn & trầm tích sâu',
      subEn: 'Food chain ingestion & seabed silt',
      descVi: 'Hạt vi nhựa bị động vật phù du ăn nhầm, tích lũy trong chuỗi thức ăn và chìm xuống đáy biển sâu.',
      descEn: 'Microplastics are ingested by marine fauna and settle into benthic sediment.',
      x: '88%',
      y: '82%',
      icon: '🌊',
      color: '#F67650',
    },
  ];

  const activeStage = waypoints[currentWaypoint];
  const selectWaypoint = (index: number) => { setCurrentWaypoint(index); onUsageInteraction?.({type:'simulation_step',stepId:waypoints[index].id}); };

  return (
    <ActivityShell
      title={locale === 'vi' ? 'Hành trình mảnh nhựa' : 'Plastic Journey'}
      variant="light"
      currentStep={currentWaypoint + 1}
      totalSteps={5}
      onBack={onBack || (() => navigate('/interactive/simulations'))}
      isPaused={!isPlaying}
      onTogglePause={() => setIsPlaying(!isPlaying)}
      showLogo={true}
    >
      <div className="relative w-full h-[calc(100vh-72px)] flex flex-col justify-between overflow-hidden">
        {/* Panoramic Split-level Nature Background */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: 'url(/assets/generated/backgrounds/split_coastal_plastic_journey.jpg)',
            backgroundPosition: 'center 35%',
          }}
        />

        {/* Ambient Gradient Overlays for readable typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/30 to-[#072432]/75 pointer-events-none" />

        {/* Main Content & Stage */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col justify-between flex-1">
          {/* Top Title & Narrative */}
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-5xl font-black text-[#102A38] tracking-[-0.02em] font-serif">
              {locale === 'vi' ? 'Một mảnh nhựa đi đâu?' : 'Where Does A Piece of Plastic Go?'}
            </h1>
            <p className="text-sm sm:text-base text-[#12384B]/80 leading-relaxed font-medium">
              {locale === 'vi'
                ? 'Cùng theo hành trình của một mảnh nhựa từ bờ biển ra đại dương và khám phá tác động của nó đến môi trường biển.'
                : 'Follow the journey of a plastic item from the shoreline into deep waters and uncover its impact on ocean ecosystems.'}
            </p>
          </div>

          {/* Interactive Trajectory Layer across the 3D scene (5 Stages) */}
          <div className="relative flex-1 min-h-[380px] my-2">
            {/* SVG Curved Dashed Trajectory Line connecting all 5 stages smoothly */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 16 32 C 24 38, 30 44, 38 48 C 46 52, 51 58, 58 62 C 64 66, 70 70, 75 72 C 80 74, 84 78, 88 82"
                fill="none"
                stroke="white"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="8 8"
                className="opacity-80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
              />
            </svg>

            {/* Waypoint Nodes: 5 Scientific Stages */}
            <span ref={marker} data-waypoint-current={activeStage.id} aria-hidden="true" style={{position:'absolute',left:activeStage.x,top:activeStage.y,width:18,height:18,borderRadius:'50%',border:'3px solid white',background:'#087c91',boxShadow:'0 0 0 4px #a0eaf066',transform:'translate(-50%,-50%)',pointerEvents:'none'}}/>
            {waypoints.map((wp, idx) => {
              const isActive = idx === currentWaypoint;

              return (
                <button
                  type="button"
                  aria-label={locale === 'vi' ? wp.labelVi : wp.labelEn}
                  aria-pressed={isActive}
                  key={wp.id}
                  style={{ left: wp.x, top: wp.y }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20 min-h-12 rounded-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#17657A]"
                  onClick={() => selectWaypoint(idx)}
                >
                  {/* Floating Pill Badge */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-300 ${
                      isActive
                        ? 'bg-[#102A38] text-white scale-110 ring-4 ring-[#2EE6CA]/40 shadow-2xl'
                        : 'bg-white/90 text-[#12384B] hover:bg-white hover:scale-105 border border-black/10'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{
                        backgroundColor: isActive ? '#2EE6CA' : wp.color,
                        color: isActive ? '#0d2e3f' : '#ffffff',
                      }}
                    >
                      {wp.icon}
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">
                      {locale === 'vi' ? wp.labelVi : wp.labelEn}
                    </span>
                  </div>

                  {/* Marker Dot On Line */}
                  <div
                    className={`mt-2 rounded-full transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-300 ${
                      isActive
                        ? 'w-5 h-5 bg-[#2EE6CA] ring-4 ring-white shadow-xl'
                        : 'w-3.5 h-3.5 bg-white/90 group-hover:scale-125 shadow-md border-2 border-[#17657A]'
                    }`}
                  />
                </button>
              );
            })}

            {/* Floating Active Stage Info Card (Bottom Left of Canvas) */}
            <div className="absolute bottom-4 left-4 max-w-sm bg-white/95 backdrop-blur-md rounded-[24px] p-5 shadow-2xl border border-white/80 space-y-2 pointer-events-auto">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#17657A]">
                <span className="w-5 h-5 rounded-full bg-[#17657A] text-white flex items-center justify-center text-[10px]">
                  {activeStage.stepNum}
                </span>
                <span>{locale === 'vi' ? `Chặng ${activeStage.stepNum} / 5: ${activeStage.labelVi}` : `Stage ${activeStage.stepNum} / 5: ${activeStage.labelEn}`}</span>
              </div>
              <h4 className="font-serif font-black text-lg text-[#102A38]">
                {locale === 'vi' ? activeStage.subVi : activeStage.subEn}
              </h4>
              <p className="text-xs text-[#12384B]/80 leading-relaxed">
                {locale === 'vi' ? activeStage.descVi : activeStage.descEn}
              </p>
            </div>

            {/* Right Floating Card: Thử ngăn lại từ bờ */}
            <div
              onClick={() => navigate('/interactive/my-action')}
              className="absolute top-2 right-2 max-w-xs bg-white/95 backdrop-blur-md rounded-[28px] p-5 shadow-2xl border border-white/80 space-y-2 cursor-pointer hover:bg-white transition-[background-color,border-color,box-shadow,color,opacity,transform] group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-[#102A38] leading-tight group-hover:text-[#17657A] transition-colors">
                    {locale === 'vi' ? 'Thử ngăn lại từ bờ' : 'Prevent from Shore'}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#102A38] group-hover:bg-[#17657A] text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-[#12384B]/75 leading-relaxed pl-13">
                {locale === 'vi'
                  ? 'Khám phá những cách hành động để giảm rác nhựa ngay từ đầu nguồn.'
                  : 'Explore practical actions to curb plastic pollution right at the source.'}
              </p>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="flex items-center justify-center gap-4 py-2">
            {/* Quay lại */}
            <button
              type="button"
              disabled={currentWaypoint === 0}
              onClick={() => selectWaypoint(Math.max(0,currentWaypoint - 1))}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md text-white text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer border border-white/20 ${
                currentWaypoint === 0 ? 'bg-[#102A38]/50 opacity-50 cursor-not-allowed' : 'bg-[#102A38]/85 hover:bg-[#102A38]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{locale === 'vi' ? 'Quay lại' : 'Back'}</span>
            </button>

            {/* Tạm dừng / Phát */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? (locale === 'vi' ? 'Tạm dừng hành trình' : 'Pause journey') : (locale === 'vi' ? 'Tiếp tục hành trình' : 'Continue journey')}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#17657A] hover:bg-[#124d5d] text-[#2EE6CA] shadow-xl transition-transform active:scale-90 cursor-pointer border-2 border-[#2EE6CA]/40"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Tiếp tục */}
            <button
              type="button"
              disabled={currentWaypoint === waypoints.length - 1}
              onClick={() => selectWaypoint(Math.min(waypoints.length - 1,currentWaypoint + 1))}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md text-white text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer border border-white/20 ${
                currentWaypoint === waypoints.length - 1 ? 'bg-[#102A38]/50 opacity-50 cursor-not-allowed' : 'bg-[#102A38]/85 hover:bg-[#102A38]'
              }`}
            >
              <span>{locale === 'vi' ? 'Tiếp tục' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </ActivityShell>
  );
}
