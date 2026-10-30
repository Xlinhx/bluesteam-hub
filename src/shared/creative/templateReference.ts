/** Preserve historical resource source keys using the seed importer's identity algorithm. */
export async function resolveTemplateReference(reference:string):Promise<string>{
  // Older resources used the species name; the preserved seed template is ocean-friend.
  if(reference==='template:drawing-turtle')reference='template:drawing-ocean-friend';
  if(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(reference))return reference;
  if(!/^template:[a-z\d-]+$/i.test(reference))throw Error('Không tìm thấy mẫu tranh này. Chọn lại tranh từ Học liệu.');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`bluesteam-r2-seed:${reference}`));
  const h=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-${((parseInt(h[16],16)&3)|8).toString(16)}${h.slice(17,20)}-${h.slice(20,32)}`;
}
