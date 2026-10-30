/** Current library imagery/content, kept separate from the historical archive. */
export function withResourceDesignSeed(source: any): any {
  const data = structuredClone(source);
  const entries = [
    {key:'anemone-flashcard',title:'Hải quỳ',image:'anemone-card.jpg',topic:'species',description:'Nhìn những xúc tu mềm mại của hải quỳ.',narration:'Hải quỳ là một loài động vật sống dưới biển. Những xúc tu quanh miệng giúp hải quỳ bắt thức ăn. Bé hãy quan sát từ xa, không chạm vào hải quỳ nhé.'},
    {key:'butterflyfish-flashcard',title:'Cá bướm',image:'butterflyfish-card.jpg',topic:'species',description:'Cá bướm có thân dẹt và những vệt màu nổi bật.',narration:'Cá bướm bơi giữa rạn san hô. Bé nhìn xem, trên thân cá có những đường sọc và mảng màu nào? Chúng mình cùng giữ nước biển sạch để các bạn cá có nơi sống nhé.'},
    {key:'sea-snail-flashcard',title:'Ốc biển',image:'sea-snail-shell-card.jpg',topic:'species',description:'Quan sát hình xoắn trên chiếc vỏ ốc biển.',narration:'Ảnh này cho bé xem một chiếc vỏ ốc biển. Nhiều loài ốc biển có vỏ cứng giúp bảo vệ cơ thể mềm. Khi gặp ốc ở biển, bé hãy quan sát và để bạn ở lại ngôi nhà của mình nhé.'},
    {key:'plastic-litter-flashcard',title:'Rác nhựa',image:'plastic-litter-card.jpg',topic:'conservation',description:'Chai nhựa cần được bỏ đúng nơi quy định.',narration:'Một chiếc chai bị bỏ lại trên cát có thể bị sóng cuốn ra biển. Bé cùng người lớn bỏ rác đúng chỗ và phân loại theo hướng dẫn nhé.'},
    {key:'reusable-bag-flashcard',title:'Túi vải',image:'reusable-bag-card.jpg',topic:'conservation',description:'Một chiếc túi có thể dùng nhiều lần.',narration:'Túi vải có thể được dùng nhiều lần. Khi đi mua đồ cùng người lớn, bé có thể nhắc mang theo túi sẵn có và giữ túi sạch để dùng tiếp.'},
    {key:'beach-cleanup-flashcard',title:'Nhặt rác',image:'beach-cleanup-card.jpg',topic:'conservation',description:'Giữ bờ biển sạch cùng người lớn.',narration:'Khi dọn rác ở bãi biển, bé luôn đi cùng người lớn và làm theo hướng dẫn. Không nhặt vật sắc, vật lạ hoặc rác nguy hiểm. Chúng mình cùng giữ bãi cát sạch nhé.'},
  ];
  const resources = data.reusableContent.resources;
  const closeups: Record<string,string> = {
    'resource:crab-flashcard':'/assets/generated/resources/shore-crab-photo.jpg',
    'resource:crab-image':'/assets/generated/resources/shore-crab-photo.jpg',
    'resource:clownfish-flashcard':'/assets/ocean/specimen-clownfish.jpg',
    'resource:seashell-flashcard':'/assets/generated/resources/shells_beach_card.jpg',
  };
  for (const item of resources) {
    if (closeups[item.sourceKey]) {
      item.mediaUrl = item.coverUrl = closeups[item.sourceKey];
      if (item.content?.albumImages) item.content.albumImages = [item.mediaUrl];
      if (item.content?.albumUrls) item.content.albumUrls = [item.mediaUrl];
    }
    if (item.kind === 'video' || item.kind === 'audio') {
      const extension = item.kind === 'video' ? /\.(mp4|webm|mov)(?:[?#]|$)/i : /\.(mp3|wav|ogg|m4a|aac|webm)(?:[?#]|$)/i;
      if (!item.mediaUrl || !extension.test(item.mediaUrl)) {
        item.visibility = 'hidden';
        item.mediaUrl = null;
      }
    }
  }
  for (const entry of entries) {
    const path = `/assets/generated/resources/${entry.image}`;
    const sourceKey = `resource:${entry.key}`;
    if (!resources.some((item: any) => item.sourceKey === sourceKey)) resources.push({sourceKey,title:entry.title,kind:'flashcard',description:entry.description,coverUrl:path,mediaUrl:path,visibility:'published',topicSlugs:[entry.topic],content:{narrationText:entry.narration}});
  }
  return data;
}
