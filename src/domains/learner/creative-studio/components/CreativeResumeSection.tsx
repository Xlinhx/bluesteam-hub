import { useEffect, useState } from 'react';
import { Clock3, PencilLine, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from '../../../../app/router';
import { artworkEditorPath } from '../../../../shared/creative/artworkCapabilities';
import type { CreativeArtwork } from '../../../../shared/creative/creativeStorage';
import { CraftPaperSurface } from '../../../../shared/ui/visuals/CraftPaperSurface';

export function CreativeResumeSection({ drafts, error }: { drafts: CreativeArtwork[]; error: string }) {
  const { navigate } = useRouter();
  const [page, setPage] = useState(0);
  useEffect(() => setPage(value => Math.min(value, Math.max(0, Math.ceil(drafts.length / 3) - 1))), [drafts.length]);

  return <CraftPaperSurface className="creative-resume">
    <header>
      <span className="creative-entry-icon rose"><Clock3 /></span>
      <div><h2>Làm tiếp</h2><p>Tiếp tục sáng tạo từ lần trước nhé!</p></div>
    </header>
    {error ? <p role="alert">{error}</p> : !drafts.length ?
      <p className="creative-resume-empty">Chưa có tiến trình đang làm.<br /><small>Bắt đầu một ý tưởng ở phía trên nhé!</small></p> :
      <div className="creative-progress-list">
        {drafts.slice(page * 3, page * 3 + 3).map(artwork => <button
          key={artwork.id}
          className="creative-progress-item"
          onClick={() => navigate(artworkEditorPath(artwork), { query: { id: artwork.id } })}
        >
          <img src={artwork.previewDataUrl || artwork.scanData?.originalDataUrl} alt="" />
          <span>
            <strong>{artwork.title}</strong>
            <small>{artwork.type === 'scan' ? !artwork.scanData?.cutoutDataUrl ? 'Chưa tách nền' : 'Đang xem lại tranh' : artwork.type === 'habitat' ? 'Đang xây nơi sống' : 'Đang tô màu'}</small>
            <time dateTime={new Date(artwork.updatedAt ?? artwork.createdAt).toISOString()}>Sửa lúc {new Date(artwork.updatedAt ?? artwork.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time>
            <em><PencilLine />Làm tiếp</em>
          </span>
        </button>)}
        {drafts.length > 3 && <nav aria-label="Trang tiến trình">
          <button disabled={!page} aria-label="Tiến trình trước" onClick={() => setPage(value => value - 1)}><ArrowLeft /></button>
          <span>{page + 1}/{Math.ceil(drafts.length / 3)}</span>
          <button disabled={(page + 1) * 3 >= drafts.length} aria-label="Tiến trình sau" onClick={() => setPage(value => value + 1)}><ArrowRight /></button>
        </nav>}
      </div>
    }
    <button className="creative-profile-link" onClick={() => navigate('/profile')}>Xem tác phẩm trong Hồ sơ <ArrowRight size={20} /></button>
    <img className="creative-resume-corner creative-resume-corner--left" src="/assets/creative/c02-reference/resume-left-corner.webp" alt="" aria-hidden="true" />
    <img className="creative-resume-corner creative-resume-corner--right" src="/assets/creative/c02-reference/resume-right-corner.webp" alt="" aria-hidden="true" />
    <img className="creative-resume-corner creative-resume-corner--crayon" src="/assets/creative/c02-reference/desk-crayon.webp" alt="" aria-hidden="true" />
  </CraftPaperSurface>;
}
