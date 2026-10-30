import {CreativeCompletionActions} from './CreativeCompletionActions';
import {HabitatAssetLibrary} from './HabitatAssetLibrary';
import {HabitatPlacedList} from './HabitatPlacedList';
import {CreativeToolPanel} from './CreativeToolPanel';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Copy, Move, Play, Redo2, RotateCcw, RotateCw, Trash2, Undo2, LayoutGrid, ArrowRight, Plus, Minus } from 'lucide-react';
import type { ImmutableContentSnapshot } from './contentSnapshot';
import { Habitat3DCanvas } from './Habitat3DCanvas';
import { DEFAULT_HABITAT_ITEMS, HABITAT_SCENE_PRESETS, type HabitatPlacedItem, type HabitatToolType } from './habitatTypes';
import { createHabitatProject, readHabitatProject, MAX_HABITAT_SCENES, type HabitatProject } from './habitatProject';
import { resolveHabitatMaterials } from './habitatMaterials';
import { creativeStorage, type CreativeArtwork } from './creativeStorage';
import { useCreativeDraft } from './useCreativeDraft';
import './creativeWorkspace.css';

interface Props {
  snapshot:ImmutableContentSnapshot;
  workspace?:{kind:'local';id:string;artwork?:CreativeArtwork};
  participantAlias?:string;
  preview?:boolean; readOnly?:boolean; isPaused?:boolean;
  initialMode?:'build'|'run'; onModeChange?:(mode:'build'|'run')=>void;
}
export function CreativeHabitatSurface({snapshot,workspace,participantAlias,preview=false,readOnly=false,isPaused=false,initialMode='build',onModeChange}:Props) {
  const local=workspace?.kind==='local'?workspace:null;
  const id=local?.id||'habitat-preview';
  const config=snapshot.config||{};
  const initialItems=Array.isArray(config.items)?config.items:HABITAT_SCENE_PRESETS.find(p=>p.id===config.presetId)?.items||DEFAULT_HABITAT_ITEMS;
  const [project,setProject]=useState<HabitatProject>(()=>createHabitatProject(initialItems));
  const [title,setTitle]=useState(local?.artwork?.title||(participantAlias ? `${snapshot.title} — ${participantAlias}` : snapshot.title));
  const [ready,setReady]=useState(preview||readOnly);
  const [error,setError]=useState('');
  const [mode,setMode]=useState(initialMode);
  const [runPaused,setRunPaused]=useState(false);
  const [tool,setTool]=useState<HabitatToolType>('move');
  const [focusRequest,setFocusRequest]=useState<{id:string;revision:number}|undefined>();
  const [recentAssets,setRecentAssets]=useState<string[]>([]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [reset,setReset]=useState(0);
  const [zoom,setZoom]=useState(0);
  const [scenePicker,setScenePicker]=useState(false);
  const [compact,setCompact]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:800px)').matches);
  useEffect(()=>{const m=window.matchMedia('(max-width:800px)');const sync=()=>setCompact(m.matches);m.addEventListener('change',sync);return()=>m.removeEventListener('change',sync);},[]);
  const [libraryOpen,setLibraryOpen]=useState(false);
  const [libraryTab,setLibraryTab]=useState<'catalog'|'placed'>('catalog');
  const [newPreset,setNewPreset]=useState('empty');
  const capture=useRef<(()=>string)|null>(null);
  const captureReady=useCallback((value:(()=>string)|null)=>{capture.current=value;},[]);
  const history=useRef<Record<string,{past:HabitatPlacedItem[][];future:HabitatPlacedItem[][]}>>({});
  const gesture=useRef<HabitatPlacedItem[]|null>(null);
  const scene=project.scenes.find(s=>s.id===project.activeSceneId)!;
  const items=scene.items;
  const latestItems=useRef(items);latestItems.current=items;
  const selected=items.find(i=>i.id===selectedId);
  const assets=resolveHabitatMaterials(config);
  const baseLocked=readOnly||isPaused||!ready||!!error;
  const draft=useCreativeDraft({id,disabled:preview||readOnly||!ready||!!error,
    getArtwork:()=>({id,type:'habitat',title,createdAt:Date.now(),previewDataUrl:capture.current?.()||'',sourceSnapshot:snapshot,habitatChallenge:local?.artwork?.habitatChallenge,habitatData:{items,project},templateConfig:config}),
  });
  const locked=baseLocked||draft.finishing||draft.completed;
  useEffect(()=>{
    if(preview||readOnly)return;
    let cancelled=false;
    void (async()=>{
      const stored=local?.artwork||await creativeStorage.getArtworkById(id);
      let fallback=initialItems;
      const next=readHabitatProject(stored?.habitatData?.project,(stored?.habitatData?.items||fallback) as HabitatPlacedItem[]);
      if(cancelled)return;
      setProject(next);if(stored){draft.restore(stored);setTitle(stored.title);}setReady(true);
    })().catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:'Chưa mở được sa bàn.');});
    return()=>{cancelled=true;};
  },[id]);
  useEffect(()=>{setMode(initialMode);},[initialMode]);
  useEffect(()=>{if(!ready||preview||readOnly||error||draft.completed||!draft.isDirty())return;const timer=setTimeout(()=>{if(!gesture.current)void draft.saveProgress();},350);return()=>clearTimeout(timer);},[project,title,ready]);
  const remember=(before:HabitatPlacedItem[])=>{const stack=history.current[scene.id]||={past:[],future:[]};stack.past.push(before);if(stack.past.length>30)stack.past.shift();stack.future=[];};
  const replace=(next:HabitatPlacedItem[])=>setProject(p=>({...p,scenes:p.scenes.map(s=>s.id===p.activeSceneId?{...s,items:next}:s)}));
  const change=(next:HabitatPlacedItem[])=>{if(locked||draft.isFinishing()||mode==='run'||next.length>100)return;if(!gesture.current)remember(items);draft.changed();replace(next);};
  const finishGesture=()=>{const before=gesture.current;gesture.current=null;if(before&&JSON.stringify(before)!==JSON.stringify(latestItems.current)){remember(before);setProject(p=>({...p}));}};
  const undo=(redo=false)=>{if(locked)return;const stack=history.current[scene.id];if(!stack)return;const from=redo?stack.future:stack.past,to=redo?stack.past:stack.future;const next=from.pop();if(next){to.push(items);replace(next);draft.changed();}};
  const add=(assetId:string)=>{const asset=assets.find(a=>a.id===assetId);if(!asset)return;const item:HabitatPlacedItem={id:`item-${crypto.randomUUID()}`,assetId:asset.id,type:asset.type,nameVi:asset.nameVi,nameEn:asset.nameEn,x:((items.length%5)-2)*1.1,z:(Math.floor(items.length/5)%5-2)*.8,y:asset.type==='fish'||asset.type==='turtle'?1.5:0,rotation:0,scale:asset.defaultScale};if(items.length>=100||locked||mode==='run')return;change([...items,item]);setRecentAssets(old=>[asset.id,...old.filter(id=>id!==asset.id)].slice(0,6));setSelectedId(item.id);};
  const addScene=()=>{if(locked||project.scenes.length>=MAX_HABITAT_SCENES)return;const preset=HABITAT_SCENE_PRESETS.find(p=>String(p.id)===newPreset);const sceneId=`scene-${crypto.randomUUID()}`;setProject(p=>({...p,activeSceneId:sceneId,scenes:[...p.scenes,{id:sceneId,title:preset?.nameVi||`Cảnh ${p.scenes.length+1}`,items:structuredClone(preset?.items||[])}]}));setSelectedId(null);setScenePicker(false);draft.changed();};
  const stack=history.current[scene.id];
  if(error)return <div role="alert" className="creative-workspace-empty"><p>{error}</p>{local?.artwork?.previewDataUrl&&<img src={local.artwork.previewDataUrl} alt={title}/>}</div>;
  return <div className="creative-workspace creative-habitat-workspace" data-testid="creative-habitat-stage" data-completed={draft.completed}>
    <div className="creative-workspace-bar">
      {local?<label className="creative-project-title"><span>Tên sa bàn</span><input aria-label="Tên sa bàn" value={title} maxLength={120} onChange={e=>{setTitle(e.target.value);draft.changed();}} onBlur={()=>{if(!title.trim())setTitle('Nơi sống của bé');}}/></label>:<strong>{snapshot.title}</strong>}
      <div className="creative-workspace-actions"><button className="creative-btn" onClick={()=>undo()} disabled={locked||!stack?.past.length} aria-label="Hoàn tác"><Undo2 size={18}/></button><button className="creative-btn" onClick={()=>undo(true)} disabled={locked||!stack?.future.length} aria-label="Làm lại"><Redo2 size={18}/></button>
        {local&&<CreativeCompletionActions saving={draft.saving} completed={draft.completed} disabled={baseLocked} onSave={draft.saveProgress} onComplete={draft.complete}/>}
        <button className="creative-btn primary" onClick={()=>{const next=mode==='build'?'run':'build';setMode(next);onModeChange?.(next);}}><Play size={17}/>{mode==='build'?'Chạy thử':'Sửa thiết kế'}</button>
        {mode==='run'&&<button className="creative-btn" onClick={()=>setRunPaused(p=>!p)}>{runPaused?'Tiếp tục chuyển động':'Tạm dừng chuyển động'}</button>}

      </div>
    </div>
    <div className="creative-habitat-stage-layout">
      <div className="habitat-left-column">
      <div className="habitat-scene-heading"><label><Box size={17}/><select aria-label="Cảnh đang mở" value={scene.id} onChange={e=>{setProject(p=>({...p,activeSceneId:e.target.value}));setSelectedId(null);draft.changed();}}>{project.scenes.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label><span>{items.length} / 100 vật thể</span>{local&&<button className="creative-btn" disabled={locked||project.scenes.length>=MAX_HABITAT_SCENES} onClick={()=>setScenePicker(!scenePicker)}><Plus size={17}/>Thêm cảnh</button>}</div>
      {scenePicker&&<div className="creative-scene-picker"><label>Mẫu cảnh khởi đầu<select aria-label="Mẫu cảnh khởi đầu" value={newPreset} onChange={e=>setNewPreset(e.target.value)}><option value="empty">Cảnh trống</option>{HABITAT_SCENE_PRESETS.map(p=><option key={p.id} value={p.id}>{p.subTitleVi}</option>)}</select></label><button className="creative-btn" onClick={addScene}>Tạo cảnh</button></div>}
      <div className="creative-habitat-board" data-testid="habitat-board" onPointerDownCapture={()=>{if(!locked&&mode==='build')gesture.current=items;}} onPointerUpCapture={finishGesture} onPointerCancelCapture={finishGesture}>
        <Habitat3DCanvas framePadding={local?1.08:1} focusRequest={focusRequest} items={items} mode={mode} onItemsChange={change} selectedItemId={selectedId} onSelectItem={setSelectedId} activeTool={tool} activeAssetId="" isPaused={isPaused||runPaused} readOnly={locked} resetTrigger={reset} zoomTrigger={zoom} onCaptureReady={captureReady} className="w-full h-full"/>
        <div className="creative-habitat-tools" role="group" aria-label="Công cụ sa bàn">{([['move','Di chuyển',Move],['rotate','Xoay',RotateCw],['delete','Xóa',Trash2]] as const).map(([id,label,Icon])=><button className="creative-btn" key={id} aria-label={`Công cụ ${label}`} aria-pressed={tool===id} disabled={locked||mode==='run'} onClick={()=>setTool(id)}><Icon size={20}/><span>{label}</span></button>)}</div>
        <div className="creative-habitat-camera"><button className="creative-btn" onClick={()=>setReset(n=>n+1)} aria-label="Đặt lại góc nhìn"><RotateCcw size={18}/></button><button className="creative-btn" onClick={()=>setZoom(n=>n+1)} aria-label="Phóng to"><Plus size={18}/></button><button className="creative-btn" onClick={()=>setZoom(n=>n-1)} aria-label="Thu nhỏ"><Minus size={18}/></button></div>
      </div>
      <section className="habitat-recent-tray" aria-label="Vật thể vừa dùng"><h3>Dùng gần đây</h3><div>{recentAssets.length?recentAssets.map(id=>{const a=assets.find(a=>a.id===id);return a&&<button key={id} disabled={locked||mode==='run'||items.length>=100} onClick={()=>add(id)}>{a.thumbnailUrl&&<img src={a.thumbnailUrl} alt=""/>}<span>{a.nameVi}</span></button>;}):<p>Vật thể bé dùng sẽ nằm ở đây.</p>}<button className="habitat-open-library" onClick={()=>{setLibraryTab('catalog');setLibraryOpen(true);}}><LayoutGrid size={23}/><span>Mở thư viện<br/>vật thể</span><ArrowRight size={17}/></button></div></section>
      {!compact&&<HabitatPlacedList assets={assets} onFocus={id=>setFocusRequest({id,revision:Date.now()})} items={items} selected={selectedId} onSelect={setSelectedId}/>}
      {selected&&<section className="habitat-instance-inspector"><strong>{selected.nameVi} · số {items.findIndex(i=>i.id===selected.id)+1}</strong><label>Tỷ lệ <input aria-label="Kích thước vật thể" type="range" min=".5" max="2" step=".1" value={selected.scale} disabled={locked||mode==='run'} onChange={e=>change(items.map(i=>i.id===selected.id?{...i,scale:Number(e.target.value)}:i))}/><output>{selected.scale.toFixed(1)}</output></label><label>Xoay <input aria-label="Góc xoay vật thể" type="range" min="0" max={Math.PI*2} step=".05" value={selected.rotation%(Math.PI*2)} disabled={locked||mode==='run'} onChange={e=>change(items.map(i=>i.id===selected.id?{...i,rotation:Number(e.target.value)}:i))}/><output>{Math.round(selected.rotation*180/Math.PI)}°</output></label><button className="creative-btn" disabled={locked||mode==='run'||items.length>=100} onClick={()=>{const copy={...selected,id:`item-${crypto.randomUUID()}`,x:Math.min(7,selected.x+.5)};change([...items,copy]);setSelectedId(copy.id);}} aria-label="Nhân bản vật thể"><Copy size={17}/></button><button className="creative-btn" disabled={locked||mode==='run'} onClick={()=>{change(items.filter(i=>i.id!==selected.id));setSelectedId(null);}} aria-label="Xóa vật thể đang chọn"><Trash2 size={17}/></button></section>}
      <div className="habitat-budget"><span>{items.length} / 100 vật thể trong cảnh</span><meter value={items.length} max={100}/></div>
      </div>
      <aside className="creative-habitat-inspector">
        <button className="creative-btn habitat-library-trigger" onClick={()=>setLibraryOpen(true)}><LayoutGrid size={20}/>Thư viện vật thể · {items.length}/100 đã đặt</button>
        <CreativeToolPanel title="Thư viện vật thể" open={libraryOpen} alwaysDesktop onClose={()=>setLibraryOpen(false)} className="habitat-browser-panel">
          {compact&&<div className="habitat-browser-tabs"><button className="creative-btn" aria-pressed={libraryTab==='catalog'} onClick={()=>setLibraryTab('catalog')}>Thư viện</button><button className="creative-btn" aria-pressed={libraryTab==='placed'} onClick={()=>setLibraryTab('placed')}>Đã đặt ({items.length})</button></div>}
          <div hidden={compact&&libraryTab!=='catalog'}><HabitatAssetLibrary assets={assets} onAdd={add} disabled={locked||mode==='run'} count={items.length}/></div>
          {compact&&<div hidden={libraryTab!=='placed'}><HabitatPlacedList assets={assets} expanded onFocus={id=>setFocusRequest({id,revision:Date.now()})} items={items} selected={selectedId} onSelect={setSelectedId}/></div>}
        </CreativeToolPanel>
      </aside>
    </div>
    {!!config.instructionText&&<p className="creative-instruction">{String(config.instructionText)}</p>}{!!config.narrationUrl&&<audio controls src={String(config.narrationUrl)}/>}
    {isPaused&&<p role="status">Cô đang tạm dừng. Bố trí của bé được giữ nguyên.</p>}{draft.saveMessage&&<p role="status">{draft.saveMessage}</p>}
  </div>;
}
