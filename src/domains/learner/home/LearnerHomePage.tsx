import { useRef, useState, type KeyboardEvent, type CSSProperties } from 'react';
import { Box, BookOpen, Gamepad2, Palette, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { HOME_ART, HomeShortcut } from '../../../shared/ui/home/HomeShortcut';
import { readHomeSelection, saveHomeSelection, useHomeEntrance } from '../../../shared/ui/home/useHomeEntrance';
import { prepareHomeGallery } from '../../../shared/ui/home/prepareHomeGallery';
import { HomeOceanStage } from '../../../shared/ui/home/HomeOceanStage';
import { HomeSpecimenMark } from '../../../shared/ui/home/HomeSpecimenMark';
import './home.css';

export const HOME_FEATURE_SLIDES = [
  { key: '3d', tabLabel: '3D', title: 'Khám phá 3D', description: 'Xoay mô hình, nhìn từ mọi phía', action: 'Khám phá', targetRoute: '/interactive/3d', imageUrl: HOME_ART.model, icon: Box },
  { key: 'resources', tabLabel: 'Học liệu', title: 'Kho học liệu', description: 'Mở sách, tìm điều mới', action: 'Mở học liệu', targetRoute: '/resources', imageUrl: HOME_ART.resources, icon: BookOpen },
  { key: 'games', tabLabel: 'Trò chơi', title: 'Trò chơi đại dương', description: 'Chơi một chút, khám phá thêm', action: 'Chơi ngay', targetRoute: '/interactive?kind=game', imageUrl: HOME_ART.games, icon: Gamepad2 },
] as const;

export function LearnerHomePage() {
  const { navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(() => readHomeSelection());
  const [selectionInput, setSelectionInput] = useState('initial');
  const entranceRef = useHomeEntrance('learner');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentSlide = HOME_FEATURE_SLIDES[activeIndex];
  const Icon = currentSlide.icon;
  const selectSlide = (index: number, keyboard = false, focusTab = false) => {
    const next = (index + HOME_FEATURE_SLIDES.length) % HOME_FEATURE_SLIDES.length;
    prepareHomeGallery(entranceRef.current, next, keyboard);
    setActiveIndex(next);
    saveHomeSelection(next);
    setSelectionInput(keyboard ? 'keyboard' : 'pointer');
    if (focusTab) tabRefs.current[next]?.focus();
  };
  const handleTabKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = activeIndex;
    if (event.key === 'ArrowRight') next++;
    else if (event.key === 'ArrowLeft') next--;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = HOME_FEATURE_SLIDES.length - 1;
    else return;
    event.preventDefault();
    selectSlide(next, true, true);
  };
  return <LearnerShell activeNav="home" compactMobileHeader>
    <div ref={entranceRef} className="learner-home" data-home-category={currentSlide.key} aria-label="Trang chủ học sinh">
      <HomeOceanStage role="learner" />
      <h1>Cùng khám phá đại dương</h1>
      <section className="home-discovery" aria-label="Ba cách khám phá" data-category={currentSlide.key} data-selection-input={selectionInput}>
        <div id="home-explore-panel" role="tabpanel" aria-labelledby={`home-tab-${currentSlide.key}`} className="home-feature">
          <div className="home-feature-copy home-split-copy">
            <HomeSpecimenMark kind={currentSlide.key} />
            <h2 key={`title-${currentSlide.key}`}>{currentSlide.title}</h2>
            <p key={`description-${currentSlide.key}`}>{currentSlide.description}</p>
            <button type="button" data-testid="home-feature-action" className="home-primary" onClick={() => navigate(currentSlide.targetRoute)}>
              <Icon size={25} /><span>{currentSlide.action}</span><ArrowRight size={22} />
            </button>
          </div>
          <div className="home-feature-gallery" aria-hidden="true">
            <div className="home-gallery-stage">
            {HOME_FEATURE_SLIDES.map((slide, index) => {
              const slot = (index - activeIndex + 4) % 3 - 1;
              return <img key={slide.key} src={slide.imageUrl} alt="" data-artwork={slide.key} data-active={index === activeIndex}
                data-testid={index === activeIndex ? 'home-feature-artwork' : undefined}
                style={{ '--slot': slot } as CSSProperties} decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} />;
            })}
            </div>
          </div>
        </div>
        <div className="home-selector-strip">
          <div role="tablist" aria-label="Chọn khu vực khám phá" className="home-selector-list" onKeyDown={handleTabKeys}>
            {HOME_FEATURE_SLIDES.map((slide, index) => {
              const TabIcon = slide.icon;
              return <button key={slide.key} ref={el => { tabRefs.current[index] = el; }} id={`home-tab-${slide.key}`} type="button" role="tab"
                aria-controls="home-explore-panel" aria-selected={index === activeIndex} tabIndex={index === activeIndex ? 0 : -1}
                onClick={event => selectSlide(index, event.detail === 0)} className="home-selector">
                <img src={slide.imageUrl} alt="" decoding="async" /><span className="home-selector-label"><TabIcon size={22} /><span>{slide.tabLabel}</span></span>
                <span className="home-selection-track" aria-hidden="true" />
              </button>;
            })}
          </div>
          <div className="home-scene-controls">
            <button type="button" onClick={event => selectSlide(activeIndex - 1, event.detail === 0)} aria-label="Mục trước"><ChevronLeft size={22} /></button>
            <button type="button" onClick={event => selectSlide(activeIndex + 1, event.detail === 0)} aria-label="Mục tiếp theo"><ChevronRight size={22} /></button>
          </div>
        </div>
      </section>
      <div className="home-shortcuts" aria-label="Lối tắt sáng tạo">
        <HomeShortcut label="Xưởng sáng tạo" image={HOME_ART.creative} icon={Palette} onClick={() => navigate('/creative')} />
      </div>
    </div>
  </LearnerShell>;
}
