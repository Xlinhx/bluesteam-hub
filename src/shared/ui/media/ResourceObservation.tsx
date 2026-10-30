import {ResourceSeascape} from '../visuals/ResourceSeascape';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Image, CirclePlay, Volume2, VolumeX, Pencil } from 'lucide-react';
import { ResourceFactIcon } from '../visuals/ResourceFactIcon';
import type { ResourceDto } from '../../api/catalog';
import { oceanAudio } from '../../audio/oceanAudio';
import './resource-detail.css';
import { getLinkedChoices } from '../../api/resourceLinks';
import { createMotionScope, motionTiming } from '../motion/motionScope';
import { useOceanChoreography } from '../motion/useOceanChoreography';

type RelatedResource = NonNullable<ResourceDto['related']>[number];

export function ResourceObservation({ resource, related, onOpen, onOpenDrawing }: {
  resource: ResourceDto;
  related: RelatedResource[];
  onOpen: (id: string) => void;
  onOpenDrawing: (key: string) => void;
}) {
  const [albumIndex, setAlbumIndex] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  useOceanChoreography(scene, 'detail');
  const [speaking, setSpeaking] = useState(false);
  const [activeFact, setActiveFact] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [choiceKind, setChoiceKind] = useState<string | null>(null);
  const choices = choiceKind ? getLinkedChoices(resource.variants, choiceKind) : [];
  const photoRef = useRef<HTMLImageElement>(null);
  const imageMotion = useRef<ReturnType<typeof createMotionScope> | null>(null);
  const imageDirection = useRef(0);
  const speechVersion = useRef(0);
  const album = resource.content.albumUrls?.length ? resource.content.albumUrls :
    (resource.content as ResourceDto['content'] & { albumImages?: string[] }).albumImages?.length
      ? (resource.content as ResourceDto['content'] & { albumImages: string[] }).albumImages
      : [resource.mediaUrl || resource.coverUrl || ''];
  const currentImage = album[albumIndex] || album[0];
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
    const started = oceanAudio.speak(text, { onEnd: () => {
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
    <div ref={scene} className="resource-observation" data-listening={speaking}><ResourceSeascape tone="detail" sceneKey={resource.id}/>
      <div className="observation-title">
        <h1>{resource.title}</h1>
        <button className="observation-name-audio" aria-label={`Nghe tên ${resource.title}`}
          onClick={() => speak(resource.title)}><Volume2 /></button>
      </div>
      <div className="observation-photo" aria-label={`Ảnh ${resource.title}`}>
        {currentImage ? <img ref={photoRef} src={currentImage} alt={resource.title}
          className={/\.png(?:\?|$)/i.test(currentImage) ? 'is-cutout' : ''} /> : <p role="status">Chưa có hình ảnh.</p>}
        {album.length > 1 && <>
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
      </div>

      <div className="observation-notes">
        <div className="observation-facts" aria-label="Đặc điểm nổi bật cho bé">
          {facts.map((fact, index) => {
            return <button key={fact.label} className="observation-fact" data-speaking={activeFact === index}
              onClick={() => speak(`${fact.label}. ${fact.detail || ''}`, index)}>
              <span className="observation-fact-icon"><ResourceFactIcon iconKey={fact.iconKey} /></span>
              <span className="observation-fact-copy"><strong>{fact.label}</strong></span>
            </button>;
          })}
        </div>
        <div className="observation-formats" aria-label="Định dạng học liệu">
          {[
            { key: 'image', label: 'Ảnh', icon: Image },
            { key: 'video', label: 'Video', icon: CirclePlay },
            { key: 'audio', label: 'Nghe', icon: Volume2 },
            { key: 'coloring', label: 'Tô màu', icon: Pencil },
          ].filter(format => format.key === 'image' || getLinkedChoices(resource.variants,format.key).length > 0 || (format.key === 'coloring' && Boolean(resource.content.drawingTemplateKey))).map(format => {
            const Icon = format.icon;
            const linkedChoices = getLinkedChoices(resource.variants, format.key);
            const linked = linkedChoices[0];
            return <button key={format.key} className="observation-format" aria-current={format.key === 'image' ? 'true' : undefined}
              title={format.label}
              onClick={() => {
                setNotice('');
                if (linkedChoices.length > 1) {
                  setChoiceKind(current => current === format.key ? null : format.key);
                  return;
                }
                setChoiceKind(null);
                if (format.key === 'image') { if (linked) onOpen(linked.id); return; }
                const template = linked?.drawingTemplateKey || resource.content.drawingTemplateKey;
                if (format.key === 'coloring' && template) onOpenDrawing(template);
                else if (linked) onOpen(linked.id);
              }}><Icon /><span>{format.label}</span></button>;
          })}
        </div>
        {choices.length > 1 && <section className="observation-media-choices" aria-label="Chọn học liệu liên kết">
          {choices.map(item => <button key={item.id} onClick={() => {
            if (item.kind === 'coloring' && item.drawingTemplateKey) onOpenDrawing(item.drawingTemplateKey);
            else onOpen(item.id);
          }}>
            {item.coverUrl && <img src={item.coverUrl} alt="" />}
            <span>{item.title}</span>
          </button>)}
        </section>}
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
      </div>
    </div>
  );
}
