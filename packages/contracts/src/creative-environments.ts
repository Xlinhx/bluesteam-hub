import {z} from 'zod';
/** Add an environment once: validation, catalogue and live preview share its identity. */
export const CREATIVE_SEA_ENVIRONMENTS=[
 {id:'reef',title:'Rạn san hô',color:'#6bb8cb',preview:'/assets/generated/creative/learner-v3/scan-reef-watercolor-v1.webp'},
 {id:'lagoon',title:'Vịnh xanh',color:'#97cdbd',preview:'/assets/generated/creative/learner-v3/seagrass-watercolor-v2.png'},
 {id:'deep',title:'Biển sâu',color:'#244968',preview:'/assets/generated/creative/learner-v3/deep-watercolor-v2.png'},
] as const;
type EnvironmentId=(typeof CREATIVE_SEA_ENVIRONMENTS)[number]['id'];
export const CreativeSeaEnvironmentIdSchema=z.enum(CREATIVE_SEA_ENVIRONMENTS.map(e=>e.id) as [EnvironmentId,...EnvironmentId[]]);
