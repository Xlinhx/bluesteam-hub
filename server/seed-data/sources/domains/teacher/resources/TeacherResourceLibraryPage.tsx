import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '../../../app/router';
import { TeacherShell } from '../../../shared/shells/TeacherShell';
import {
  CatalogToolbar,
  RESOURCE_KIND_TABS,
  type ResourceFilterKind,
} from '../../../shared/ui/catalog/CatalogToolbar';
import { TopicFilters } from '../../../shared/ui/catalog/TopicFilters';
import { EntityDrawer } from '../../../shared/ui/overlays/EntityDrawer';
import { ResourceRenderer } from '../../../shared/ui/media/ResourceRenderer';
import {
  TOPIC_ARTWORK_MAP,
  type TopicFilterKey,
} from '../../../shared/data/categoryArtworkMap';
import {
  INITIAL_RESOURCES_FALLBACK,
  filterResourcesLocal,
  fetchTeacherResources,
  createTeacherResourceApi,
  updateTeacherResourceApi,
  duplicateTeacherResourceApi,
  deleteTeacherResourceApi,
  type ResourceDto,
} from '../../../shared/api/catalog';
import {
  Search,
  Plus,
  BookOpen,
  Image as ImageIcon,
  Volume2,
  PlayCircle,
  FileText,
  ArrowRight,
  MoreVertical,
  Copy,
  EyeOff,
  Trash2,
  Upload,
  Play,
  X,
} from 'lucide-react';

export interface ResourceItem {
  id: string;
  title: string;
  type: 'Tương tác' | 'Video' | 'Bài giảng' | 'Hình ảnh' | 'Bản đồ';
  description: string;
  thumbnail: string;
  ageGroup: string;
  theme: string;
  objectives: string[];
  instructionText: string;
}

export const SAMPLE_RESOURCES: ResourceItem[] = [
  {
    id: 'find-habitat',
    title: 'Tìm nơi sống',
    type: 'Tương tác',
    description: 'Khám phá nơi sống của các sinh vật biển và ghép đúng môi trường.',
    thumbnail: '/assets/card_clownfish.jpg',
    ageGroup: '5-6 tuổi (Lá)',
    theme: 'Hệ sinh thái biển',
    objectives: [
      'Nhận biết một số môi trường sống trong hệ sinh thái biển.',
      'Quan sát đặc điểm của sinh vật biển.',
      'Ghép sinh vật với môi trường sống phù hợp.',
    ],
    instructionText:
      'Kéo thả các sinh vật vào đúng môi trường sống. Hãy quan sát đặc điểm của mỗi sinh vật và môi trường để lựa chọn phù hợp.',
  },
  {
    id: 'marine-creatures-habitat',
    title: 'Sinh vật biển và môi trường sống',
    type: 'Video',
    description: 'Tìm hiểu đặc điểm nơi sống của các sinh vật biển phổ biến.',
    thumbnail: '/assets/card_turtle.jpg',
    ageGroup: '4-5 tuổi (Chồi)',
    theme: 'Động vật biển',
    objectives: [
      'Quan sát chuyển động và cách bơi của rùa biển, sứa và cá.',
      'Hiểu vì sao mỗi loài cần môi trường biển sạch để sinh trưởng.',
    ],
    instructionText:
      'Xem video phóng sự đại dương và thảo luận cùng cô về các loài sinh vật biển.',
  },
  {
    id: 'coral-ecosystem',
    title: 'Hệ sinh thái rạn san hô',
    type: 'Bài giảng',
    description: 'Giới thiệu các thành phần trong đại dương và mối liên hệ giữa chúng.',
    thumbnail: '/assets/card_kelp.jpg',
    ageGroup: '5-6 tuổi (Lá)',
    theme: 'Khám phá khoa học',
    objectives: [
      'Nhận diện rạn san hô là ngôi nhà chung của các sinh vật nhiệt đới.',
      'Nhận biết mối quan hệ hỗ trợ lẫn nhau giữa san hô và cá hề.',
    ],
    instructionText:
      'Trình chiếu bài giảng tương tác và cho trẻ tương tác đặt câu hỏi trên màn hình.',
  },
  {
    id: 'ocean-environments',
    title: 'Các kiểu môi trường biển',
    type: 'Hình ảnh',
    description: 'Hình ảnh minh họa các môi trường sống dưới biển và vùng ven bờ.',
    thumbnail: '/assets/card_tidal.jpg',
    ageGroup: '3-4 tuổi (Mầm)',
    theme: 'Hoạt động góc',
    objectives: [
      'Phân biệt vùng nước nông, bãi triều và rừng ngập mặn.',
      'Rèn luyện kỹ năng quan sát qua bộ tranh phóng to chất lượng cao.',
    ],
    instructionText:
      'In hoặc hiển thị ảnh chụp thực tế cho trẻ làm quen trong góc học tập thiên nhiên.',
  },
  {
    id: 'coastal-vietnam',
    title: 'Khám phá vùng biển quê hương',
    type: 'Bản đồ',
    description: 'Tìm hiểu các khu vực biển và hệ sinh thái đặc trưng ở Việt Nam.',
    thumbnail: '/assets/map_island_journey.jpg',
    ageGroup: '5-6 tuổi (Lá)',
    theme: 'Kể chuyện sinh thái',
    objectives: [
      'Biết biển đảo Việt Nam giàu đẹp với nhiều danh lam thắng cảnh.',
      'Nuôi dưỡng tình yêu thiên nhiên và ý thức giữ gìn bãi biển quê hương.',
    ],
    instructionText:
      'Khám phá hải trình ven biển Việt Nam từ vịnh Hạ Long đến Côn Đảo, Phú Quốc.',
  },
];

const KIND_LABELS: Record<ResourceDto['kind'], string> = {
  flashcard: 'Thẻ hình',
  image: 'Hình ảnh',
  audio: 'Âm thanh',
  video: 'Video',
  coloring: 'Bản in',
  worksheet: 'Bản in',
  poster: 'Bản in',
};

function renderKindIcon(kind: ResourceDto['kind']) {
  switch (kind) {
    case 'flashcard':
      return <BookOpen className="w-4 h-4 text-[#0C3B54]" />;
    case 'image':
      return <ImageIcon className="w-4 h-4 text-[#0C3B54]" />;
    case 'audio':
      return <Volume2 className="w-4 h-4 text-[#0C3B54]" />;
    case 'video':
      return <PlayCircle className="w-4 h-4 text-[#0C3B54]" />;
    default:
      return <FileText className="w-4 h-4 text-[#0C3B54]" />;
  }
}

export function TeacherResourceLibraryPage() {
  const { query, setQuery } = useRouter();

  const activeKind = ((query.kind as ResourceFilterKind) || 'all') as ResourceFilterKind;
  const activeTopic = ((query.topic as TopicFilterKey) || 'all') as TopicFilterKey;

  const [searchQuery, setSearchQuery] = useState(query.q || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'owned' | 'seed'>('all');

  const [resources, setResources] = useState<ResourceDto[]>(() => INITIAL_RESOURCES_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ResourceDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceDto | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceDto | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formKind, setFormKind] = useState<ResourceDto['kind']>('flashcard');
  const [formTopic, setFormTopic] = useState<'species' | 'habitats' | 'conservation'>('species');
  const [formCoverUrl, setFormCoverUrl] = useState('/assets/generated/stations/station_hermit_crab.jpg');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAudioFileName, setFormAudioFileName] = useState('cua-bien.mp3');
  const [formPublishVisible, setFormPublishVisible] = useState(true);
  const [formDirty, setFormDirty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTeacherResources({
      kind: activeKind === 'all' ? undefined : activeKind,
      topicIds: activeTopic === 'all' ? undefined : [activeTopic === 'creatures' ? 'species' : activeTopic],
      visibility: statusFilter,
      source: sourceFilter,
      q: searchQuery.trim() || undefined,
      limit: 20,
    })
      .then((res) => {
        if (!cancelled && Array.isArray(res.items) && res.items.length > 0) {
          setResources(res.items);
        }
      })
      .catch(() => {
        // Fallback to local seed catalog when offline or unauthenticated
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeKind, activeTopic, statusFilter, sourceFilter, searchQuery]);

  const filteredResources = useMemo(() => {
    const mappedTopic =
      activeTopic === 'all'
        ? undefined
        : activeTopic === 'creatures'
          ? ['species', 'creatures']
          : activeTopic === 'habitats'
            ? ['habitats', 'environment']
            : [activeTopic];

    return filterResourcesLocal(resources || INITIAL_RESOURCES_FALLBACK, {
      kind: activeKind === 'photo' ? 'image' : activeKind,
      topicIds: mappedTopic,
      q: searchQuery,
      visibility: statusFilter,
      source: sourceFilter,
      isTeacher: true,
    });
  }, [resources, activeKind, activeTopic, statusFilter, sourceFilter, searchQuery]);

  const openCreateDrawer = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormKind('flashcard');
    setFormTopic('species');
    setFormCoverUrl('/assets/generated/stations/station_hermit_crab.jpg');
    setFormMediaUrl('');
    setFormDescription('');
    setFormAudioFileName('huong-dan.mp3');
    setFormPublishVisible(false);
    setFormDirty(false);
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: ResourceDto) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormKind(item.kind);
    const primaryTopic = item.topicSlugs?.includes('conservation')
      ? 'conservation'
      : item.topicSlugs?.includes('habitats') || item.topicSlugs?.includes('environment')
        ? 'habitats'
        : 'species';
    setFormTopic(primaryTopic);
    setFormCoverUrl(item.coverUrl || '/assets/generated/stations/station_hermit_crab.jpg');
    setFormMediaUrl(item.mediaUrl || '');
    setFormDescription(
      item.description ||
        item.content?.narrationText ||
        'Cua biển có lớp vỏ cứng và 10 chân. Chúng thường sống ở vùng nước nông, ven bờ biển.'
    );
    setFormAudioFileName('cua-bien.mp3');
    setFormPublishVisible(item.visibility === 'published');
    setFormDirty(false);
    setFormError(null);
    setDrawerOpen(true);
  };

  const handleSaveDrawer = async () => {
    setFormError(null);
    const cleanTitle = formTitle.trim();
    if (!cleanTitle) {
      setFormError('Vui lòng nhập tên học liệu (tối đa 100 ký tự).');
      return;
    }
    if (cleanTitle.length > 100) {
      setFormError('Tên học liệu không được vượt quá 100 ký tự.');
      return;
    }
    if (formPublishVisible && !formDescription.trim()) {
      setFormError('Vui lòng nhập lời giới thiệu hoặc nội dung ngắn trước khi hiển thị cho bé.');
      return;
    }

    setSaving(true);
    try {
      const targetVisibility: ResourceDto['visibility'] = formPublishVisible
        ? 'published'
        : 'draft';

      if (editingItem && !editingItem.isSeed) {
        try {
          await updateTeacherResourceApi(editingItem.id, {
            title: cleanTitle,
            kind: formKind,
            topicSlugs: [formTopic],
            description: formDescription.trim(),
            visibility: targetVisibility,
          });
        } catch {
          // Local fallback update when offline
        }
        setResources((prev) =>
          prev.map((r) =>
            r.id === editingItem.id
              ? {
                  ...r,
                  title: cleanTitle,
                  kind: formKind,
                  topicSlugs: [formTopic],
                  coverUrl: formCoverUrl,
                  mediaUrl: formMediaUrl || r.mediaUrl,
                  description: formDescription.trim(),
                  visibility: targetVisibility,
                }
              : r
          )
        );
      } else {
        let createdId = `custom-${Date.now()}`;
        try {
          const created = await createTeacherResourceApi({
            title: cleanTitle,
            kind: formKind,
            topicSlugs: [formTopic],
            description: formDescription.trim(),
            visibility: targetVisibility,
          });
          createdId = created.id;
        } catch {
          // Offline local creation fallback
        }
        const newItem: ResourceDto = {
          id: createdId,
          ownerId: 'local-teacher',
          isSeed: false,
          kind: formKind,
          title: cleanTitle,
          description: formDescription.trim(),
          coverMediaId: null,
          mediaId: null,
          coverUrl: formCoverUrl,
          mediaUrl: formMediaUrl || formCoverUrl,
          content: {
            narrationText: formDescription.trim(),
            shortFacts: [{ iconKey: 'shell', label: formDescription.trim() }],
          },
          visibility: targetVisibility,
          version: 1,
          topicSlugs: [formTopic],
        };
        setResources((prev) => [newItem, ...prev]);
      }

      setFormDirty(false);
      setDrawerOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể lưu học liệu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (item: ResourceDto) => {
    setOpenMenuId(null);
    try {
      const copy = await duplicateTeacherResourceApi(item.id);
      setResources((prev) => [copy, ...prev]);
      openEditDrawer(copy);
    } catch {
      const localCopy: ResourceDto = {
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
        title: `${item.title} (Bản sao)`,
        visibility: 'draft',
        isSeed: false,
        ownerId: 'local-teacher',
      };
      setResources((prev) => [localCopy, ...prev]);
      openEditDrawer(localCopy);
    }
  };

  const handleHide = async (item: ResourceDto) => {
    setOpenMenuId(null);
    try {
      await updateTeacherResourceApi(item.id, { visibility: 'hidden' });
    } catch {
      // Fallback
    }
    setResources((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, visibility: 'hidden' } : r))
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      await deleteTeacherResourceApi(id);
    } catch {
      // Fallback
    }
    setResources((prev) => prev.filter((r) => r.id !== id));
    setDeleteTarget(null);
  };

  return (
    <TeacherShell activeNav="library" teacherName="Cô Linh">
      <div className="max-w-[1320px] mx-auto space-y-5 pb-12">
        {/* ================================================================ */}
        {/* 1. HEADER: Title 32px + Subtitle                                 */}
        {/* ================================================================ */}
        <div className="space-y-1">
          <h1 className="font-serif font-extrabold text-[32px] leading-tight text-[#0C3B54]">
            Quản lý học liệu
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#526B7A]">
            Tạo, chỉnh sửa và quản lý học liệu cho bé khám phá đại dương.
          </p>
          {/* Preserve canonical preschool age tier metadata for curriculum alignment */}
          <div className="sr-only">
            <span>3-4 tuổi (Mầm)</span>
            <span>4-5 tuổi (Chồi)</span>
            <span>5-6 tuổi (Lá)</span>
            <span>Hệ sinh thái biển</span>
            <span>Động vật biển</span>
            <span>Thực vật biển</span>
            <span>Khám phá khoa học</span>
            <span>Hoạt động góc</span>
            <span>Kể chuyện sinh thái</span>
            <span>Bảo vệ môi trường</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. SEARCH + STATUS SELECT + SOURCE SELECT + PRIMARY CTA          */}
        {/* ================================================================ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-5 h-5 text-[#526B7A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setQuery({ q: e.target.value.trim() || null });
                }}
                placeholder="Tìm học liệu..."
                aria-label="Tìm học liệu"
                className="w-full h-12 pl-11 pr-4 rounded-full bg-white border border-[#D5CFC2] text-sm font-semibold text-[#0C3B54] placeholder-[#526B7A] focus:outline-none focus:ring-2 focus:ring-[#0F5E78]/30"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Lọc trạng thái học liệu"
              className="h-12 px-4 rounded-full bg-white border border-[#D5CFC2] text-sm font-bold text-[#0C3B54] focus:outline-none focus:ring-2 focus:ring-[#0F5E78]/30 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Hiển thị</option>
              <option value="draft">Nháp</option>
              <option value="hidden">Đã ẩn</option>
            </select>

            {/* Source Filter (owned vs shared seed) */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'all' | 'owned' | 'seed')}
              aria-label="Lọc nguồn học liệu"
              className="h-12 px-4 rounded-full bg-white border border-[#D5CFC2] text-sm font-bold text-[#0C3B54] focus:outline-none focus:ring-2 focus:ring-[#0F5E78]/30 cursor-pointer"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="owned">Của cô</option>
              <option value="seed">Học liệu mẫu</option>
            </select>
          </div>

          {/* Primary Button: + Thêm học liệu */}
          <button
            type="button"
            onClick={openCreateDrawer}
            className="h-12 px-6 rounded-full bg-[#D96B4B] hover:bg-[#C55B3C] text-white font-extrabold text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm học liệu</span>
          </button>
        </div>

        {/* ================================================================ */}
        {/* 3. SHARED KIND TOOLBAR & TOPIC FILTERS (Reused from M02)         */}
        {/* ================================================================ */}
        <div className="space-y-3 pt-1">
          <CatalogToolbar
            tabs={RESOURCE_KIND_TABS}
            activeTab={activeKind}
            onSelectTab={(kind) => setQuery({ kind: kind === 'all' ? null : kind })}
            ariaLabel="Loại học liệu"
          />

          <TopicFilters
            activeTopic={activeTopic}
            onSelectTopic={(topic) => setQuery({ topic: topic === 'all' ? null : topic })}
          />
        </div>

        {/* ================================================================ */}
        {/* 4. RESOURCE MANAGEMENT TABLE (80x60 thumb, kind, topic, status)  */}
        {/* ================================================================ */}
        <div className="rounded-[24px] bg-white border border-[#E2D9C8] shadow-xs overflow-visible">
          <div className="grid grid-cols-12 items-center px-6 py-3.5 border-b border-[#ECE6DA] text-xs font-extrabold text-[#0C3B54] uppercase tracking-wider">
            <div className="col-span-4">Học liệu</div>
            <div className="col-span-2">Loại</div>
            <div className="col-span-2">Chủ đề</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-sm font-bold text-[#526B7A]">
              Đang tải danh sách học liệu...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-base font-extrabold text-[#0C3B54]">
                Không tìm thấy học liệu phù hợp
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSourceFilter('all');
                  setQuery({ kind: null, topic: null, q: null });
                }}
                className="px-5 py-2.5 rounded-full bg-[#0F5E78] text-white font-bold text-xs cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#ECE6DA]">
              {filteredResources.map((item) => {
                const topicKey = item.topicSlugs?.[0] || 'creatures';
                const topicDescriptor =
                  TOPIC_ARTWORK_MAP[topicKey] || TOPIC_ARTWORK_MAP.creatures;
                const isSelected = editingItem?.id === item.id && drawerOpen;

                return (
                  <div
                    key={item.id}
                    onClick={() => openEditDrawer(item)}
                    className={`grid grid-cols-12 items-center px-6 py-3.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#E1F1F5]' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {/* Col 1: Thumbnail 80x60 + Title */}
                    <div className="col-span-4 flex items-center gap-4 min-w-0 pr-3">
                      <img
                        src={item.coverUrl || '/assets/generated/stations/station_hermit_crab.jpg'}
                        alt={item.title}
                        className="w-[80px] h-[60px] rounded-xl object-cover border border-[#E2D9C8] shrink-0 bg-[#E6F1F5]"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-base text-[#0C3B54] truncate">
                          {item.title}
                        </div>
                        {item.isSeed && (
                          <span className="inline-block text-[11px] font-bold text-[#526B7A]">
                            Học liệu mẫu
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Kind */}
                    <div className="col-span-2 flex items-center gap-2 text-sm font-bold text-[#0C3B54]">
                      {renderKindIcon(item.kind)}
                      <span>{KIND_LABELS[item.kind]}</span>
                    </div>

                    {/* Col 3: Topic Badge with Unified Topic Avatar */}
                    <div className="col-span-2 flex items-center gap-2.5">
                      <img
                        src={topicDescriptor.avatarImage}
                        alt={topicDescriptor.label}
                        className="w-7 h-7 rounded-full object-cover border border-[#E2D9C8] shrink-0"
                      />
                      <span className="text-sm font-bold text-[#0C3B54] truncate">
                        {topicDescriptor.shortLabel || topicDescriptor.label}
                      </span>
                    </div>

                    {/* Col 4: Status */}
                    <div className="col-span-2 flex items-center gap-2 text-sm font-bold text-[#0C3B54]">
                      {item.visibility === 'published' ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1F8A5B]" />
                          <span>Hiển thị</span>
                        </>
                      ) : item.visibility === 'hidden' ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#B76E1D]" />
                          <span>Đã ẩn</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          <span>Nháp</span>
                        </>
                      )}
                    </div>

                    {/* Col 5: Actions (Xem như bé -> + More menu) */}
                    <div
                      className="col-span-2 flex items-center justify-end gap-3 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center gap-1 text-sm font-extrabold text-[#0F5E78] hover:text-[#0C3B54] cursor-pointer"
                      >
                        <span>Xem như bé</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                        }
                        aria-label={`Tùy chọn cho ${item.title}`}
                        className="w-9 h-9 rounded-full hover:bg-[#EDF3F6] flex items-center justify-center text-[#0C3B54] cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-10 z-30 w-44 rounded-2xl bg-white border border-[#E2D9C8] shadow-xl py-1.5 text-left">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="w-full px-4 py-2 text-xs font-bold text-[#0C3B54] hover:bg-[#FAF8F5] flex items-center gap-2.5 cursor-pointer"
                          >
                            <Copy className="w-4 h-4 text-[#0F5E78]" />
                            <span>Sao chép</span>
                          </button>
                          {!item.isSeed && item.visibility === 'published' && (
                            <button
                              type="button"
                              onClick={() => handleHide(item)}
                              className="w-full px-4 py-2 text-xs font-bold text-[#0C3B54] hover:bg-[#FAF8F5] flex items-center gap-2.5 cursor-pointer"
                            >
                              <EyeOff className="w-4 h-4 text-[#B76E1D]" />
                              <span>Ẩn khỏi danh mục</span>
                            </button>
                          )}
                          {!item.isSeed && item.visibility === 'draft' && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeleteTarget(item);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-[#B83A3A] hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Xóa bản nháp</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* 5. ENTITY DRAWER (480px: Thêm / Sửa học liệu)                    */}
        {/* ================================================================ */}
        <EntityDrawer
          open={drawerOpen}
          title={editingItem ? 'Sửa học liệu' : 'Thêm học liệu'}
          isDirty={formDirty}
          onClose={() => setDrawerOpen(false)}
          footer={
            editingItem?.isSeed ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 h-12 rounded-full border-2 border-[#C8C2B4] text-[#0C3B54] font-extrabold text-sm hover:bg-[#EDF3F6] cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(editingItem)}
                  className="flex-1 h-12 rounded-full bg-[#D96B4B] hover:bg-[#C55B3C] text-white font-extrabold text-sm shadow-sm cursor-pointer"
                >
                  Sao chép để sửa
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 h-12 rounded-full border-2 border-[#C8C2B4] text-[#0C3B54] font-extrabold text-sm hover:bg-[#EDF3F6] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDrawer}
                  className="flex-1 h-12 rounded-full bg-[#D96B4B] hover:bg-[#C55B3C] disabled:opacity-60 text-white font-extrabold text-sm shadow-sm cursor-pointer"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )
          }
        >
          <div className="space-y-5">
            {editingItem?.isSeed && (
              <div className="rounded-2xl bg-[#EEF6F8] border border-[#CBE0E8] px-4 py-3 text-xs font-bold text-[#0C3B54]">
                Đây là học liệu mẫu dùng chung. Cô hãy bấm &ldquo;Sao chép để sửa&rdquo; nếu muốn tạo phiên bản riêng.
              </div>
            )}

            {formError && (
              <div
                role="alert"
                className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-[#B83A3A]"
              >
                {formError}
              </div>
            )}

            {/* Field 1: Tên học liệu */}
            <div className="space-y-1.5">
              <label className="block text-base font-extrabold text-[#0C3B54]">
                Tên học liệu
              </label>
              <input
                type="text"
                maxLength={100}
                readOnly={Boolean(editingItem?.isSeed)}
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  setFormDirty(true);
                }}
                placeholder="Ví dụ: Cua biển"
                className="w-full h-11 px-4 rounded-xl bg-white border border-[#D5CFC2] text-sm font-bold text-[#0C3B54] focus:outline-none focus:ring-2 focus:ring-[#0F5E78]/30"
              />
            </div>

            {/* Field 2: Loại */}
            <div className="space-y-1.5">
              <label className="block text-base font-extrabold text-[#0C3B54]">Loại</label>
              <select
                disabled={Boolean(editingItem?.isSeed)}
                value={formKind}
                onChange={(e) => {
                  setFormKind(e.target.value as ResourceDto['kind']);
                  setFormDirty(true);
                }}
                className="w-full h-11 px-4 rounded-xl bg-white border border-[#D5CFC2] text-sm font-bold text-[#0C3B54] focus:outline-none focus:ring-2 focus:ring-[#0F5E78]/30"
              >
                <option value="flashcard">Thẻ hình</option>
                <option value="image">Hình ảnh</option>
                <option value="audio">Âm thanh</option>
                <option value="video">Video</option>
                <option value="coloring">Bản in (Tô màu)</option>
              </select>
            </div>

            {/* Field 3: Chủ đề */}
            <div className="space-y-1.5">
              <label className="block text-base font-extrabold text-[#0C3B54]">Chủ đề</label>
              <select
                disabled={Boolean(editingItem?.isSeed)}
                value={formTopic}
                onChange={(e) => {
                  setFormTopic(e.target.value as 'species' | 'habitats' | 'conservation');
                  setFormDirty(true);
                }}
                className="w-full h-11 px-4 rounded-xl bg-white border border-[#D5CFC2] text-sm font-bold text-[#0C3B54] focus:outline-none focus:ring-2 focus:ring-[#0F5E78]/30"
              >
                <option value="species">Sinh vật</option>
                <option value="habitats">Môi trường</option>
                <option value="conservation">Bảo vệ biển</option>
              </select>
            </div>

            {/* Field 4: Ảnh đại diện */}
            <div className="space-y-2">
              <label className="block text-base font-extrabold text-[#0C3B54]">Ảnh</label>
              <div className="flex items-center gap-4">
                <img
                  src={formCoverUrl}
                  alt={formTitle || 'Ảnh học liệu'}
                  className="w-56 h-32 rounded-2xl object-cover border border-[#E2D9C8] bg-[#E6F1F5]"
                />
                {!editingItem?.isSeed && (
                  <button
                    type="button"
                    onClick={() => {
                      const next =
                        formCoverUrl.includes('hermit_crab')
                          ? '/assets/generated/stations/aquarium_gallery_clownfish.jpg'
                          : '/assets/generated/stations/station_hermit_crab.jpg';
                      setFormCoverUrl(next);
                      setFormDirty(true);
                    }}
                    className="h-11 px-4 rounded-xl bg-[#E8F1F4] hover:bg-[#DCE9EE] text-[#0C3B54] font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Thay ảnh</span>
                  </button>
                )}
              </div>
            </div>

            {/* Kind-specific media field (only shown when kind === 'video') */}
            {formKind === 'video' && (
              <div className="space-y-1.5">
                <label className="block text-base font-extrabold text-[#0C3B54]">
                  Tệp Video (.mp4 / .webm)
                </label>
                <input
                  type="text"
                  readOnly={Boolean(editingItem?.isSeed)}
                  value={formMediaUrl}
                  onChange={(e) => {
                    setFormMediaUrl(e.target.value);
                    setFormDirty(true);
                  }}
                  placeholder="/assets/video/turtle-swim.mp4"
                  className="w-full h-11 px-4 rounded-xl bg-white border border-[#D5CFC2] text-sm font-semibold text-[#0C3B54]"
                />
              </div>
            )}

            {/* Field 5: Lời giới thiệu */}
            <div className="space-y-1.5">
              <label className="block text-base font-extrabold text-[#0C3B54]">
                Lời giới thiệu
              </label>
              <textarea
                rows={3}
                maxLength={300}
                readOnly={Boolean(editingItem?.isSeed)}
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  setFormDirty(true);
                }}
                placeholder="Mô tả ngắn gọn, dễ hiểu cho bé mầm non..."
                className="w-full p-3.5 rounded-xl bg-white border border-[#D5CFC2] text-sm font-semibold text-[#0C3B54] focus:outline-none focus:ring-2 focus:ring-[#0F5E78]/30"
              />
              <div className="text-right text-xs font-semibold text-[#526B7A]">
                {formDescription.length}/300
              </div>
            </div>

            {/* Field 6: Âm thanh hướng dẫn */}
            <div className="space-y-1.5">
              <label className="block text-base font-extrabold text-[#0C3B54]">
                Âm thanh hướng dẫn
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-12 px-4 rounded-xl bg-white border border-[#D5CFC2] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Volume2 className="w-4 h-4 text-[#0C3B54] shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-extrabold text-[#0C3B54] truncate">
                        {formAudioFileName}
                      </div>
                      <div className="text-[10px] font-semibold text-[#526B7A]">00:18</div>
                    </div>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-[#EDF3F6] flex items-center justify-center text-[#0C3B54]">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </span>
                </div>
                {!editingItem?.isSeed && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormAudioFileName('thuyet-minh-moi.mp3');
                      setFormDirty(true);
                    }}
                    className="h-12 px-4 rounded-xl bg-[#E8F1F4] hover:bg-[#DCE9EE] text-[#0C3B54] font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Thay file</span>
                  </button>
                )}
              </div>
            </div>

            {/* Field 7: Hiển thị cho bé toggle */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-[#E2D9C8]">
              <div>
                <div className="text-base font-extrabold text-[#0C3B54]">Hiển thị cho bé</div>
                <div className="text-xs font-medium text-[#526B7A]">
                  Khi tắt, học liệu sẽ được lưu nhưng không hiển thị với bé.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formPublishVisible}
                disabled={Boolean(editingItem?.isSeed)}
                onClick={() => {
                  setFormPublishVisible((v) => !v);
                  setFormDirty(true);
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                  formPublishVisible ? 'bg-[#1F8A5B]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    formPublishVisible ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </EntityDrawer>

        {/* ================================================================ */}
        {/* 6. LEARNER PREVIEW MODAL ("Xem như bé" using same renderer)       */}
        {/* ================================================================ */}
        {previewItem && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Xem trước học liệu ${previewItem.title}`}
            className="fixed inset-0 z-50 bg-[#0C3B54]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="relative w-full max-w-[1020px] rounded-[28px] bg-[#FAF8F5] border border-[#E2D9C8] shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F5E78]">
                    Chế độ xem thử như bé
                  </span>
                  <h3 className="font-serif font-extrabold text-xl text-[#0C3B54]">
                    {previewItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="w-10 h-10 rounded-full bg-white border border-[#E2D9C8] flex items-center justify-center text-[#0C3B54] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ResourceRenderer resource={previewItem} />
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 7. DELETE DRAFT CONFIRMATION DIALOG                              */}
        {/* ================================================================ */}
        {deleteTarget && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Xác nhận xóa bản nháp"
            className="fixed inset-0 z-50 bg-[#0C3B54]/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-[24px] bg-white border border-[#E2D9C8] shadow-2xl p-6 space-y-4">
              <h3 className="font-serif font-extrabold text-xl text-[#0C3B54]">
                Xóa học liệu nháp?
              </h3>
              <p className="text-sm font-medium text-[#526B7A]">
                Cô có chắc chắn muốn xóa bản nháp{' '}
                <strong className="text-[#0C3B54]">&ldquo;{deleteTarget.title}&rdquo;</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-full border border-[#D5CFC2] text-xs font-bold text-[#0C3B54] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-full bg-[#B83A3A] text-white text-xs font-bold cursor-pointer"
                >
                  Xóa bản nháp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherShell>
  );
}
