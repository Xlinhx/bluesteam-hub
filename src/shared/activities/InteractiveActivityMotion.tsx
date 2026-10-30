import { useRef, type ReactNode } from 'react';
import { useInteractiveAudioMotion } from '../ui/motion/useInteractiveMotion';
import '../ui/motion/interactive-motion.css';

export function InteractiveActivityMotion({children, context,contentId}: {children:ReactNode;context:'standalone'|'preview';contentId:string}) {
  const root = useRef<HTMLDivElement>(null);
  useInteractiveAudioMotion(root);
  return <div ref={root} className="interactive-activity-motion" data-motion-content-id={contentId} data-motion-context={context}>{children}</div>;
}
