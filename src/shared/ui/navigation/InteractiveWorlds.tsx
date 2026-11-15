import { oceanAudio } from '../../audio/oceanAudio';
import { Box, Gamepad2, FlaskConical, MessageCircleQuestion, Check, Volume2 } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { useInteractiveMotionScope } from '../motion/useInteractiveMotion';
import { interactiveMotion } from '../motion/interactiveMotion';
import type { InteractiveCategoryKind } from '../../data/categoryArtworkMap';
import { INTERACTIVE_ARTWORK } from '../../data/interactiveArtwork';
import './interactive-worlds.css';
import {InteractiveWorldArtwork} from './InteractiveWorldArtwork';

export const INTERACTIVE_WORLDS = [
  { kind: 'model3d', label: 'Khám phá 3D', Icon: Box },
  { kind: 'game', label: 'Trò chơi', Icon: Gamepad2 },
  { kind: 'simulation', label: 'Mô phỏng', Icon: FlaskConical },
  { kind: 'scenario', label: 'Tình huống', Icon: MessageCircleQuestion },
] as const;

export function resolveInteractiveKind(raw?: string): InteractiveCategoryKind {
  if (raw === '3d' || raw === 'model3d') return 'model3d';
  if (raw === 'simulation' || raw === 'simulations') return 'simulation';
  if (raw === 'scenario' || raw === 'scenarios') return 'scenario';
  return 'game';
}

export function InteractiveWorlds({ value, onChange, compact = false, listen = false }: {
  value: InteractiveCategoryKind;
  onChange: (kind: InteractiveCategoryKind) => void;
  compact?: boolean;
  listen?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pointer = useRef(false), previous = useRef(value);
  const scope = useInteractiveMotionScope();
  useLayoutEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    scope.current?.cancel();
    if (!pointer.current) return;
    pointer.current = false;
    const selected = root.current?.querySelector('[aria-pressed=true]');
    const learner = root.current?.closest('[data-audience]')?.getAttribute('data-audience') === 'learner';
    const mobile=window.matchMedia('(max-width:767px)').matches;
    const art = selected?.querySelector(compact ? '.interactive-world__label svg' : '.interactive-world-scene__actor');
    const tilt = {model3d:-3,game:2,simulation:-1.5,scenario:3}[value];
    scope.current?.play(art, [{rotate:`${tilt}deg`,translate:mobile?'0px 6px':learner?'0px 14px':'0px 8px',scale:'.97'},{rotate:`${-tilt*.35}deg`,translate:mobile?'0px -3px':'0px -5px',scale:'1.015',offset:.6},{rotate:'0deg',translate:'0px 0px',scale:'1'}], {duration:mobile?580:learner?interactiveMotion.learnerSelection:interactiveMotion.teacherSelection,easing:interactiveMotion.settle});
    if(!compact)scope.current?.play(selected?.querySelector('.interactive-world__label'),[{translate:'0px 5px'},{translate:'0px 0px'}],{duration:520,easing:interactiveMotion.settle});
  }, [value, compact, scope]);
  return <div ref={root} onPointerDownCapture={() => { pointer.current = true; }} onKeyDownCapture={() => { pointer.current = false; }} className={`interactive-worlds ${compact ? 'interactive-worlds--compact' : ''}`} role="group" aria-label="Loại hoạt động tương tác">
    {INTERACTIVE_WORLDS.map(({ kind, label, Icon }) => {
      return <div className="interactive-world-entry" key={kind}><button type="button" aria-pressed={value === kind} onClick={() => onChange(kind)} className={`interactive-world interactive-world--${kind}`} data-testid={`interactive-tab-${kind}`}>
        <span className="interactive-world__light" aria-hidden="true" />
        {!compact && <span className="interactive-world__art"><img className="interactive-world__creature interactive-world__fallback" src={INTERACTIVE_ARTWORK[kind]} width="520" height="360" alt="" /><InteractiveWorldArtwork kind={kind}/></span>}
        <span className="interactive-world__label"><Icon size={24} /><span>{label}</span></span>
        {value === kind && <span className="interactive-world__selected" aria-hidden="true"><Check size={15} /></span>}
      </button>{listen && <button type="button" className="interactive-world-listen" aria-label={"Nghe " + label} onClick={() => oceanAudio.speak(label)}><Volume2 size={19}/></button>}</div>;
    })}
  </div>;
}
