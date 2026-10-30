import { useLayoutEffect, useRef } from 'react';
import { useInteractiveMotionScope } from '@/shared/ui/motion/useInteractiveMotion';
import { interactiveMotion } from '@/shared/ui/motion/interactiveMotion';
export function UsageMeter({ value, total, percent = true }: { value: number; total: number; percent?: boolean }) {
  const ratio = total ? Math.max(0, Math.min(1, value/total)) : 0;
  const bar = useRef<HTMLSpanElement>(null), previous = useRef(ratio);
  const scope = useInteractiveMotionScope();
  useLayoutEffect(() => {
    if (previous.current !== ratio && bar.current) {
      const visual=bar.current.getAnimations().length?getComputedStyle(bar.current).transform:`scaleX(${previous.current})`;
      scope.current?.play(bar.current, [{transform:visual},{transform:`scaleX(${ratio})`}],{duration:interactiveMotion.report,easing:interactiveMotion.settle});
    }
    previous.current = ratio;
  }, [ratio, scope]);
  return <div className="usage-meter"><span className="usage-meter__track" aria-hidden="true"><span ref={bar} style={{ width:'100%', transform:`scaleX(${ratio})` }}/></span><strong>{total ? <>{value} / {total}{percent && ` · ${Math.round(value / total * 100)}%`}</> : 'Chưa có trả lời'}</strong></div>;
}
