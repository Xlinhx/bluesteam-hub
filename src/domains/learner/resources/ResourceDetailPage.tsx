import { useState, useEffect } from 'react';
import { useRouter, matchRoute } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { ArrowLeft, AlertCircle, Volume2 } from 'lucide-react';
import {
  ResourceDto,
  fetchPublicResourceById,
} from '../../../shared/api/catalog';
import { ResourceRenderer } from '../../../shared/ui/media/ResourceRenderer';
import { TOPIC_ARTWORK_MAP } from '../../../shared/data/categoryArtworkMap';
import { ResourceObservation } from '../../../shared/ui/media/ResourceObservation';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { ApiClientError } from '../../../shared/api/client';
import { LearnerResourceDetailLayout } from './LearnerResourceDetailLayout';
import { useResourceBookmarks } from './useResourceBookmarks';

export function ResourceDetailPage() {
  const { currentPath, query, navigate } = useRouter();
  const cleanPath = (currentPath || '/resources').split('?')[0];

  const creativeDetail = cleanPath.startsWith('/creative/coloring/');
  const matchCreative = matchRoute('/creative/coloring/:resourceId', cleanPath);
  const matchDirect = matchRoute('/resources/:resourceId', cleanPath);
  const matchFlash = matchRoute('/resources/flashcard/:cardId', cleanPath);
  const matchPrint = matchRoute('/resources/print/:printId', cleanPath);
  const matchMedia = matchRoute('/resources/media/:mediaId', cleanPath);

  const resourceId =
    matchCreative.params.resourceId ||
    matchDirect.params.resourceId ||
    matchFlash.params.cardId ||
    matchPrint.params.printId ||
    matchMedia.params.mediaId ||
    query.id ||
    '';

  const [resource, setResource] = useState<ResourceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const { saved: savedMap, toggleSaved } = useResourceBookmarks();

  useEffect(() => {
    const controller = new AbortController();
    setNotFound(false);
    setLoadError(false);
    setLoading(true);
    setResource(null);

    fetchPublicResourceById(resourceId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setResource(data);
        setLoading(false);
        setNotFound(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResource(null);
        if (error instanceof ApiClientError && error.status === 404) setNotFound(true);
        else setLoadError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [resourceId, retry]);

  const toggleBookmark = (id: string) => oceanAudio.playChime(toggleSaved(id) ? 659.25 : 440, 0.15);

  const handleBackToResources = () => {
    const returnQuery: Record<string, string | null> = {};
    if (query.view || query.kind) returnQuery.view = query.view || 'catalog';
    if (query.kind) returnQuery.kind = query.kind;
    if (query.topic) returnQuery.topic = query.topic;
    if (query.q) returnQuery.q = query.q;
    if (query.saved) returnQuery.saved = query.saved;
    if (query.group) returnQuery.group = query.group;
    if(query.capability)returnQuery.capability=query.capability;
    if (query.catalogPage) returnQuery.catalogPage = query.catalogPage;
    if (query.resourcePage) returnQuery.resourcePage = query.resourcePage;
    if (query.cursor) returnQuery.cursor = query.cursor;
    if (query.before) returnQuery.before = query.before;
    navigate(creativeDetail ? '/creative/coloring' : '/resources', { query: returnQuery });
  };

  if (notFound || loadError || (!loading && !resource)) {
    return (
      <LearnerShell activeNav={creativeDetail ? "creative" : "resources"}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 font-sans text-[#12384B]">
          <div className="max-w-lg mx-auto p-8 rounded-[20px] bg-[#F6F3EB] border border-[#D7E4E7] text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-[#B74A36] mx-auto" />
            <h1 className="text-[28px] font-bold">{loadError ? 'Chưa mở được học liệu' : 'Học liệu hiện không khả dụng'}</h1>
            <p className="text-base text-[#436475]">
              {loadError ? 'Kết nối đang gián đoạn. Bé hãy thử lại nhé.' : 'Nội dung này không tồn tại hoặc đã được cô giáo tạm ẩn khỏi thư viện.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {loadError && <button type="button" className="min-h-[56px] px-5 rounded-[12px] bg-white border border-[#D7E4E7] font-bold" onClick={() => setRetry(value => value + 1)}>Thử lại</button>}
              <button
                type="button"
                onClick={() =>
                  oceanAudio.speak(
                    'Học liệu này hiện không có sẵn. Bé hãy bấm quay lại thư viện học liệu nhé.',
                    { profile: creativeDetail ? undefined : 'learner-resource' },
                  )
                }
                aria-label="Nghe thông báo"
                className="min-h-[56px] px-5 rounded-[12px] bg-white border border-[#D7E4E7] text-[#17657A] font-bold flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>Nghe</span>
              </button>
              <button
                type="button"
                onClick={handleBackToResources}
                className="min-h-[56px] px-6 rounded-[12px] bg-[#B74A36] hover:bg-[#9f3d2b] text-white font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{creativeDetail?'Về Tranh tô màu':'Về Học liệu'}</span>
              </button>
            </div>
          </div>
        </div>
      </LearnerShell>
    );
  }

  if (loading || !resource) return <LearnerShell activeNav={creativeDetail ? "creative" : "resources"}><div role="status" className="min-h-[500px] grid place-items-center">Đang mở học liệu…</div></LearnerShell>;

  const activeResource = resource;
  const isSaved = Boolean(savedMap[activeResource.id]);
  const primaryTopic = activeResource.topicSlugs.map(slug => TOPIC_ARTWORK_MAP[slug]).find(Boolean);
  const isObservation = activeResource.kind === 'flashcard' || activeResource.kind === 'image';
  const relatedItems = (activeResource.related || []).slice(0, 3);

  return (
    <LearnerResourceDetailLayout id={activeResource.id} creative={creativeDetail} saved={isSaved}
      resourceKind={matchDirect.matches?'published':undefined}
      onBack={handleBackToResources} onSave={() => toggleBookmark(activeResource.id)}
      topic={primaryTopic && {title: primaryTopic.label,
        image: ['species', 'creatures'].includes(primaryTopic.key) ? primaryTopic.cutoutSrc : primaryTopic.avatarImage}}>
      {isObservation ? (
        <ResourceObservation
          key={activeResource.id}
          resource={activeResource}
          narrationProfile={creativeDetail ? undefined : 'learner-resource'}
          related={relatedItems.filter(item => item.kind === 'flashcard' || item.kind === 'image')}
          onOpen={id => navigate(`${creativeDetail ? '/creative/coloring' : '/resources'}/${id}`, { query: { ...query, source:null } })}
          onOpenDrawing={template => navigate('/creative/drawing', { query: { template,returnResource:resourceId,...(creativeDetail ? {fromCreative:'1'} : {}),...query } })}
        />
      ) : <ResourceRenderer
        key={activeResource.id}
        resource={activeResource}
        narrationProfile={creativeDetail ? undefined : 'learner-resource'}
        onSelectVariant={(variantId, kind, drawingTemplateKey) => {
          if (kind === 'coloring' && drawingTemplateKey) {
            navigate('/creative/drawing', { query: { ...query,template: drawingTemplateKey,returnResource:resourceId,...(creativeDetail ? {fromCreative:'1'} : {}) } });
            return;
          }
          navigate(`${creativeDetail ? '/creative/coloring' : '/resources'}/${variantId}`, { query });
        }}
        onOpenDrawing={(templateKey) => {
          navigate('/creative/drawing', { query: { ...query,template: templateKey,returnResource:resourceId,...(creativeDetail ? {fromCreative:'1'} : {}) } });
        }}
      />}

    </LearnerResourceDetailLayout>
  );
}
