import {useCreativeColoringUsage} from './usage/useCreativeColoringUsage';
import {createDrawingSeaSource} from './scanning/drawingSeaSource';
import {CreativeCompletionActions} from './CreativeCompletionActions';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, PaintBucket, Paintbrush, Redo2, RotateCcw, Sparkles, Undo2, Download, ZoomIn, ZoomOut, Maximize2, Save, Info } from 'lucide-react';
import type { ImmutableContentSnapshot } from './contentSnapshot';
import { drawCrayonStroke, drawEraserStroke, drawMarineStamp, floodFill, type DrawingTool, type MarineStampType, type Point } from './drawing_engine';
import { creativeStorage, type CreativeArtwork } from './creativeStorage';
import { useCreativeDraft } from './useCreativeDraft';
import { normalizeCreativeConfig } from '@bluesteam/contracts';
import './creativeWorkspace.css';
import {DrawingPalette} from './DrawingPalette';
import {CreativeStampPicker} from './CreativeStampPicker';
import {rememberColor} from './drawingPalettes';
export function CreativeDrawingSurface({
  workspace,
  participantAlias = 'Bé',
  snapshot,
  isPaused = false,
  readOnly = false,
  preview = false,
  onSeaSource,
}: {
  workspace?: {kind:'local';id:string;artwork?:CreativeArtwork};
  participantAlias?: string;
  snapshot: ImmutableContentSnapshot;
  isPaused?: boolean;
  readOnly?: boolean;
  preview?: boolean;
  onSeaSource?:(id:string)=>void;
}) {
  const [recent,setRecent]=useState<string[]>([]);
  const templateRef=useRef<HTMLCanvasElement|null>(null);
  const layered=useRef(true);
  const composite=()=>{const paper=document.createElement('canvas');paper.width=800;paper.height=480;const c=paper.getContext('2d')!;c.fillStyle='#FAF7F0';c.fillRect(0,0,800,480);if(templateRef.current)c.drawImage(templateRef.current,0,0);if(canvasRef.current)c.drawImage(canvasRef.current,0,0);if(layered.current&&templateRef.current){c.globalCompositeOperation='multiply';c.drawImage(templateRef.current,0,0);}return paper.toDataURL('image/png');};
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom,setDrawingZoom]=useState(1);
  const [canvasReady,setCanvasReady]=useState(false);
  const [canvasNotice,setCanvasNotice]=useState('');
  const drawingConfigKey=JSON.stringify(snapshot.config || {});
  const config = normalizeCreativeConfig('drawing', snapshot.config || {});
  const builtinStamps=!Array.isArray(config.materials);
  const stampsAllowed=builtinStamps||config.materials.length>0;

  const [imageStamp, setImageStamp] = useState<any>(null);
  const stampImages = useRef(new Map<string, HTMLImageElement>());
  useEffect(() => {
    for (const material of (imageStamp?[imageStamp]:[])) if (material.mediaUrl&&!stampImages.current.has(material.id)) {
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = material.mediaUrl;
      img.onload = () => stampImages.current.set(material.id, img);
    }
  }, [imageStamp]);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<Point | null>(null);

  const [activeTool, setActiveTool] = useState<DrawingTool>('brush');
  const [selectedStamp, setSelectedStamp] = useState<MarineStampType>('starfish');
  const [selectedColor, setSelectedColor] = useState('#1E7E48');
  const [brushSize, setBrushSize] = useState<number>(14);

  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const local = workspace?.kind === 'local' ? workspace : null;
  const draftId = local?.id || 'drawing-preview';
  const usage=useCreativeColoringUsage(snapshot,Boolean(local)&&canvasReady&&!preview&&!readOnly);
  const pendingTool=useRef<{tool:DrawingTool;input:string}|null>(null);
  const bringToSea=async()=>{try{if(!await draft.saveProgress())return;const art=await creativeStorage.getArtworkById(draftId);if(!art)throw Error('Chưa lưu được tranh.');const scan=await createDrawingSeaSource(art);onSeaSource?.(scan.id);}catch(e){setCanvasNotice((e as Error).message);}};
  const draft = useCreativeDraft({id:draftId,disabled:preview||readOnly,
    getArtwork:()=>({id:draftId,type:'drawing',title:local?.artwork?.title || `${snapshot.title} — ${participantAlias}`,createdAt:Date.now(),previewDataUrl:canvasRef.current?composite():'',sourceSnapshot:snapshot,drawingData:{template:snapshot.contentId,canvasDataUrl:canvasRef.current?composite():'',document:layered.current?{schemaVersion:2,templateId:snapshot.contentId,paintDataUrl:canvasRef.current?.toDataURL('image/png')||''}:undefined},templateConfig:config}),
  });
  const persistDraft=useCallback(()=>{if(!preview&&!readOnly)void draft.save(false);},[draftId,preview,readOnly]);

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const before=historyRef.current[historyIndexRef.current];
      if(pendingTool.current&&before&&imgData.data.some((v,i)=>v!==before.data[i])){usage('tool_used',pendingTool.current.tool,pendingTool.current.input);}
      pendingTool.current=null;
      const next = historyRef.current.slice(0, historyIndexRef.current + 1);
      next.push(imgData);
      if (next.length > 20) next.shift();
      historyRef.current = next;
      historyIndexRef.current = next.length - 1;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    } catch {
      // ignore canvas security errors
    }
  }, []);

  const initCanvas = useCallback((restore=true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setCanvasReady(false);setCanvasNotice('Đang mở nét mẫu…');

    ctx.clearRect(0,0,canvas.width,canvas.height);
    const template=templateRef.current?.getContext('2d');template?.clearRect(0,0,800,480);

    const templateSrc = normalizeCreativeConfig('drawing', snapshot.config || {}).outlineUrl || '';

    historyRef.current = [];
    historyIndexRef.current = -1;
    pushHistory();

    let cancelled=false;
    let image:HTMLImageElement|null=null;
    const loadImage=(source:string,saved=false)=>{
      const img=image=new Image();img.crossOrigin='anonymous';
      img.onload=()=>{
        if(cancelled)return;
        if(saved){ctx.drawImage(img,0,0,canvas.width,canvas.height);pushHistory();setCanvasReady(true);setCanvasNotice(layered.current?'Đã mở lại tranh đang vẽ.':'Tranh cũ · chế độ tương thích');return;}
        const scale = Math.min(
          (canvas.width * 0.85) / Math.max(1, img.width),
          (canvas.height * 0.85) / Math.max(1, img.height),
        );
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (canvas.width - nw) / 2;
        const ny = (canvas.height - nh) / 2;
        template?.drawImage(img, nx, ny, nw, nh);
        pushHistory();
        setCanvasReady(true);setCanvasNotice('');if(!restore)persistDraft();
      };
      img.onerror=()=>{if(cancelled)return;setCanvasReady(false);setCanvasNotice('Chưa tải được tranh. Giữ nguyên bản lưu; thử tải lại trang.');};
      img.src=source;
    };
    const start=(saved?:string)=>{if(cancelled)return;if(saved)loadImage(saved,true);else if(templateSrc)loadImage(templateSrc);else{setCanvasReady(true);setCanvasNotice('');if(!restore)persistDraft();}};
    if(restore&&!preview&&!readOnly)void creativeStorage.getArtworkById(draftId).then(saved=>{if(cancelled)return;if(saved)draft.restore(saved);layered.current=!saved||!!saved.drawingData?.document;const paint=saved?.drawingData?.document?.paintDataUrl;if(paint&&templateSrc){const outline=new Image();outline.crossOrigin='anonymous';outline.onload=()=>{if(cancelled)return;const scale=Math.min(680/outline.width,408/outline.height);template?.drawImage(outline,(800-outline.width*scale)/2,(480-outline.height*scale)/2,outline.width*scale,outline.height*scale);start(paint);};outline.onerror=()=>{setCanvasNotice('Nét mẫu tải lỗi. Bản gốc vẫn được giữ.');};outline.src=templateSrc;}else start(paint||saved?.drawingData?.canvasDataUrl);}).catch(e=>{setCanvasNotice(e.message);});else{layered.current=true;start();}
    return()=>{cancelled=true;if(image){image.onload=null;image.onerror=null;}};
  }, [pushHistory, drawingConfigKey,draftId,preview,readOnly]);

  useEffect(() => {
    return initCanvas();
  }, [initCanvas, snapshot.contentId]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || readOnly || draft.completed || draft.isFinishing() || !canvasReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    pendingTool.current={tool:activeTool,input:e.pointerType};
    canvas.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);
    const recordChange=()=>{draft.changed();if(activeTool!=='eraser')setRecent(old=>rememberColor(old,selectedColor));};

    if (activeTool === 'bucket') {
      if(!config.fillMaskUrl)return;
      recordChange();
      if(layered.current&&templateRef.current){const merged=document.createElement('canvas');merged.width=800;merged.height=480;const m=merged.getContext('2d')!;m.fillStyle='#FAF7F0';m.fillRect(0,0,800,480);m.drawImage(templateRef.current,0,0);m.drawImage(canvas,0,0);const before=m.getImageData(0,0,800,480);floodFill(m,Math.round(pt.x),Math.round(pt.y),selectedColor,800,480);const after=m.getImageData(0,0,800,480),paint=ctx.getImageData(0,0,800,480);for(let i=0;i<paint.data.length;i+=4){if(before.data[i]!==after.data[i]||before.data[i+1]!==after.data[i+1]||before.data[i+2]!==after.data[i+2])paint.data.set(after.data.subarray(i,i+4),i);}ctx.putImageData(paint,0,0);}else floodFill(ctx, Math.round(pt.x), Math.round(pt.y), selectedColor, canvas.width, canvas.height);
      pushHistory();
      persistDraft();
      return;
    }

    if (activeTool === 'stamp') {
      if(!stampsAllowed)return;
      if (imageStamp) {
        if (!imageStamp.mediaUrl) {
          const stamp=imageStamp.payload?.stampId;
          if (['starfish','shell','bubble','coral','turtle','fish'].includes(stamp)) {drawMarineStamp(ctx,pt,stamp,selectedColor,Number(imageStamp.payload?.defaultScale || 1));recordChange();pushHistory();persistDraft();}
          return;
        }
        const img = stampImages.current.get(imageStamp.id);
        if (!img) { setCanvasNotice('Nhãn dán đang tải, bé thử lại nhé.'); return; }
        const size = 90 * Number(imageStamp.payload?.defaultScale || 1);
        const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight);
        ctx.drawImage(img, pt.x-img.naturalWidth*ratio/2, pt.y-img.naturalHeight*ratio/2, img.naturalWidth*ratio, img.naturalHeight*ratio);
        recordChange();pushHistory();persistDraft(); return;
      }
      if(!builtinStamps)return;
      drawMarineStamp(ctx, pt, selectedStamp, selectedColor, 1);
      recordChange();
      pushHistory();
      persistDraft();
      return;
    }

    recordChange();
    setIsDrawing(true);
    lastPointRef.current = pt;
    if (activeTool === 'eraser') {
      ctx.save();if(layered.current)ctx.globalCompositeOperation='destination-out';drawEraserStroke(ctx, pt, pt, brushSize);ctx.restore();
    } else {
      drawCrayonStroke(ctx, pt, pt, selectedColor, brushSize);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isPaused || readOnly || draft.completed || draft.finishing) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPointRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getCanvasPoint(e);
    if (activeTool === 'eraser') {
      ctx.save();if(layered.current)ctx.globalCompositeOperation='destination-out';drawEraserStroke(ctx, lastPointRef.current, pt, brushSize);ctx.restore();
    } else {
      drawCrayonStroke(ctx, lastPointRef.current, pt, selectedColor, brushSize);
    }
    lastPointRef.current = pt;
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    pushHistory();
    persistDraft();
  };

  const handleUndo = () => {
    if (isPaused || readOnly || historyIndexRef.current <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const before=ctx.getImageData(0,0,canvas.width,canvas.height);
    historyIndexRef.current -= 1;
    const restored=historyRef.current[historyIndexRef.current];
    ctx.putImageData(restored, 0, 0);
    if(before.data.some((v,i)=>v!==restored.data[i])){usage('undo');draft.changed();persistDraft();}
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const handleRedo = () => {
    if (
      isPaused ||
      readOnly ||
      historyIndexRef.current >= historyRef.current.length - 1
    ) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    historyIndexRef.current += 1;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    draft.changed();
    persistDraft();
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };
  const download = () => {
    if(!canvasRef.current)return;
    const link=document.createElement('a');link.href=composite();link.download='bluesteam-tranh.png';link.click();
  };

  const zoomControls = <div className="creative-workspace-actions drawing-zoom" aria-label="Góc nhìn giấy"><button className="creative-btn" onClick={()=>setDrawingZoom(z=>Math.min(3,z+.25))} aria-label="Phóng to giấy"><ZoomIn size={18}/></button><button className="creative-btn" onClick={()=>setDrawingZoom(z=>Math.max(1,z-.25))} aria-label="Thu nhỏ giấy"><ZoomOut size={18}/></button><button className="creative-btn" onClick={()=>setDrawingZoom(1)} aria-label="Vừa giấy"><Maximize2 size={18}/>{Math.round(zoom*100)}%</button></div>;
  return (
    <div
      data-testid="creative-drawing-stage" data-completed={draft.completed}
      className="creative-drawing-workspace p-3 sm:p-5 space-y-3 bg-[#FAF8F5]"
    >
      {/* Top Toolbar */}
      <div className="drawing-toolbar flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-3 border border-[#E4DDD0]">
        <div className="drawing-tool-group flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isPaused || readOnly || draft.completed || draft.finishing}
            onClick={() => setActiveTool('brush')}
            data-testid="drawing-tool-brush" aria-label="Bút sáp"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              activeTool === 'brush'
                ? 'bg-[#17657A] text-white'
                : 'bg-[#FAF8F5] text-[#102A38] border border-[#E4DDD0]'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Bút sáp</span>
          </button>

          <button
            type="button"
            disabled={isPaused || readOnly || draft.completed || draft.finishing || !config.fillMaskUrl}
            title={config.fillMaskUrl?'Chạm một vùng để tô':'Mẫu này chưa có mask tô mảng; bé dùng bút sáp nhé.'}
            onClick={() => setActiveTool('bucket')}
            data-testid="drawing-tool-bucket" aria-label="Tô mảng"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              activeTool === 'bucket'
                ? 'bg-[#17657A] text-white'
                : 'bg-[#FAF8F5] text-[#102A38] border border-[#E4DDD0]'
            }`}
          >
            <PaintBucket className="w-4 h-4" />
            <span>Tô mảng</span>
          </button>

          <button
            type="button"
            disabled={isPaused || readOnly || draft.completed || draft.finishing}
            onClick={() => {
              setActiveTool('stamp');
              setImageStamp(builtinStamps?null:config.materials[0]);
              setSelectedStamp('starfish');
            }}
            data-testid="drawing-tool-stamp" aria-label="Tem biển"
            title={stampsAllowed?'Thêm nhãn dán':'Mẫu này không có nhãn dán thêm'}
            aria-disabled={!stampsAllowed}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              activeTool === 'stamp'
                ? 'bg-[#17657A] text-white'
                : 'bg-[#FAF8F5] text-[#102A38] border border-[#E4DDD0]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tem biển</span>
          </button>

          <button
            type="button"
            disabled={isPaused || readOnly || draft.completed || draft.finishing}
            onClick={() => setActiveTool('eraser')}
            data-testid="drawing-tool-eraser" aria-label="Tẩy"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-[#17657A] text-white'
                : 'bg-[#FAF8F5] text-[#102A38] border border-[#E4DDD0]'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Tẩy</span>
          </button>

          {/* Brush size pills */}
          <div className="flex items-center gap-1 pl-2 border-l border-[#E4DDD0]">
            {[8, 14, 24].map((sz) => (
              <button
                key={sz}
                type="button"
                disabled={isPaused || readOnly || draft.completed || draft.finishing}
                onClick={() => setBrushSize(sz)}
                aria-label={`Cỡ nét ${sz}`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer ${
                  brushSize === sz
                    ? 'border-[#17657A] bg-[#E8F6F8]'
                    : 'border-[#E4DDD0] bg-white'
                }`}
              >
                <span
                  style={{ width: Math.max(6, sz / 2), height: Math.max(6, sz / 2) }}
                  className="rounded-full bg-[#102A38]"
                />
              </button>
            ))}
          </div>
        </div>

        {/* History & Submit Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo || isPaused || readOnly||draft.completed||draft.finishing}
            aria-label="Hoàn tác"
            className="p-2 rounded-xl border border-[#E4DDD0] bg-white text-[#102A38] disabled:opacity-40 cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo || isPaused || readOnly||draft.completed||draft.finishing}
            aria-label="Làm lại"
            className="p-2 rounded-xl border border-[#E4DDD0] bg-white text-[#102A38] disabled:opacity-40 cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          {local?<button
            type="button"
            onClick={()=>{if(window.confirm('Xóa phần màu và tem do bé vẽ? Nét mẫu vẫn được giữ.')){const c=canvasRef.current;if(c){draft.changed();c.getContext('2d')!.clearRect(0,0,c.width,c.height);pushHistory();persistDraft();}}}}
            disabled={isPaused || readOnly || draft.completed || draft.finishing}
            aria-label="Vẽ lại từ đầu"
            className="p-2 rounded-xl border border-[#E4DDD0] bg-white text-amber-700 disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>:<>          <button
            type="button"
            onClick={()=>{if(window.confirm('Xóa phần màu và tem do bé vẽ? Nét mẫu vẫn được giữ.')){const c=canvasRef.current;if(c){draft.changed();c.getContext('2d')!.clearRect(0,0,c.width,c.height);pushHistory();persistDraft();}}}}
            disabled={isPaused || readOnly || draft.completed || draft.finishing}
            aria-label="Vẽ lại từ đầu"
            className="p-2 rounded-xl border border-[#E4DDD0] bg-white text-amber-700 disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button></>}


          {local && <><button type="button" className="creative-btn" aria-label="Lưu tiến trình" disabled={!canvasReady||isDrawing||draft.saving||draft.completed} onClick={async()=>{if(await draft.saveProgress())usage('manual_save');}}><Save size={18}/><span>Lưu tranh</span></button><button type="button" onClick={download} disabled={!canvasReady} className="creative-btn" aria-label="Tải tranh PNG"><Download size={18}/></button></>}

        </div>
      </div>

      {activeTool === 'stamp' && builtinStamps && <div className="flex flex-wrap gap-2" aria-label="Con dấu có sẵn">{([['starfish','Sao biển'],['shell','Vỏ sò'],['bubble','Bong bóng'],['coral','San hô'],['turtle','Rùa biển'],['fish','Cá nhỏ']] as const).map(([id,label])=><button type="button" key={id} disabled={isPaused||readOnly||draft.completed||draft.finishing} className="creative-btn" aria-pressed={!imageStamp&&selectedStamp===id} onClick={()=>{setImageStamp(null);setSelectedStamp(id);}}>{label}</button>)}</div>}
      <DrawingPalette value={selectedColor} onApply={setSelectedColor} recent={recent} disabled={isPaused||readOnly||draft.completed||draft.finishing} suggested={config.suggestedPalette}/>
      {!local && zoomControls}
      {/* Drawing Canvas */}
      <div className="drawing-paper-scroll relative w-full rounded-2xl overflow-auto border-2 border-[#E4DDD0] bg-[#FAF7F0] shadow-inner flex items-center justify-center">
        <div className="drawing-paper-size" style={{width:`${zoom*100}%`,flexShrink:0,position:'relative'}}>
        <canvas ref={templateRef} width={800} height={480} aria-hidden="true" className="drawing-template-layer"/>
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          data-testid="drawing-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="drawing-paint-layer w-full max-h-[480px] aspect-[5/3] touch-none cursor-crosshair block"
        />
        </div>
      </div>

      {local&&<div className="drawing-paper-footer">
        {local&&<p className="drawing-paper-hints"><span><Info size={18}/>Chạm vùng kín để tô mảng</span><span><Paintbrush size={18}/>Nét mẫu được giữ riêng</span></p>}
        {zoomControls}
        {local&&<button className="creative-btn" disabled={!canvasReady||draft.saving} onClick={()=>void bringToSea()}>Đưa vào biển</button>}
        {local&&<CreativeCompletionActions hideSave saving={draft.saving} completed={draft.completed} disabled={!canvasReady||isDrawing} onSave={async()=>{const ok=await draft.saveProgress();if(ok)usage('manual_save');return ok;}} onComplete={async()=>{const ok=await draft.complete();if(ok)usage('complete');return ok;}}/>}
      </div>}

      {activeTool === 'stamp' && !!config.materials?.length&&<CreativeStampPicker materials={config.materials} disabled={isPaused||readOnly||draft.completed||draft.finishing} onSelect={m=>{setImageStamp(m);setActiveTool('stamp');}}/>}
      {!local && config.instructionText && <p className="text-sm text-slate-600">{config.instructionText}</p>}
      {config.narrationUrl && <audio controls src={config.narrationUrl} className="h-9 max-w-full"/>}
      {/* Status Banner */}
      {draft.saveMessage && <p role="status" className="text-sm text-slate-600">{draft.saveMessage}</p>}
      {canvasNotice && <p role="status" className="text-sm text-slate-600">{canvasNotice}</p>}

    </div>
  );
}
