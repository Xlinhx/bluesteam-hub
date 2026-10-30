import { ArrowLeft, Eye, Info } from 'lucide-react';
import type { UsageDetail, UsageRow } from '@bluesteam/contracts';
import type { ReactNode } from 'react';
import { ActivityThumbnail } from '@/shared/activities/ActivityThumbnail';
import { UsageSummary } from './UsageOverview';
import { UsageAnalysis } from './UsageAnalysis';
export function UsageActivityDetail({ row, detail, loading, error, onRetry, onBack, onPreview, toolbar }: {
  row:UsageRow;detail:UsageDetail|null;loading:boolean;error:string;onRetry:()=>void;onBack:()=>void;onPreview:()=>void;toolbar:ReactNode;
}) {
  const analysis=detail?.analysis;
  const focus=analysis?.type==='game_first_answer' ? [...analysis.items].filter(item=>item.answeredRuns>0).sort((a,b)=>b.firstIncorrectRuns/b.answeredRuns-a.firstIncorrectRuns/a.answeredRuns)[0] : undefined;
  return <div className="usage-detail">
    <button className="usage-back" onClick={onBack}><ArrowLeft size={20}/>Tất cả hoạt động</button>
    <header className="usage-identity usage-surface"><ActivityThumbnail content={{id:row.contentId,coverUrl:row.coverUrl}} kind={row.kind} variant="identity"/><div><h2>{row.title}</h2><span className="usage-badge">{analysis?.type==='game_first_answer'?({sorting:'Phân loại',matching:'Ghép cặp',choice:'Chọn đáp án'}[analysis.mechanic]):({game:'Trò chơi',simulation:'Mô phỏng',scenario:'Tình huống',model3d:'Mô hình 3D'}[row.kind])}</span></div><button className="usage-button usage-button--primary" onClick={onPreview}><Eye size={20}/>{detail && detail.version!==row.defaultVersion?'Xem thử bản hiện có':'Xem thử'}</button></header>
    {toolbar}
    <UsageSummary metrics={[[ 'Lượt mở',loading||error?null:detail?.opens??null ],['Lượt có tương tác',loading||error?null:detail?.interactedRuns??null]]}/>
    {loading ? <div className="usage-state" role="status">Đang tải chi tiết…</div> : error ? <div className="usage-state" role="alert"><h2>Chưa tải được chi tiết</h2><p>{error}</p><button className="usage-button usage-button--primary" onClick={onRetry}>Thử lại chi tiết</button></div> : detail && <>
      <div className="usage-analysis-layout">
        {analysis ? <UsageAnalysis analysis={analysis}/> : <section className="usage-surface"><h2>Thao tác được ghi nhận</h2>{detail.sections.length ? detail.sections.map(section=><div className="usage-choice-section" key={section.id}><h3>{section.label}</h3>{section.values.map(value=><p key={value.id}>{value.label}: {value.count} / {section.denominator}</p>)}</div>) : <p>Chưa có thao tác được ghi nhận trong phiên bản này.</p>}</section>}
        <aside className="usage-reading usage-surface"><h2>{row.kind==='scenario'?'Cùng trò chuyện':row.kind==='model3d'?'Cùng khám phá':'Cùng xem lại'}</h2>
          {focus && <strong>{focus.label}: {focus.firstIncorrectRuns}/{focus.answeredRuns} lượt trả lời đầu chưa đúng.</strong>}
          <p>{row.kind==='game'?'Cô có thể xem lại hình ảnh, hướng dẫn và vùng chọn trong hoạt động.':row.kind==='scenario'?'Cô có thể hỏi bé vì sao chọn cách này và cùng xem điều gì xảy ra tiếp theo.':row.kind==='simulation'?'Cô có thể mở mô phỏng và trò chuyện cùng bé về những thay đổi quan sát được.':'Cô có thể mở mô hình để quan sát cùng bé.'}</p>
          <p className="usage-help">{row.kind==='game'?'Số liệu chưa cho biết nguyên nhân lựa chọn.':row.kind==='scenario'?'Chỉ tính lựa chọn đầu được ghi nhận tại mỗi cảnh.':'Chưa thu thập mức độ hiểu và kết quả học tập.'}</p>
          <button className="usage-button" onClick={onPreview}><Eye size={20}/>Xem thử {row.kind==='model3d'?'mô hình':row.kind==='simulation'?'mô phỏng':row.kind==='scenario'?'tình huống':'hoạt động'}</button>
        </aside>
      </div>
      <div className="usage-limit"><Info size={20}/><p>{row.kind==='game'?'Lần trả lời đầu không phải kết quả đánh giá học tập.':row.kind==='model3d'?'Dấu — nghĩa là chưa thu thập, không phải 0.':'Số liệu mô tả thao tác, không phải tiến độ hoàn thành.'}</p><span>Hoàn thành: <b>Chưa thu thập</b></span></div>
    </>}
  </div>;
}