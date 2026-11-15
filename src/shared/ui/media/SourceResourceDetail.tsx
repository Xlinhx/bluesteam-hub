import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, Fish, House, Palette, Printer, Volume2 } from 'lucide-react';
import type { OceanItem, OceanZone } from '../../api/learnerOcean';
import { oceanAudio } from '../../audio/oceanAudio';
import { OceanListen } from './OceanListen';
import { ResourceDetailFormats, ResourceDetailFrame } from './ResourceDetailFrame';
import { useOceanChoreography } from '../motion/useOceanChoreography';
import { ResourceSeascape } from '../visuals/ResourceSeascape';
import './source-detail.css';

export function SourceResourceDetail({ item, reef, onOpen, onOpenDrawing }: {
  item: OceanItem;
  reef?: OceanZone;
  onOpen: (id: string) => void;
  onOpenDrawing?: (template: string) => void;
}) {
  const [page, setPage] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLMediaElement | null>(null);
  const image = item.images?.[page];
  const pageCount = item.images?.length ?? 0;
  const flashcard = item.kind === 'flashcard';
  const audio = item.kind === 'audio';
  const video = item.kind === 'video';
  const document = ['coloring', 'worksheet', 'poster', 'download'].includes(item.kind);
  const presentation = document ? 'document' : audio || video ? 'playback' : 'visual';
  const pageNumber = item.pages?.[page];
  const pdf = item.file && /\.pdf$/i.test(item.file) ? item.file : undefined;
  const drawing = item.kind === 'coloring' && onOpenDrawing ? item.drawingTemplateKey : undefined;
  const titleLabel = `Nghe tên ${item.title}`;

  useOceanChoreography(scene, 'detail');
  useEffect(() => () => oceanAudio.stop(), []);
  const pauseMedia = () => media.current?.pause();

  return <ResourceDetailFrame sceneRef={scene} title={item.title} className="source-detail-frame"
    backdrop={<ResourceSeascape tone="detail"/>}
    titleAction={<OceanListen iconOnly profile="learner-resource" label={titleLabel} text={item.title} recording={item.audio} onPlay={pauseMedia}/>}
    stage={<div className="observation-photo source-stage" data-kind={item.kind} data-presentation={presentation}
      data-fill={Boolean(image && item.kind === 'image' && !image.includes('/pdf/'))}>
      {video && item.file ? <video ref={element => {media.current = element;}} onPlay={() => oceanAudio.stop()}
        controls playsInline preload="metadata" poster={image} src={item.file} aria-label={item.title}/> :
        image ? <img src={image} alt={item.title}/> : <div className="source-stage-empty">
          {audio ? <Volume2 size={40} aria-hidden="true"/> : <BookOpen size={40} aria-hidden="true"/>}
          <span>Chưa có bản xem trước.</span>
        </div>}
      {audio && item.file && <audio ref={element => {media.current = element;}} onPlay={() => oceanAudio.stop()}
        controls preload="metadata" src={item.file} aria-label={item.title}/>}
      {pageCount > 1 && !video && <div className="source-stage-controls">
        <button type="button" disabled={page === 0} onClick={() => setPage(current => current - 1)}><ArrowLeft size={18}/>{flashcard ? 'Mặt trước' : 'Ảnh trước'}</button>
        <span aria-live="polite">{page + 1} / {pageCount}</span>
        <button type="button" disabled={page === pageCount - 1} onClick={() => setPage(current => current + 1)}>{flashcard ? 'Mặt sau' : 'Ảnh tiếp theo'}<ArrowRight size={18}/></button>
      </div>}
    </div>}
    notes={<>
      {item.facts?.length || reef ? <div className="observation-facts source-facts" aria-label="Đặc điểm nổi bật cho bé">
        {item.facts?.map((fact, index) => <section className="observation-fact" key={index}>
          <span className="observation-fact-icon"><Fish aria-hidden="true"/></span>
          <div className="observation-fact-copy"><strong>{fact.label}</strong><span>{fact.text}</span>
            <OceanListen profile="learner-resource" label={'Nghe ' + fact.label.toLowerCase()} text={fact.spokenText ?? fact.text} recording={fact.audio} onPlay={pauseMedia}/>
          </div>
        </section>)}
        {reef?.intro && <section className="observation-fact">
          <span className="observation-fact-icon"><House aria-hidden="true"/></span>
          <div className="observation-fact-copy"><strong>Nơi ở · Vùng rạn san hô</strong><span>{reef.intro}</span>
            <OceanListen profile="learner-resource" text={reef.spokenText ?? `${reef.title}. ${reef.intro}`} recording={reef.audio} label="Nghe giới thiệu nơi ở" onPlay={pauseMedia}/>
          </div>
        </section>}
        {reef?.inquiry && <section className="observation-fact">
          <span className="observation-fact-icon"><Volume2 aria-hidden="true"/></span>
          <div className="observation-fact-copy"><strong>Cần gì?</strong><span>{reef.inquiry.text}</span>
            <OceanListen profile="learner-resource" text={reef.inquiry.text} recording={reef.inquiry.audio} label="Nghe câu hỏi Cần gì" onPlay={pauseMedia}/>
          </div>
        </section>}
      </div> : null}
      <ResourceDetailFormats kind={item.kind} id={item.id} variants={item.variants} onOpen={target => {
        pauseMedia();
        oceanAudio.stop();
        onOpen(target);
      }} onOpenDrawing={onOpenDrawing}/>
      {(pdf || drawing) && <div className="source-detail-actions">
        {drawing && <button type="button" onClick={() => onOpenDrawing?.(drawing)}><Palette size={19}/> Tô màu trên màn hình</button>}
        {pdf && item.kind !== 'download' && <a href={`${pdf}#page=${pageNumber || 1}`} target="_blank" rel="noreferrer"><Printer size={18}/> Xem bản in</a>}
        {pdf && <a href={pdf} download aria-label={'Tải ' + item.title}><Download size={18}/> {item.kind === 'download' ? 'Tải PDF' : 'Tải PDF gốc'}</a>}
      </div>}
      {item.note && <p className="source-detail-note">{item.note}</p>}
    </>}
  />;
}
