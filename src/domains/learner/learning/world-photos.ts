type CardPhoto = { file: string; author?: string; license: string; depicts?: string; cropped?: boolean } &
  ({ sourceFile: string; observation?: never } | { observation: number; sourceFile?: never });

const cardPhotos: Record<string, CardPhoto> = {
  'dunes-6': { file: 'habitat-phi-lao', author: 'Dinesh Valke', sourceFile: 'Casuarina equisetifolia 257711535.jpg', license: 'by-sa/4.0', depicts: 'Phi lao (Casuarina equisetifolia)', cropped: true },
  'middle-20': { file: 'habitat-ca-den', author: 'NOAA / SEFSC', sourceFile: 'Fish4339 - Flickr - NOAA Photo Library.jpg', license: 'by/2.0', depicts: 'Mẫu cá đèn Myctophum obtusirostre', cropped: true },
  'dunes-2': { file: 'habitat-muong-bien', author: 'jjfeiler', observation: 413490323, license: 'by/4.0', depicts: 'Muống biển (Ipomoea pes-caprae)', cropped: true },
  'dunes-3': { file: 'habitat-co-long-chong', observation: 410723774, license: 'zero/1.0', depicts: 'Cỏ lông chông (Spinifex littoreus)', cropped: true },
  'dunes-4': { file: 'habitat-rau-sam', author: 'Hazel Chang', observation: 414335490, license: 'by/4.0', depicts: 'Rau sam biển (Sesuvium portulacastrum)', cropped: true },
  'dunes-7': { file: 'habitat-co-gau', observation: 376182351, license: 'zero/1.0', depicts: 'Cỏ gấu biển (Cyperus pedunculatus)', cropped: true },
  'shore-11': { file: 'habitat-oc-bien', author: 'Liem Malarney', observation: 377807877, license: 'by/4.0', depicts: 'Một loài ốc biển (Nerita undata)', cropped: true },
  'nearshore-11': { file: 'habitat-ca-chim', author: 'Wensen Wang', observation: 377997712, license: 'by-sa/4.0', depicts: 'Mẫu cá chim trắng (Pampus argenteus)', cropped: true },
  'shore-4': { file: 'oysters', author: 'Jud McCranie', sourceFile: 'Oysters on piling.jpg', license: 'by-sa/4.0', cropped: true },
  'shore-5': { file: 'mussel', author: 'Sannidhishetty', sourceFile: 'Asian green mussel (Perna viridis).jpg', license: 'zero/1.0', depicts: 'Vẹm xanh (Perna viridis)', cropped: true },
  'shore-7': { file: 'cockle', author: 'H. Zell', sourceFile: 'Tegillarca granosa 01.jpg', license: 'by-sa/3.0', cropped: true },
  'upper-16': { file: 'reef-crab', author: 'Daniel Eisenhauer', sourceFile: 'Zosimus aeneus 575350742.jpg', license: 'by/4.0', depicts: 'Zosimus aeneus' },
  'upper-26': { file: 'boxfish', author: 'Derek Keats', sourceFile: 'Yellow boxfish, Ostracion cubicus - side view - at Shelenyat Reef, Red Sea, Egypt -SCUBA -UNDERWATER -PICTURES (6487876165).jpg', license: 'by/2.0', depicts: 'Cá nóc hòm vàng (Ostracion cubicus)' },
  'upper-75': { file: 'sun-anemone', author: 'Tam Warner Minton', sourceFile: 'Stichodactyla helianthus, Cozumel.jpg', license: 'by-sa/2.0' },
  'shore-10': { file: 'white-clams', author: 'Takeaway', sourceFile: 'Meretrix lyrata Saigon.JPG', license: 'by-sa/3.0', depicts: 'Nghêu trắng (Meretrix lyrata)' },
  'shore-15': { file: 'turban-shell', author: 'Nikkimaria', sourceFile: 'Turbo marmoratus.jpg', license: 'by-sa/3.0', depicts: 'Vỏ ốc xà cừ (Turbo marmoratus)' },
  'shore-25': { file: 'longspine-urchin', author: 'Eric Knight', sourceFile: 'Diadema setosum 440761803.jpg', license: 'by/4.0', depicts: 'Diadema setosum' },
  'shore-34': { file: 'sandhopper', author: 'Arnold Paul, Waugsberg và Buchling', sourceFile: 'Talitrus saltator 2c.jpg', license: 'by-sa/2.0/de', depicts: 'Bọ nhảy bãi biển (Talitrus saltator)' },
  'shore-47': { file: 'sea-lettuce', author: 'W.carter', sourceFile: 'Sea lettuce in Brofjorden 1 - cropped.jpg', license: 'zero/1.0', depicts: 'Rong diếp biển (Ulva lactuca)' },
  'shore-48': { file: 'filamentous-algae', author: 'Olivier Dugornay / Ifremer', sourceFile: 'Algue verte (Cladophora) (Ifremer 00656-76791).jpg', license: 'by/4.0', depicts: 'Ảnh hiển vi tảo sợi thuộc chi Cladophora' },
  'deep-3': { file: 'spiny-lobster', author: 'Christoph Moning', sourceFile: 'Panulirus homarus 59908027.jpg', license: 'by/4.0', depicts: 'Panulirus homarus' },
  'upper-76': { file: 'longspine-urchin', author: 'Eric Knight', sourceFile: 'Diadema setosum 440761803.jpg', license: 'by/4.0', depicts: 'Nhum đen (Diadema setosum)' },
};

export const habitatIllustrations: Record<string, { url: string; caption: string }> = {
  'dunes-19': { url: '/assets/learner-worlds/learning/habitat-sand-sample.webp', caption: 'Minh họa giun tròn dưới kính hiển vi' },
};

// These first source pictures were verified as unrelated or unsuitable for the on-map card.
export const habitatSourcePhotoChoices: Record<string, number | null> = {
  'middle-8': null,
  'upper-28': 1,
  'shore-35': null,
};

export function learningCardPhoto(id: string) {
  const photo = cardPhotos[id];
  if (!photo) return;
  const cc0 = photo.license === 'zero/1.0';
  return {
    ...photo,
    url: `/assets/learner-worlds/learning/${photo.file}.webp`,
    source: photo.observation ? `https://www.inaturalist.org/observations/${photo.observation}`
      : `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photo.sourceFile!.replaceAll(' ', '_'))}`,
    licenseUrl: `https://creativecommons.org/${cc0 ? 'publicdomain' : 'licenses'}/${photo.license}/`,
    licenseName: cc0 ? 'CC0 1.0' : 'CC ' + photo.license.toUpperCase().replaceAll('/', ' '),
  };
}
