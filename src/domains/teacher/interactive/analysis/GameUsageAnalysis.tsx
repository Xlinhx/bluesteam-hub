import type { UsageAnalysis } from '@bluesteam/contracts';
import { UsageMeter } from './UsageMeter';
type Analysis = Extract<UsageAnalysis, {type:'game_first_answer'}>;
export function GameUsageAnalysis({ analysis }: { analysis: Analysis }) {
  return <section className="usage-breakdown-panel usage-surface"><h2>Lần trả lời đầu</h2><p className="usage-help">Mỗi mục tính một câu trả lời đầu được ghi nhận trong một lượt chơi.</p><span className="usage-breakdown-label">Chưa đúng</span>
    {analysis.items.map(item => <details className="usage-game-item" key={item.id}><summary><span className="usage-item-name">{item.imageUrl && <img src={item.imageUrl} alt="" width="40" height="40" loading="lazy"/>}<strong>{item.label}</strong></span><UsageMeter value={item.firstIncorrectRuns} total={item.answeredRuns}/></summary>
      <div className="usage-answer-distribution"><p>{analysis.mechanic === 'sorting' ? 'Đích được chọn' : analysis.mechanic === 'matching' ? 'Hình được ghép' : 'Đáp án được chọn'} · {item.answeredRuns} lượt trả lời</p>{item.answers.map(answer => <div key={answer.id}><span>{answer.label}</span><UsageMeter value={answer.count} total={item.answeredRuns} percent={false}/></div>)}</div>
    </details>)}
  </section>;
}