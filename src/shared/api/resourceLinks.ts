import type { ResourceVariantLink } from './catalog';

/** Promote only within the format: the first link of each format opens first. */
export function preferLinkedChoice(variants: ResourceVariantLink[], id: string): ResourceVariantLink[] {
  const choice=variants.find(v=>v.id===id);
  if(!choice)return variants;
  const family=(kind:string)=>kind==='image'?'flashcard':kind;
  const positions=variants.flatMap((v,index)=>family(v.kind)===family(choice.kind)?[index]:[]);
  const reordered=[choice,...positions.map(i=>variants[i]).filter(v=>v.id!==id)];
  const next=[...variants];
  positions.forEach((position,index)=>{next[position]=reordered[index];});
  return next;
}

/** The teacher's link order is the display order; titles never imply a link. */
export function getLinkedChoices(variants: ResourceVariantLink[] | undefined, kind: string): ResourceVariantLink[] {
  const seen = new Set<string>();
  return (variants || []).filter(item => {
    const visual = ['image','flashcard','visual'].includes(kind) && ['image','flashcard'].includes(item.kind);
    if ((!visual && item.kind !== kind) || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
