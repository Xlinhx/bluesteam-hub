export function catalogPage<T extends {id:string;nameVi:string;category?:string}>(items:T[],query:{q?:string;category?:string;page:number;limit:number}){
 const q=(query.q||'').trim().toLocaleLowerCase('vi');const filtered=items.filter(a=>(!query.category||a.category===query.category)&&(!q||a.nameVi.toLocaleLowerCase('vi').includes(q)));
 const page=Math.max(1,Math.min(query.page,Math.ceil(filtered.length/query.limit)||1));return {items:filtered.slice((page-1)*query.limit,page*query.limit),total:filtered.length,page,pages:Math.ceil(filtered.length/query.limit)||1};
}
