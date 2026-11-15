import {ResourceSeascape} from '../visuals/ResourceSeascape';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { ResourceFactIcon } from '../visuals/ResourceFactIcon';
import type { ResourceDto } from '../../api/catalog';
import { oceanAudio, type SpeechProfile } from '../../audio/oceanAudio';
import './resource-detail.css';
import { ResourceDetailFrame, ResourceDetailFormats } from './ResourceDetailFrame';
import { createMotionScope, motionTiming } from '../motion/motionScope';
import { useOceanChoreography } from '../motion/useOceanChoreography';

type RelatedResource = NonNullable<ResourceDto['related']>[number];

export function ResourceObservation({ resource, related, onOpen, onOpenDrawing, narrationProfile }: {
  resource: ResourceDto;
  related: RelatedResource[];
  onOpen: (id: string) => void;
  onOpenDrawing: (key: string) => void;
  narrationProfile?: SpeechProfile;
}) {
  const [albumIndex, setAlbumIndex] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  useOceanChoreography(scene, 'detail');
  const [speaking, setSpeaking] = useState(false);
  const [activeFact, setActiveFact] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const photoRef = useRef<HTMLImageElement>(null);
  const imageMotion = useRef<ReturnType<typeof createMotionScope> | null>(null);
  const imageDirection = useRef(0);
  const speechVersion = useRef(0);
  const album = resource.content.albumUrls?.length ? resource.content.albumUrls :
    (resource.content as ResourceDto['content'] & { albumImages?: string[] }).albumImages?.length
      ? (resource.content as ResourceDto['content'] & { albumImages: string[] }).albumImages
      : [resource.mediaUrl || resource.coverUrl || ''];
  const currentImage = album[albumIndex] || album[0];
  const doubleSidedCard = Boolean(resource.content.sourcePdfUrl && album.length === 2);
  const facts = (resource.content.shortFacts || []).slice(0, 3);

  useEffect(() => () => {
    speechVersion.current++;
    oceanAudio.stop();
  }, []);

  useEffect(() => {
    const scope = createMotionScope(); imageMotion.current = scope;
    return () => { scope.dispose(); imageMotion.current = null; };
  }, []);
  useEffect(() => {
    if (!imageDirection.current) return;
    imageMotion.current?.play(photoRef.current, [{ opacity: .5, transform: `translateX(${imageDirection.current * 12}px)` }, { opacity: 1, transform: 'none' }], { duration: 220, easing: motionTiming.settle });
  }, [albumIndex]);

  const speak = (text: string, fact: number | null = null) => {
    const version = ++speechVersion.current;
    setNotice('');
    setActiveFact(fact);
    setSpeaking(true);
    const started = oceanAudio.speak(text, { profile: narrationProfile, onEnd: () => {
      if (version === speechVersion.current) { setSpeaking(false); setActiveFact(null); }
    } });
    if (!started) {
      setSpeaking(false); setActiveFact(null);
      setNotice('Chưa phát được âm thanh. Bé hãy thử bật tiếng rồi nghe lại nhé.');
    }
  };
  const toggleNarration = () => {
    if (speaking) {
      speechVersion.current++;
      oceanAudio.stop();
      setSpeaking(false);
      setActiveFact(null);
    } else speak(resource.content.narrationText || `${resource.title}. ${resource.description}`);
  };
  const changeImage = (direction: number) => {
    imageDirection.current = direction;
    setAlbumIndex(index => (index + direction + album.length) % album.length);
  };

  return (
    <ResourceDetailFrame sceneRef={scene} title={resource.title} listening={speaking}
      backdrop={<ResourceSeascape tone="detail"/>}
      titleAction={<button className="observation-name-audio" aria-label={`Nghe tên ${resource.title}`}
        onClick={() => speak(resource.title)}><Volume2 /></button>}
      stage={<div className="observation-photo" aria-label={`Ảnh ${resource.title}`}>
        {currentImage ? <img ref={photoRef} src={currentImage} alt={resource.title}
          className={resource.content.sourcePdfUrl || /\.png(?:\?|$)/i.test(currentImage) ? 'is-cutout' : ''} /> : <p role="status">Chưa có hình ảnh.</p>}
        {doubleSidedCard ? <button className="observation-arrow observation-flip next" onClick={() => changeImage(1)}>
          {albumIndex === 0 ? 'Mặt sau' : 'Mặt trước'}
        </button> : album.length > 1 && <>
          <button className="observation-arrow previous" aria-label="Ảnh trước" onClick={() => changeImage(-1)}><ChevronLeft /></button>
          <button className="observation-arrow next" aria-label="Ảnh tiếp theo" onClick={() => changeImage(1)}><ChevronRight /></button>
          <span className="sr-only" aria-live="polite">Ảnh {albumIndex + 1} trên {album.length}</span>
        </>}
        <button className="observation-listen" onClick={toggleNarration} aria-pressed={speaking}
          aria-label={`${speaking ? 'Dừng nghe' : 'Nghe thuyết minh'} ${resource.title}`}>
          {speaking ? <VolumeX /> : <Volume2 />}
          <span>{speaking ? 'Dừng nghe' : 'Nghe'}</span>
          <span className="observation-listen-ripple" aria-hidden="true"><i/><i/></span><span className="listening-wave" aria-hidden="true" data-playing={speaking}><i /><i /><i /></span>
        </button>
      </div>}
      notes={<>
        <div className="observation-facts" aria-label="Đặc điểm nổi bật cho bé">
          {facts.map((fact, index) => {
            return <button key={fact.label} className="observation-fact" data-speaking={activeFact === index}
              onClick={() => speak(`${fact.label}. ${fact.detail || ''}`, index)}>
              <span className="observation-fact-icon"><ResourceFactIcon iconKey={fact.iconKey} /></span>
              <span className="observation-fact-copy"><strong>{fact.label}</strong></span>
            </button>;
          })}
        </div>
        <ResourceDetailFormats key={resource.id} kind={resource.kind} id={resource.id} variants={resource.variants}
          drawingTemplate={resource.content.drawingTemplateKey} onOpen={onOpen} onOpenDrawing={onOpenDrawing}/>
        {resource.content.sourcePdfUrl && <a className="observation-source-document" target="_blank" rel="noreferrer"
          href={resource.content.sourcePdfUrl + (resource.content.sourcePages?.[albumIndex] ? `#page=${resource.content.sourcePages[albumIndex]}` : '')}>Xem trang trong PDF</a>}
        {notice && <p className="observation-notice" role="status">{notice}</p>}
        {related.length > 0 && <section className="observation-related" aria-label="Sinh vật liên quan">
          <h2>Sinh vật liên quan</h2>
          <div className="observation-related-grid">
            {related.slice(0, 3).map(item => <div key={item.id} className="observation-related-item">
              <button className="observation-related-open" onClick={() => onOpen(item.id)} aria-label={`Mở ${item.title}`}>
                {item.coverUrl && <img src={item.coverUrl} alt="" loading="lazy" />}
                <span>{item.title}</span>
              </button>
              <button className="observation-related-audio" onClick={() => speak(item.title)} aria-label={`Nghe tên ${item.title}`}><Volume2 /></button>
            </div>)}
          </div>
        </section>}
      </>}/>
  );
}
