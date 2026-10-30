import { INTERACTIVE_SIMULATION_DEFINITIONS } from '@bluesteam/contracts';
import { useRef, useState } from 'react';
import { Volume2, Compass, Play, CheckCircle2 } from 'lucide-react';
import { oceanAudio } from '../audio/oceanAudio';
import { type ActivityRuntimeProps } from './types';
import { ACTIVITY_TEMPLATE_REGISTRY, getActivityTemplateDefinition } from './registry';
import { SortingGameRuntime } from './templates/SortingGameRuntime';
import { MatchingGameRuntime } from './templates/MatchingGameRuntime';
import { ChoiceGameRuntime } from './templates/ChoiceGameRuntime';
import { ScenarioRuntime } from './scenario/ScenarioRuntime';
const SIMULATION_STEPS_BY_KEY = Object.fromEntries(Object.entries(INTERACTIVE_SIMULATION_DEFINITIONS).map(([key, definition]) => [key, definition.steps.map(step => ({ id: step.id, label: step.label, summary: step.label, isPositive: true }))]));
export function ActivityRuntime(props: ActivityRuntimeProps & {
    activeSceneIdOverride?: string | null;
    onOpenDedicatedRoute?: (route: string) => void;
}) {
    const { context, templateKey, config } = props;
    const normalizedKey = (templateKey ||
        (config as any)?.templateKey ||
        (config as any)?.simulationKey ||
        'sorting')
        .toString()
        .trim()
        .toLowerCase();
    const instanceKey = `${props.activityId || 'act'}:${normalizedKey}`;
    const [completedSimSteps, setCompletedSimSteps] = useState<Record<string, boolean>>({});
    const [activeSimStepId, setActiveSimStepId] = useState<string | null>(null);
    const [simulationPending, setSimulationPending] = useState(false);
    const [simulationError, setSimulationError] = useState('');
    const simulationSubmitting = useRef(false);
    if (!ACTIVITY_TEMPLATE_REGISTRY[normalizedKey])
        return <div role="alert" className="rounded-2xl bg-[#FAF6EE] p-8 text-[#12384B]">Hoạt động này chưa có bộ mô phỏng phù hợp. Cô vui lòng chọn hoạt động khác.</div>;
    if (normalizedKey === 'sorting') {
        return <SortingGameRuntime key={instanceKey} {...props}/>;
    }
    if (normalizedKey === 'matching') {
        return <MatchingGameRuntime key={instanceKey} {...props}/>;
    }
    if (normalizedKey === 'choice') {
        return <ChoiceGameRuntime key={instanceKey} {...props}/>;
    }
    if (normalizedKey === 'scenario') {
        return (<ScenarioRuntime key={instanceKey} {...props} activeSceneIdOverride={props.activeSceneIdOverride}/>);
    }
    // Interactive Simulation Runtime Embed
    const templateDef = getActivityTemplateDefinition(normalizedKey);
    const route = (config as any)?.route || templateDef.dedicatedRoute || '/interactive/rescue-mission';
    const instructionText = (config as any)?.instructionText ||
        templateDef.subtitle ||
        'Khám phá mô phỏng tương tác đại dương.';
    const steps = SIMULATION_STEPS_BY_KEY[normalizedKey] || SIMULATION_STEPS_BY_KEY['rescue-mission'];
    const currentStep = steps.find((s) => s.id === activeSimStepId) || steps[0];
    const handleSelectSimulationStep = async (step: {
        id: string;
        label: string;
        summary: string;
        isPositive?: boolean;
    }) => {
        if (props.isPaused || props.readOnly || simulationSubmitting.current || completedSimSteps[step.id])
            return;
        simulationSubmitting.current = true;
        setSimulationPending(true);
        setSimulationError('');

            simulationSubmitting.current = false;
            setSimulationPending(false);

        setActiveSimStepId(step.id);
        oceanAudio.speak(`${step.label}. ${step.summary}`);
        const nextCompleted = { ...completedSimSteps, [step.id]: true };
        setCompletedSimSteps(nextCompleted);
        const doneCount = Object.keys(nextCompleted).length;
        if (doneCount >= steps.length) {
            props.onComplete?.({
                completedItems: doneCount,
                totalItems: steps.length,
                earnedPoints: 0,
            });
        }
    };
    return (<div data-testid="simulation-activity-runtime" data-context={context} className="relative w-full rounded-[28px] overflow-hidden border border-[#12384B]/12 bg-[#0F3142] text-white p-5 sm:p-6 shadow-[0_14px_34px_rgba(16,42,56,0.16)] space-y-5">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <img src={templateDef.thumbnailUrl} alt={props.title} className="w-full sm:w-56 h-36 object-cover rounded-2xl border border-white/20 shrink-0"/>
        <div className="flex-1 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2EE6CA]/20 text-[#2EE6CA] text-xs font-extrabold">
            <Compass className="w-3.5 h-3.5"/>
            <span>Mô phỏng tương tác</span>
          </div>
          <h3 className="text-xl font-serif font-black text-white">{props.title}</h3>
          <p className="text-sm text-white/85 font-medium leading-relaxed">{instructionText}</p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button type="button" onClick={() => oceanAudio.speak(instructionText)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition-colors cursor-pointer">
              <Volume2 className="w-4 h-4"/>
              <span>Nghe hướng dẫn</span>
            </button>
            {props.onOpenDedicatedRoute && (<button type="button" onClick={() => props.onOpenDedicatedRoute?.(route)} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#DC6B52] hover:bg-[#C55840] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer">
                <Play className="w-4 h-4 fill-current"/>
                <span>Mở toàn màn hình mô phỏng</span>
              </button>)}
          </div>
        </div>
      </div>

      {/* Interactive Simulation Steps inside Room / Preview / Presentation */}
      {simulationError && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-amber-950">{simulationError}</p>}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#2EE6CA]">
          <span>Chạm vào từng bước để khám phá mô phỏng:</span>
          <span>
            Đã khám phá {Object.keys(completedSimSteps).length}/{steps.length} bước
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {steps.map((step) => {
            const isSelected = currentStep.id === step.id;
            const isDone = Boolean(completedSimSteps[step.id]);
            return (<button key={step.id} type="button" disabled={props.isPaused || props.readOnly || simulationPending} data-testid={`simulation-step-${step.id}`} onClick={() => handleSelectSimulationStep(step)} className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${isSelected
                    ? 'bg-white text-[#102A38] border-[#2EE6CA] shadow-md'
                    : isDone
                        ? 'bg-emerald-950/60 text-white border-emerald-400/50'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'}`}>
                <div className="space-y-1">
                  <div className="text-sm font-extrabold">{step.label}</div>
                  <div className={`text-xs leading-snug ${isSelected ? 'text-[#415A6B]' : 'text-white/80'}`}>
                    {step.summary}
                  </div>
                </div>
                {isDone && (<CheckCircle2 className={`w-5 h-5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-[#2EE6CA]'}`}/>)}
              </button>);
        })}
        </div>
      </div>
    </div>);
}
