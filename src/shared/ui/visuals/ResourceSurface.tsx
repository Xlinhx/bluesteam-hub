import { memo, useId } from 'react';
import './resource-seascape.css';

// Shapes follow their layout role, never the uploaded group name.
const contours = {
 'shelf-lagoon':['M14 28Q14 10 70 14C310 30 570 0 936 22Q994 24 986 76L974 268Q968 298 904 284C620 258 308 308 54 282Q10 278 14 240Z','M32 45C300 62 632 16 964 43M32 258C330 286 650 238 956 268'],
 'shelf-sandbank':['M30 20C290-4 580 44 932 12Q994 8 988 60L980 254Q978 292 912 286C600 310 302 266 62 288Q12 292 12 254L18 60Q18 26 30 20Z','M40 40C360 14 620 66 964 34M34 266C280 250 632 290 960 266'],
 'shelf-inlet':['M10 52Q10 20 66 26C340 54 640-10 940 18Q984 22 980 64L994 244Q1000 280 948 282C610 270 350 314 50 282Q8 278 10 244Z','M30 54C340 82 620 18 958 44M34 256C360 290 650 246 970 258'],
 group:['M0 46Q0 4 80 14C340 36 700-12 940 20Q1000 28 1000 66V252Q1000 286 936 280C650 252 290 308 62 282Q0 278 0 242Z','M26 46C300 70 640 10 976 50M26 254C330 280 650 236 974 260'],
 index:['M0 18Q130-14 360 12C600 34 880-4 1000 22V280Q810 302 580 282C300 264 140 306 0 280Z','M30 42C310 18 650 64 970 38M30 258C310 286 650 242 970 266'],
 observation:['M0 230C180 144 275 260 460 152S720 120 820 60Q970-26 1000 85V300H0Z','M30 238C200 176 320 260 480 166S725 145 850 65'],
} as const;
export type ResourceSurfaceVariant = keyof typeof contours;
export const ResourceSurface = memo(function ResourceSurface({variant}:{variant:ResourceSurfaceVariant}) {
 const id = useId().replace(/:/g,'');
 const [fill,edge] = contours[variant];
 return <svg className="resource-surface resource-surface-contour" data-surface={variant} viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--surface-light,#f1f1e7)"/><stop offset=".55" stopColor="var(--surface-fill,#deebe3)"/><stop offset="1" stopColor="var(--surface-deep,#c9ddd5)"/></linearGradient></defs>
  <path className="resource-surface-fill" d={fill} style={{fill:`url(#${id})`}}/>
  <path className="resource-surface-edge" d={fill}/>
  <path className="resource-surface-current" pathLength="1" d={edge}/>
 </svg>;
});
