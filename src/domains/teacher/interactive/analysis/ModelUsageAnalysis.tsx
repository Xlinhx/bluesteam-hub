import type { UsageAnalysis } from '@bluesteam/contracts';
import { UsageDaily } from '../UsageDaily';
export function ModelUsageAnalysis({ analysis }: { analysis: Extract<UsageAnalysis,{type:'model_opens'}> }) {
  return <UsageDaily title="Lượt mở mô hình" days={analysis.daily.map(day=>({...day,interactedRuns:null}))} caption="Ghi nhận khi mô hình sẵn sàng hiển thị. Chưa thu thập thao tác xoay và phóng to."/>;
}