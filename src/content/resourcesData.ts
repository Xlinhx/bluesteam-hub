export type ResourceType = 'flashcard' | 'video' | 'coloring' | 'worksheet';
export type OceanTopic = 'coastal' | 'reef' | 'seagrass' | 'openOcean' | 'abyss';

export interface FlashcardTrait {
  scientificName: string;
  depthVi: string;
  depthEn: string;
  dietVi: string;
  dietEn: string;
  statusVi: string;
  statusEn: string;
  funFactVi: string;
  funFactEn: string;
  pronunciationAudioTextVi: string;
  pronunciationAudioTextEn: string;
}

export interface VideoChapter {
  timeSeconds: number;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
}

export interface PrintableContent {
  printableType: 'coloring' | 'worksheet';
  difficulty: 'easy' | 'medium';
  instructionsVi: string;
  instructionsEn: string;
  svgTemplate: 'turtle' | 'clownfish' | 'depth-match' | 'current-maze';
}

export interface ResourceItem {
  id: string;
  type: ResourceType;
  topic: OceanTopic;
  titleVi: string;
  titleEn: string;
  summaryVi: string;
  summaryEn: string;
  durationMinutes: number;
  accentColor: string;
  thumbnailImage?: string;
  flashcardData?: FlashcardTrait;
  videoData?: {
    chapters: VideoChapter[];
    archiveSource: string;
  };
  printableData?: PrintableContent;
}

export const OCEAN_RESOURCES: ResourceItem[] = [
  // 1. Flashcards
  {
    id: 'flashcard-green-turtle',
    type: 'flashcard',
    topic: 'seagrass',
    titleVi: 'Rùa Xanh (Vích Biển)',
    titleEn: 'Green Sea Turtle',
    summaryVi: 'Loài rùa biển to lớn ăn cỏ biển và bơi lội qua ngàn dặm đại dương.',
    summaryEn: 'Large herbivorous sea turtle grazing on seagrass and migrating vast ocean basins.',
    durationMinutes: 3,
    accentColor: '#17657A',
    thumbnailImage: '/assets/bluesteam/bs-specimen-turtle-v01.jpg',
    flashcardData: {
      scientificName: 'Chelonia mydas',
      depthVi: 'Tầng mặt đầy nắng (0 - 50m)',
      depthEn: 'Sunlit Surface Layer (0 - 50m)',
      dietVi: 'Cỏ biển, rong biển tươi & tảo lục',
      dietEn: 'Seagrass, marine algae & kelp',
      statusVi: 'Nguy cấp (Cần bảo vệ nghiêm ngặt)',
      statusEn: 'Endangered (Protected Species)',
      funFactVi: 'Rùa xanh có thể nín thở dưới nước tới hơn 4 tiếng khi nghỉ ngơi!',
      funFactEn: 'Green sea turtles can hold their breath underwater for up to 4 hours while resting!',
      pronunciationAudioTextVi: 'Rùa Xanh. Tên khoa học là Che-lo-ni-a my-das.',
      pronunciationAudioTextEn: 'Green Sea Turtle. Scientific name Chelonia mydas.',
    },
  },
  {
    id: 'flashcard-clownfish',
    type: 'flashcard',
    topic: 'reef',
    titleVi: 'Cá Hề Cam',
    titleEn: 'Ocellaris Clownfish',
    summaryVi: 'Chú cá nhỏ xinh sống hòa thuận cùng hải quỳ có nọc độc.',
    summaryEn: 'Vibrant orange reef dweller living in safe symbiosis with sea anemones.',
    durationMinutes: 2,
    accentColor: '#F67650',
    thumbnailImage: '/assets/bluesteam/bs-specimen-clownfish-v01.jpg',
    flashcardData: {
      scientificName: 'Amphiprion ocellaris',
      depthVi: 'Rạn san hô nước cạn (1 - 15m)',
      depthEn: 'Shallow Coral Reef (1 - 15m)',
      dietVi: 'Tảo nhỏ, ấu trùng giáp xác & thức ăn thừa của hải quỳ',
      dietEn: 'Small algae, copepods & anemone leftovers',
      statusVi: 'Ít quan tâm (Bảo vệ rạn san hô sống)',
      statusEn: 'Least Concern (Preserve reef habitats)',
      funFactVi: 'Lớp chất nhờn đặc biệt trên da giúp cá hề không bao giờ bị xúc tu hải quỳ chích!',
      funFactEn: 'A special mucus layer protects the clownfish from venomous anemone stings!',
      pronunciationAudioTextVi: 'Cá Hề Cam. Sống cộng sinh cùng hải quỳ.',
      pronunciationAudioTextEn: 'Ocellaris Clownfish. Lives in harmony with sea anemones.',
    },
  },
  {
    id: 'flashcard-lanternfish',
    type: 'flashcard',
    topic: 'openOcean',
    titleVi: 'Cá Lồng Đèn Ánh Kim',
    titleEn: 'Lanternfish',
    summaryVi: 'Loài cá phát sáng lung linh ở tầng nước chạng vạng để ngụy trang.',
    summaryEn: 'Bioluminescent fish of the twilight zone using light organs for counter-illumination.',
    durationMinutes: 3,
    accentColor: '#38BDF8',
    thumbnailImage: '/assets/bluesteam/bs-specimen-lanternfish-v01.jpg',
    flashcardData: {
      scientificName: 'Myctophidae',
      depthVi: 'Tầng chạng vạng hoàng hôn (200 - 1,000m)',
      depthEn: 'Twilight Mesopelagic (200 - 1,000m)',
      dietVi: 'Sinh vật phù du & giáp xác nhỏ',
      dietEn: 'Zooplankton & krill',
      statusVi: 'Ổn định (Chiếm số lượng lớn nhất sinh khối biển)',
      statusEn: 'Stable (Dominant ocean biomass)',
      funFactVi: 'Hàng đêm, hàng tỷ cá lồng đèn bơi lên mặt nước kiếm ăn tạo nên cuộc di cư lớn nhất hành tinh!',
      funFactEn: 'Every night, billions of lanternfish migrate upwards to feed, forming the largest vertical migration on Earth!',
      pronunciationAudioTextVi: 'Cá Lồng Đèn. Phát ánh sáng màu xanh ngọc ở bụng.',
      pronunciationAudioTextEn: 'Lanternfish. Emits blue photophore light on its belly.',
    },
  },
  {
    id: 'flashcard-anglerfish',
    type: 'flashcard',
    topic: 'abyss',
    titleVi: 'Cá Vây Chân Đáy Vực',
    titleEn: 'Deep Sea Anglerfish',
    summaryVi: 'Chiếc cần câu phát sáng thu hút con mồi trong bóng tối vĩnh cửu.',
    summaryEn: 'Iconic deep-sea predator carrying a bioluminescent dorsal lure in pitch darkness.',
    durationMinutes: 4,
    accentColor: '#1E293B',
    thumbnailImage: '/assets/bluesteam/bs-habitat-abyss-bg-v01.jpg',
    flashcardData: {
      scientificName: 'Melanocetus johnsonii',
      depthVi: 'Tầng nửa đêm & vực thẳm (1,000 - 3,000m)',
      depthEn: 'Midnight Bathypelagic (1,000 - 3,000m)',
      dietVi: 'Cá nhỏ và mực trôi qua cần câu',
      dietEn: 'Small fishes & deep squid attracted to lure',
      statusVi: 'Bí ẩn và hoang sơ',
      statusEn: 'Wild and largely pristine',
      funFactVi: 'Ánh sáng trên cần câu cá không phải do cá tự tạo, mà do vi khuẩn phát quang cộng sinh sinh sống trong đó!',
      funFactEn: 'The lure glow is produced by millions of symbiotic bioluminescent bacteria living inside the esca!',
      pronunciationAudioTextVi: 'Cá Vây Chân Đáy Vực. Sở hữu cần câu phát quang.',
      pronunciationAudioTextEn: 'Deep Sea Anglerfish. Uses a glowing light lure in the dark.',
    },
  },
  {
    id: 'flashcard-blue-whale',
    type: 'flashcard',
    topic: 'openOcean',
    titleVi: 'Cá Voi Xanh Khổng Lồ',
    titleEn: 'Mighty Blue Whale',
    summaryVi: 'Động vật lớn nhất từng sinh sống trên Trái Đất, bơi lội hiền hòa.',
    summaryEn: 'The largest animal known to have ever existed, swimming peacefully across ocean basins.',
    durationMinutes: 4,
    accentColor: '#0E7490',
    thumbnailImage: '/assets/bluesteam/bs-specimen-whale-v01.jpg',
    flashcardData: {
      scientificName: 'Balaenoptera musculus',
      depthVi: 'Biển khơi từ mặt nước đến 500m',
      depthEn: 'Pelagic open ocean from surface down to 500m',
      dietVi: 'Nhuyễn thể (con ruốc biển nhỏ li ti)',
      dietEn: 'Tiny krill filtered through baleen plates',
      statusVi: 'Nguy cấp (Cần bảo vệ môi trường âm thanh biển)',
      statusEn: 'Endangered (Marine acoustic protection needed)',
      funFactVi: 'Trái tim của cá voi xanh to bằng một chiếc ô tô nhỏ và đập chỉ 4 đến 8 nhịp một phút khi lặn sâu!',
      funFactEn: 'A blue whale heart is the size of a small car and beats just 4 to 8 times per minute while diving!',
      pronunciationAudioTextVi: 'Cá Voi Xanh. Động vật khổng lồ hiền lành của đại dương.',
      pronunciationAudioTextEn: 'Blue Whale. The gentle giant of our planet oceans.',
    },
  },

  // 2. Video Lessons
  {
    id: 'video-ocean-descent',
    type: 'video',
    topic: 'abyss',
    titleVi: 'Thước Phim: Cuộc Lặn Sâu Xuống Tầng Hoàng Hôn',
    titleEn: 'Video Lesson: Descent into the Twilight Ocean',
    summaryVi: 'Hành trình cùng tàu lặn nghiên cứu khám phá ánh sáng tắt dần theo độ sâu.',
    summaryEn: 'Explore how sunlight dims and deep-sea creatures adapt as a research submarine dives down.',
    durationMinutes: 5,
    accentColor: '#17657A',
    thumbnailImage: '/assets/bluesteam/bs-atlas-vertical-bg-v01.jpg',
    videoData: {
      archiveSource: 'Woods Hole Oceanographic Institution Scientific Archives',
      chapters: [
        {
          timeSeconds: 0,
          titleVi: 'Tầng Mặt Trời (0 - 200m)',
          titleEn: 'Sunlit Epipelagic (0 - 200m)',
          descVi: 'Nắng vàng ấm áp, thảm thực vật quang hợp và rạn san hô tràn đầy sự sống.',
          descEn: 'Warm sunlight powers photosynthesis, supporting coral reefs and seagrass beds.',
        },
        {
          timeSeconds: 45,
          titleVi: 'Tầng Hoàng Hôn (200 - 1,000m)',
          titleEn: 'Twilight Mesopelagic (200 - 1,000m)',
          descVi: 'Ánh sáng xanh lam le lói, nhiệt độ giảm mạnh, các loài cá bắt đầu phát sáng.',
          descEn: 'Dim blue light lingers, temperatures drop, and creatures display bioluminescence.',
        },
        {
          timeSeconds: 120,
          titleVi: 'Tầng Nửa Đêm (1,000m trở xuống)',
          titleEn: 'Midnight Bathypelagic (1,000m+)',
          descVi: 'Bóng tối hoàn toàn, áp suất khổng lồ, thế giới của sinh vật kỳ bí.',
          descEn: 'Total perpetual darkness, immense pressure, and remarkable physiological adaptations.',
        },
      ],
    },
  },
  {
    id: 'video-bioluminescence',
    type: 'video',
    topic: 'abyss',
    titleVi: 'Thước Phim: Ánh Sáng Kỳ Diệu Của Đại Dương',
    titleEn: 'Video Lesson: Living Lights of the Deep Sea',
    summaryVi: 'Tìm hiểu cách sinh vật biển tự tạo ra ánh sáng để săn mồi và bảo vệ bản thân.',
    summaryEn: 'Discover the chemistry behind oceanic bioluminescence and how marine life uses light signals.',
    durationMinutes: 4,
    accentColor: '#2EE6CA',
    videoData: {
      archiveSource: 'NOAA Deep Ocean Exploration Video Registry',
      chapters: [
        {
          timeSeconds: 0,
          titleVi: 'Ánh Sáng Hóa Học Là Gì?',
          titleEn: 'What is Bioluminescence?',
          descVi: 'Phản ứng giữa phân tử luciferin và oxy tạo nên luồng sáng mát lạnh.',
          descEn: 'Chemical reaction between luciferin and oxygen yielding cold radiant glow.',
        },
        {
          timeSeconds: 60,
          titleVi: 'Tín Hiệu Cầu Cứu & Báo Động',
          titleEn: 'Defense and Alarm Displays',
          descVi: 'Sứa biển nhấp nháy ánh sáng pháo hoa để xua đuổi kẻ thù.',
          descEn: 'Deep-sea jellies flash bright patterns to startle predators.',
        },
      ],
    },
  },

  // 3. Coloring Sheets
  {
    id: 'print-coloring-turtle',
    type: 'coloring',
    topic: 'seagrass',
    titleVi: 'Tranh Tô Màu: Rùa Biển Bên Thảm Cỏ Xanh',
    titleEn: 'Coloring Sheet: Sea Turtle in Seagrass',
    summaryVi: 'Bản in A4 đường nét rõ ràng để bé tập tô màu rùa xanh và bọt sóng.',
    summaryEn: 'Crisp A4 coloring page for young learners to color green sea turtle and reef details.',
    durationMinutes: 15,
    accentColor: '#2EE6CA',
    printableData: {
      printableType: 'coloring',
      difficulty: 'easy',
      instructionsVi: 'Bé hãy dùng màu xanh lá cho rùa và cỏ biển, màu xanh lam cho nước biển trong vắt nhé!',
      instructionsEn: 'Use emerald green for the turtle and sea grass, and soft blues for the ocean waters!',
      svgTemplate: 'turtle',
    },
  },
  {
    id: 'print-coloring-clownfish',
    type: 'coloring',
    topic: 'reef',
    titleVi: 'Tranh Tô Màu: Cá Hề & Rạn San Hô Hoa',
    titleEn: 'Coloring Sheet: Clownfish & Anemone Garden',
    summaryVi: 'Bản in A4 giúp bé luyện khéo tay với những cánh hải quỳ mềm mại.',
    summaryEn: 'Crisp A4 coloring page featuring clownfish exploring sea anemone tentacles.',
    durationMinutes: 15,
    accentColor: '#F67650',
    printableData: {
      printableType: 'coloring',
      difficulty: 'easy',
      instructionsVi: 'Bé hãy tô thân cá hề màu cam ấm áp cùng 3 dải sọc trắng đáng yêu.',
      instructionsEn: 'Color the clownfish bright orange with three distinctive white bands.',
      svgTemplate: 'clownfish',
    },
  },

  // 4. Worksheets
  {
    id: 'print-worksheet-depth-matching',
    type: 'worksheet',
    topic: 'openOcean',
    titleVi: 'Bài Tập Nối Hình: Ai Ở Tầng Nước Nào?',
    titleEn: 'Worksheet: Match Creatures to Ocean Depths',
    summaryVi: 'Bản in bài tập giúp bé nối sinh vật biển với độ sâu sinh sống tương ứng.',
    summaryEn: 'Hands-on matching worksheet connecting marine animals to their vertical depth zones.',
    durationMinutes: 10,
    accentColor: '#17657A',
    printableData: {
      printableType: 'worksheet',
      difficulty: 'medium',
      instructionsVi: 'Bé hãy dùng bút chì vẽ đường nối mỗi chú cá về đúng tầng nước mà bạn ấy yêu thích.',
      instructionsEn: 'Draw a pencil line connecting each sea creature to its correct oceanic depth layer.',
      svgTemplate: 'depth-match',
    },
  },
  {
    id: 'print-worksheet-current-maze',
    type: 'worksheet',
    topic: 'coastal',
    titleVi: 'Bài Tập Mê Cung: Dòng Hải Lưu Đưa Rùa Về Nhà',
    titleEn: 'Worksheet: Ocean Current Maze to the Reef',
    summaryVi: 'Mê cung vui nhộn rèn luyện kỹ năng định hướng và quan sát dòng nước.',
    summaryEn: 'Fun developmental maze guiding a young turtle through ocean currents to safety.',
    durationMinutes: 10,
    accentColor: '#12384B',
    printableData: {
      printableType: 'worksheet',
      difficulty: 'medium',
      instructionsVi: 'Bé hãy tìm con đường có dòng nước êm đềm nhất để giúp rùa nhỏ tránh các chướng ngại vật rác thải nhé.',
      instructionsEn: 'Guide the baby turtle along the cleanest ocean current to reach the safe reef nursery.',
      svgTemplate: 'current-maze',
    },
  },
];
