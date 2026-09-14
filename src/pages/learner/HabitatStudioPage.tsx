import { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { ActivityShell } from '../../shells/ActivityShell';
import { creativeStorage, CreativeArtwork } from '../../services/creativeStorage';
import {
  HabitatPlacedItem,
  HabitatToolType,
  HabitatCategory,
  HABITAT_ASSET_PALETTE,
  HABITAT_SCENE_PRESETS,
  DEFAULT_HABITAT_ITEMS,
} from './habitatTypes';
import { Habitat3DCanvas } from './Habitat3DCanvas';
import {
  Undo2,
  Redo2,
  Save,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Move,
  RotateCw,
  ZoomIn,
  Trash2,
  Plus,
  MousePointer2,
  MoreVertical,
  ChevronUp,
  X,
  Info,
  CheckCircle2,
} from 'lucide-react';

export function HabitatStudioPage() {
  const { navigate } = useRouter();
  const { locale } = useI18n();

  // Mode detection from URL (?mode=run)
  const isInitialRun = typeof window !== 'undefined' && window.location.search.includes('mode=run');
  const [mode, setMode] = useState<'build' | 'run'>(isInitialRun ? 'run' : 'build');

  // Shared 3D Scene Items State (CRITICAL: Preserved across mode switches!)
  const [items, setItems] = useState<HabitatPlacedItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('bluesteam_habitat_active_draft');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_HABITAT_ITEMS;
  });

  // Undo/Redo history stack
  const historyRef = useRef<HabitatPlacedItem[][]>([DEFAULT_HABITAT_ITEMS]);
  const historyIndexRef = useRef<number>(0);

  // Tools & selection state
  const [activeLeftTool, setActiveLeftTool] = useState<HabitatToolType>('move');
  const [activeTab, setActiveTab] = useState<HabitatCategory>('seagrass');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('seagrass-tall');
  const [selectedItemId, setSelectedItemId] = useState<string | null>('item-seagrass-tall-active');
  const [activeSceneId, setActiveSceneId] = useState<number>(1);

  // Simulation controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [zoomTrigger, setZoomTrigger] = useState<number>(0);
  const [compassAngle, setCompassAngle] = useState<number>(Math.PI / 4);

  // UI state
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [isScenesPanelOpen, setIsScenesPanelOpen] = useState<boolean>(true);
  const [isInspectPanelOpen, setIsInspectPanelOpen] = useState<boolean>(true);
  const [inspectCategory, setInspectCategory] = useState<'rocks' | 'seagrass'>('rocks');

  // Sync mode with URL search params on mount & popstate
  useEffect(() => {
    const checkMode = () => {
      const search = window.location.search;
      if (search.includes('mode=run')) {
        setMode('run');
      } else {
        setMode('build');
      }
    };

    checkMode();
    window.addEventListener('popstate', checkMode);
    return () => window.removeEventListener('popstate', checkMode);
  }, []);

  // Save active draft to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bluesteam_habitat_active_draft', JSON.stringify(items));
    }
  }, [items]);

  // Mode switch handlers
  const handleSwitchToRun = () => {
    setMode('run');
    setSelectedItemId(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'run');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleSwitchToBuild = () => {
    setMode('build');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Update items with history recording
  const handleItemsChange = (newItems: HabitatPlacedItem[]) => {
    setItems(newItems);
    // Push to history
    const currentIndex = historyIndexRef.current;
    const newHistory = historyRef.current.slice(0, currentIndex + 1);
    newHistory.push(newItems);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevItems = historyRef.current[historyIndexRef.current];
      setItems(prevItems);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextItems = historyRef.current[historyIndexRef.current];
      setItems(nextItems);
    }
  };

  // Save artwork to persistent storage
  const handleSaveArtwork = async () => {
    try {
      const artwork: CreativeArtwork = {
        id: `habitat-user-${Date.now()}`,
        type: 'habitat',
        title: locale === 'vi' ? 'Nơi sống của An' : "An's Ocean Habitat",
        createdAt: Date.now(),
        previewDataUrl: '',
        habitatData: {
          items: items as any,
        },
      };
      await creativeStorage.saveArtwork(artwork);
      setSaveToast(locale === 'vi' ? 'Đã lưu sinh cảnh thành công!' : 'Habitat saved successfully!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch {
      setSaveToast(locale === 'vi' ? 'Lưu thất bại!' : 'Failed to save');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // Scene switching
  const handleSelectScene = (presetId: number) => {
    setActiveSceneId(presetId);
    const preset = HABITAT_SCENE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      handleItemsChange(preset.items);
      setSelectedItemId(null);
    }
  };

  // Cardinal compass click (N, E, S, W)
  const handleCompassClick = (targetAngle: number) => {
    setCompassAngle(targetAngle);
  };

  // 5 Canonical nav items for dark header
  const navItems = [
    { key: 'resources', label: locale === 'vi' ? 'Học liệu' : 'Resources', path: '/resources' },
    { key: 'learn', label: locale === 'vi' ? 'Học tập' : 'Learn', path: '/learn' },
    { key: 'interactive', label: locale === 'vi' ? 'Tương tác' : 'Interactive', path: '/interactive' },
    { key: 'creative', label: locale === 'vi' ? 'Sáng tạo' : 'Creative', path: '/creative' },
    { key: 'profile', label: locale === 'vi' ? 'Hồ sơ' : 'Profile', path: '/profile' },
  ];

  return (
    <ActivityShell
      title={mode === 'build' ? 'Nơi sống của An' : 'Quan sát môi trường của An'}
      showLogo={false}
      onBack={() => navigate('/creative')}
      headerCenter={
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map(item => {
            const isActive = item.key === 'creative';
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2EE6CA]/20 text-[#2EE6CA] border border-[#2EE6CA]/40 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      }
      headerRight={
        <div className="flex items-center gap-3">
          {/* Kid Profile Pill */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold text-white cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#2EE6CA] flex items-center justify-center text-[#12384B] font-black text-[10px]">
              An
            </div>
            <span className="hidden sm:inline">An</span>
            <span className="text-white/50 text-[10px]">▾</span>
          </button>
        </div>
      }
    >
      <div className="w-full h-full min-h-[calc(100vh-72px)] bg-[#f7f5ef] flex flex-col justify-between p-3 sm:p-5 space-y-3">
        {/* Floating Sub-Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-2.5 shadow-sm border border-black/5">
          {/* Left Title & Back Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/creative')}
              className="text-xs font-bold text-[#17657A] hover:text-[#12384B] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="text-base font-black">‹</span>
              <span>{locale === 'vi' ? 'Sáng tạo' : 'Creative'}</span>
            </button>

            <h1 className="text-lg sm:text-xl font-serif font-black text-[#12384B] flex items-center gap-2 tracking-[-0.02em]">
              {mode === 'build' ? (
                <>
                  <span>{locale === 'vi' ? 'Nơi sống của An' : "An's Ocean Habitat"}</span>
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </>
              ) : (
                <span>{locale === 'vi' ? 'Quan sát môi trường của An' : "Observing An's Environment"}</span>
              )}
            </h1>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Undo / Redo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndexRef.current === 0 || mode === 'run'}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Undo"
              aria-label="Hoàn tác"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndexRef.current >= historyRef.current.length - 1 || mode === 'run'}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Redo"
              aria-label="Làm lại"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={handleSaveArtwork}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-[#12384B] shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{locale === 'vi' ? 'Lưu' : 'Save'}</span>
            </button>

            {/* Mode Specific Buttons */}
            {mode === 'build' ? (
              <button
                type="button"
                onClick={handleSwitchToRun}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#12384B] hover:bg-[#16455c] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#2EE6CA]" />
                <span>{locale === 'vi' ? 'Chạy thử' : 'Test Run'}</span>
              </button>
            ) : (
              <>
                {/* Simulation Pause / Resume */}
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#17657A] text-xs font-bold text-[#17657A] shadow-xs cursor-pointer hover:bg-teal-50/50 transition-all"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-[#17657A]" /> : <Pause className="w-3.5 h-3.5 text-[#17657A]" />}
                  <span>{isPaused ? (locale === 'vi' ? 'Tiếp tục' : 'Resume') : (locale === 'vi' ? 'Tạm dừng' : 'Pause')}</span>
                </button>

                {/* Simulation Restart */}
                <button
                  type="button"
                  onClick={() => setResetTrigger(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#12384B] shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                  <span>{locale === 'vi' ? 'Chạy lại' : 'Restart'}</span>
                </button>

                {/* Return to Edit CTA */}
                <button
                  type="button"
                  onClick={handleSwitchToBuild}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F67650] hover:bg-[#e06540] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-white" />
                  <span>{locale === 'vi' ? 'Sửa thiết kế' : 'Edit Design'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center Workspace Stage */}
        <div className="flex-1 flex gap-3 min-h-[460px] relative">
          {/* Left Vertical 3D Controls */}
          <div className="w-16 flex flex-col justify-between items-center py-2 shrink-0">
            {/* 4 Core Tools Card */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-black/5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLeftTool('move')}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                  activeLeftTool === 'move'
                    ? 'bg-[#2EE6CA]/30 text-[#12384B] ring-2 ring-[#2EE6CA]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Di chuyển"
                aria-label="Công cụ di chuyển"
              >
                <Move className="w-4 h-4" />
                <span>Di chuyển</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTool('rotate')}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                  activeLeftTool === 'rotate'
                    ? 'bg-[#2EE6CA]/30 text-[#12384B] ring-2 ring-[#2EE6CA]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Xoay"
                aria-label="Công cụ xoay"
              >
                <RotateCw className="w-4 h-4" />
                <span>Xoay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLeftTool('zoom');
                  setZoomTrigger(prev => prev + 1);
                }}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                  activeLeftTool === 'zoom'
                    ? 'bg-[#2EE6CA]/30 text-[#12384B] ring-2 ring-[#2EE6CA]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Phóng to"
                aria-label="Công cụ phóng to"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Phóng to</span>
              </button>

              {mode === 'build' ? (
                <button
                  type="button"
                  onClick={() => setActiveLeftTool('delete')}
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                    activeLeftTool === 'delete'
                      ? 'bg-[#F67650]/20 text-[#F67650] ring-2 ring-[#F67650]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Xóa đối tượng"
                  aria-label="Công cụ xóa"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-gray-300 pointer-events-none"
                  title="Chế độ chạy ẩn công cụ xóa"
                >
                  <Trash2 className="w-4 h-4 opacity-30" />
                  <span className="opacity-30">Xóa</span>
                </div>
              )}
            </div>

            {/* Bottom 3D Compass Widget */}
            <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center relative select-none">
              <button
                type="button"
                onClick={() => handleCompassClick(0)}
                className="absolute top-1 text-[9px] font-bold text-gray-500 hover:text-[#17657A] cursor-pointer"
                title="Bắc (N)"
              >
                N
              </button>
              <button
                type="button"
                onClick={() => handleCompassClick(Math.PI / 2)}
                className="absolute right-1 text-[9px] font-bold text-gray-500 hover:text-[#17657A] cursor-pointer"
                title="Đông (E)"
              >
                E
              </button>
              <button
                type="button"
                onClick={() => handleCompassClick(Math.PI)}
                className="absolute bottom-1 text-[9px] font-bold text-gray-500 hover:text-[#17657A] cursor-pointer"
                title="Nam (S)"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => handleCompassClick(-Math.PI / 2)}
                className="absolute left-1 text-[9px] font-bold text-gray-500 hover:text-[#17657A] cursor-pointer"
                title="Tây (W)"
              >
                W
              </button>
              <div
                className="w-7 h-7 rounded-full bg-[#17657A]/10 flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${-compassAngle}rad)` }}
              >
                <div className="w-3 h-3 border-t-2 border-l-2 border-[#17657A] -rotate-45" />
              </div>
            </div>
          </div>

          {/* Center 3D Isometric Viewport Container */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-black/5 relative overflow-hidden flex items-center justify-center">
            {/* Real Three.js Canvas */}
            <Habitat3DCanvas
              mode={mode}
              items={items}
              onItemsChange={handleItemsChange}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              activeTool={activeLeftTool}
              activeAssetId={selectedAssetId}
              isPaused={isPaused}
              resetTrigger={resetTrigger}
              zoomTrigger={zoomTrigger}
              compassRotation={compassAngle}
              onCameraRotate={setCompassAngle}
              onSelectAlert={() => setShowAlertModal(true)}
              className="absolute inset-0"
            />

            {/* Run Mode Motion Spline Trajectory Overlay */}
            {mode === 'run' && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  <path
                    d="M 320 380 Q 480 320, 620 350 T 840 430"
                    fill="none"
                    stroke="#2EE6CA"
                    strokeWidth="2.5"
                    strokeDasharray="8 6"
                    className="opacity-75"
                  />
                  <path
                    d="M 580 240 Q 680 220, 780 280"
                    fill="none"
                    stroke="#f6e05e"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    className="opacity-70"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Right Panel */}
          {mode === 'build' ? (
            /* Build Mode: Cảnh trong dự án */
            <div className="w-72 bg-white rounded-3xl p-4 shadow-sm border border-black/5 flex flex-col justify-between space-y-3 shrink-0">
              <div className="space-y-3">
                <div
                  onClick={() => setIsScenesPanelOpen(!isScenesPanelOpen)}
                  className="flex items-center justify-between pb-2 border-b border-gray-100 cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#12384B]">
                    {locale === 'vi' ? 'Cảnh trong dự án' : 'Project Scenes'}
                  </span>
                  <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform ${isScenesPanelOpen ? '' : 'rotate-180'}`}
                  />
                </div>

                {isScenesPanelOpen && (
                  <div className="space-y-2">
                    {HABITAT_SCENE_PRESETS.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectScene(preset.id)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          activeSceneId === preset.id
                            ? 'border-[#17657A] bg-[#17657A]/5 shadow-xs'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-lg">
                            {preset.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#12384B]">{preset.nameVi}</h4>
                            <p className="text-[11px] text-gray-500">{preset.subTitleVi}</p>
                          </div>
                        </div>
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Scene Button */}
              <button
                type="button"
                onClick={() => {
                  const newPreset = {
                    id: Date.now(),
                    nameVi: `Cảnh ${HABITAT_SCENE_PRESETS.length + 1}`,
                    nameEn: `Scene ${HABITAT_SCENE_PRESETS.length + 1}`,
                    subTitleVi: 'Cảnh tùy chỉnh',
                    subTitleEn: 'Custom Scene',
                    icon: '🌊',
                    items: [...items],
                  };
                  HABITAT_SCENE_PRESETS.push(newPreset);
                  setActiveSceneId(newPreset.id);
                }}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#17657A] text-[#17657A] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'vi' ? 'Thêm cảnh' : 'Add Scene'}</span>
              </button>
            </div>
          ) : (
            /* Run Mode: Con muốn đổi điều gì? */
            <div className="w-72 bg-white rounded-3xl p-4 shadow-sm border border-black/5 flex flex-col space-y-3 shrink-0">
              <div className="space-y-1">
                <div
                  onClick={() => setIsInspectPanelOpen(!isInspectPanelOpen)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <h3 className="text-sm font-bold text-[#12384B]">
                    {locale === 'vi' ? 'Con muốn đổi điều gì?' : 'Want to adjust anything?'}
                  </h3>
                  <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform ${isInspectPanelOpen ? '' : 'rotate-180'}`}
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {locale === 'vi'
                    ? 'Hãy chọn đối tượng để thêm, bớt hoặc di chuyển trong mô hình.'
                    : 'Select objects to add, remove, or reposition in the model.'}
                </p>
              </div>

              {isInspectPanelOpen && (
                <>
                  {/* Category Pills */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectCategory('rocks')}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs text-center cursor-pointer transition-colors ${
                        inspectCategory === 'rocks'
                          ? 'bg-[#2EE6CA]/20 text-[#12384B] border border-[#2EE6CA]/40'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {locale === 'vi' ? 'Đá & địa hình' : 'Rocks'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectCategory('seagrass')}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs text-center cursor-pointer transition-colors ${
                        inspectCategory === 'seagrass'
                          ? 'bg-[#2EE6CA]/20 text-[#12384B] border border-[#2EE6CA]/40'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {locale === 'vi' ? 'Cỏ biển' : 'Seagrass'}
                    </button>
                  </div>

                  {/* Quick Inspect Cards */}
                  <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
                    {HABITAT_ASSET_PALETTE[inspectCategory].map(item => (
                      <div
                        key={item.id}
                        onClick={handleSwitchToBuild}
                        className="p-3 rounded-2xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-[#17657A] shadow-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                        title="Bấm để chuyển về bàn sửa và đặt đối tượng này"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-[10px] font-bold text-[#12384B] text-center leading-tight">
                          {item.nameVi}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Asset Tray (Only in Build Mode) */}
        {mode === 'build' && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-black/5 space-y-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              {(['sand', 'rocks', 'seagrass', 'creatures'] as HabitatCategory[]).map(cat => {
                const labels: Record<HabitatCategory, { vi: string; en: string }> = {
                  sand: { vi: 'Cát', en: 'Sand' },
                  rocks: { vi: 'Đá', en: 'Rocks' },
                  seagrass: { vi: 'Cỏ biển', en: 'Seagrass' },
                  creatures: { vi: 'Sinh vật', en: 'Creatures' },
                };
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveTab(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#2EE6CA]/30 text-[#12384B] ring-2 ring-[#2EE6CA]'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {locale === 'vi' ? labels[cat].vi : labels[cat].en}
                  </button>
                );
              })}
            </div>

            {/* Asset Carousel & Helper Tip */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 overflow-x-auto py-1 flex-1">
                {HABITAT_ASSET_PALETTE[activeTab].map(asset => {
                  const isSelected = selectedAssetId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`min-w-[108px] p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#2EE6CA] bg-[#2EE6CA]/15 ring-2 ring-[#2EE6CA]/50 shadow-xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{asset.icon}</span>
                      <span className="text-[11px] font-bold text-[#12384B] truncate w-full text-center">
                        {asset.nameVi}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Drag/Drop Instruction */}
              <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 shrink-0">
                <MousePointer2 className="w-4 h-4 text-[#17657A]" />
                <span className="text-xs text-gray-600 max-w-[190px] leading-tight">
                  {locale === 'vi'
                    ? 'Kéo thả đối tượng vào vùng hợp lệ trên mô hình'
                    : 'Drag and drop items onto valid model spots'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Educational Alert Modal (Triggered by clicking ! marker on rock in Run Mode) */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-black/10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#F67650] font-black text-sm">
                <Info className="w-5 h-5" />
                <span>{locale === 'vi' ? 'Điểm quan sát sinh thái' : 'Ecological Insight Point'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
              <p className="font-bold text-[#12384B] text-sm">
                {locale === 'vi' ? 'Rạn đá ngầm và cụm cỏ biển' : 'Reef Rocks & Seagrass Clumps'}
              </p>
              <p>
                {locale === 'vi'
                  ? 'Tảng đá lớn trung tâm cùng các bụi cỏ biển cao là môi trường sống lý tưởng. Các khe nứt trên đá tạo nơi trú ngụ vững chắc cho hải quỳ và cá hề con, còn thảm cỏ biển cung cấp nguồn thức ăn dồi dào cho Rùa Xanh.'
                  : 'The center boulder and tall seagrass clusters provide a balanced habitat. Rocky crevices offer shelter for baby clownfish, while seagrass feeds the green sea turtle.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="px-5 py-2 rounded-xl bg-[#17657A] hover:bg-[#12384B] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {locale === 'vi' ? 'Đã hiểu' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12384B] text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#2EE6CA]" />
          <span>{saveToast}</span>
        </div>
      )}
    </ActivityShell>
  );
}
