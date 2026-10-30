/** Edge-connected paper only: enclosed whites are never treated as background. */
export function removePaperBackground(source:Uint8ClampedArray,width:number,height:number){
 if(source.length!==width*height*4||width<1||height<1)throw Error('Ảnh không hợp lệ.');
 const out=new Uint8ClampedArray(source),seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
 const visit=(p:number)=>{if(p<0||p>=seen.length||seen[p])return;seen[p]=1;const i=p*4;const lo=Math.min(source[i],source[i+1],source[i+2]),hi=Math.max(source[i],source[i+1],source[i+2]);if(lo<205||hi-lo>38)return;queue[tail++]=p;};
 for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1);}
 while(head<tail){const p=queue[head++];out[p*4+3]=0;if(p%width)visit(p-1);if(p%width<width-1)visit(p+1);visit(p-width);visit(p+width);}return out;
}
export function validateScanFile(file:{type:string;size:number}){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Chọn ảnh JPG, PNG hoặc WebP.');if(file.size>10*1024*1024)throw Error('Ảnh cần nhỏ hơn 10 MB.');}
