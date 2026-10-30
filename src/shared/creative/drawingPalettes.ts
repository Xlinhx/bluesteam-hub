export interface NamedSwatch {id:string;nameVi:string;hex:string}
const basic=['#1E7E48','#1A1A1A','#7F8C8D','#4DABF7','#E74C3C','#F67650','#F1C40F','#82C91E','#008F71','#2EE6CA','#1C7ED6','#7950F2','#8D5524','#FFFFFF'];
const names=['Xanh lá đậm','Đen','Xám','Xanh trời','Đỏ','San hô','Vàng','Xanh lá non','Xanh lục','Ngọc lam','Xanh biển','Tím','Nâu','Trắng'];
export const BASIC_SWATCHES:NamedSwatch[]=basic.map((hex,i)=>({id:`basic-${i}`,nameVi:names[i],hex}));
const boards=[['Biển',['#18a6b0','#287fbc','#78b954','#126284','#16896d','#446f89']],['Ấm',['#a52d34','#e74c3c','#f67650','#e67e22','#e5af32','#8d5524']],['Dịu',['#7d8eb9','#b09ac3','#d9a6b2','#9abeac','#92bdce','#d8b993']],['Trung tính',['#202d35','#647480','#898f8a','#a99076','#c7b99e','#e0d8c7']]] as const;
export const PALETTE_THEMES=boards.map(([name,bases])=>({name,colors:[.46,.23,0,.12].flatMap((mix,j)=>bases.map((base,i)=>({id:`${name}-${i}-${j}`,nameVi:`${name} · ${i+1}, sắc ${j+1}`,hex:'#'+[1,3,5].map(p=>Math.round(parseInt(base.slice(p,p+2),16)*(1-mix)+255*mix).toString(16).padStart(2,'0')).join('')})))}));
// Arrange the sea board by hue rows, like paint wells, rather than mixing hues in every row.
PALETTE_THEMES[0].colors = [
 ['#b7edf0','Xanh bọt biển'],['#ace7de','Ngọc nhạt'],['#64d1c9','Ngọc sáng'],['#29b6c0','Xanh đầm phá'],['#158e9c','Xanh biển ngọc'],['#0bc4b6','Ngọc lam sáng'],
 ['#4dabf7','Xanh trời sáng'],['#82bee7','Xanh trời dịu'],['#94c7d9','Xanh sương'],['#4c9bc0','Xanh nước'],['#0c507c','Xanh biển sâu'],['#1c6586','Xanh vịnh'],
 ['#8bc764','Xanh lá sáng'],['#81b95d','Xanh cỏ biển'],['#91a654','Xanh rêu sáng'],['#537448','Xanh rêu'],['#18966d','Xanh ngọc lục'],['#006960','Xanh tảo'],
 ['#075194','Xanh đại dương'],['#1096af','Xanh san hô'],['#087c9a','Xanh thủy triều'],['#0768a3','Xanh sóng'],['#5c88a0','Xanh đá'],['#52788e','Xanh xám biển'],
].map(([hex,nameVi],i)=>({id:`Biển-${i}`,nameVi,hex}));
export function rememberColor(previous:string[],hex:string){return [hex.toLowerCase(),...previous.map(c=>c.toLowerCase()).filter(c=>c!==hex.toLowerCase())].slice(0,6);}
