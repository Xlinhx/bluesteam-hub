import { useRef, useState } from 'react';
import type { UsagePayload } from '@bluesteam/contracts';
import type { ActivityDto,Model3DDto } from '../api/catalog';
import { ActivityRuntime } from './ActivityRuntime';
import { ActivityShell } from '../shells/ActivityShell';
import { SketchfabViewer, type SketchfabViewerStatus } from '../ui/media/SketchfabViewer';
import { MyActionSimulationPage } from './simulations/MyActionSimulationPage';
import { PlasticJourneySimulationPage } from './simulations/PlasticJourneySimulationPage';
import { RescueMissionSimulationPage } from './simulations/RescueMissionSimulationPage';
import { WaterColumnSimulation } from './simulations/WaterColumnSimulation';
import { INTERACTIVE_SIMULATION_DEFINITIONS } from '@bluesteam/contracts';
import { InteractiveActivityMotion } from './InteractiveActivityMotion';
export function ActivityExperience({content,context,onBack,onUsageInteraction,onRestart,onModelStatus}:{content:ActivityDto|Model3DDto;context:'standalone'|'preview';onBack:()=>void;onUsageInteraction?:(payload:UsagePayload)=>void;onRestart?:()=>void;onModelStatus?:(status:SketchfabViewerStatus,uid:string|null)=>void}){
  return <InteractiveActivityMotion contentId={content.id} context={context}><ActivityExperienceContent content={content} context={context} onBack={onBack} onUsageInteraction={onUsageInteraction} onRestart={onRestart} onModelStatus={onModelStatus}/></InteractiveActivityMotion>;
}
function ActivityExperienceContent({content,context,onBack,onUsageInteraction,onRestart,onModelStatus}:{content:ActivityDto|Model3DDto;context:'standalone'|'preview';onBack:()=>void;onUsageInteraction?:(payload:UsagePayload)=>void;onRestart?:()=>void;onModelStatus?:(status:SketchfabViewerStatus,uid:string|null)=>void}){
  const [paused,setPaused]=useState(false);
  const depthZone = useRef('');
  const record=context==='standalone'?onUsageInteraction:undefined;
  if('kind' in content&&content.kind==='simulation'){
    const props={onBack,onUsageInteraction:record,onRestart:context==='standalone'?onRestart:undefined};
    if(content.templateKey==='my-action')return <MyActionSimulationPage {...props}/>;
    if(content.templateKey==='plastic-journey')return <PlasticJourneySimulationPage {...props}/>;
    if(content.templateKey==='rescue-mission')return <RescueMissionSimulationPage {...props}/>;
    if(content.templateKey==='water-column')return <ActivityShell title={content.title} variant="light" onBack={onBack}><WaterColumnSimulation onDepthChange={depth=>{const zone=depth<200?'sunlit':depth<1000?'twilight':depth<4000?'midnight':'abyssal';if(zone!==depthZone.current){depthZone.current=zone;const known=INTERACTIVE_SIMULATION_DEFINITIONS['water-column'].steps.some(step=>step.id===zone);if(known)record?.({type:'simulation_step',stepId:zone});}}}/></ActivityShell>;
  }
  const isModel=!('kind' in content);
  return <ActivityShell title={content.title} variant="light" onBack={onBack} isPaused={paused} onTogglePause={isModel?undefined:()=>setPaused(p=>!p)}>
    {isModel?<div className="p-4"><SketchfabViewer title={content.title} modelUidOrUrl={content.modelUid} coverUrl={content.coverUrl} attribution={content.attribution} heightClassName="h-[70vh]" onStatusChange={onModelStatus}/></div>:<ActivityRuntime context={context} activityId={content.id} title={content.title} templateKey={content.templateKey} config={content.config} isPaused={paused} onUsageInteraction={record} onRestart={onRestart}/>}
  </ActivityShell>;
}
