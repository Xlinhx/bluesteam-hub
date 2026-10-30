// Stable IDs describe actual dedicated simulations; never use a mockup as event authority.
export const INTERACTIVE_SIMULATION_DEFINITIONS: Record<string, { version: number; steps: Array<{ id: string; label: string; choices?: Array<{ id: string; label: string }> }> }> = {
  'plastic-journey': { version: 1, steps: [{ id: 'shore', label: 'Trên bờ' }, { id: 'drift', label: 'Theo dòng nước' }, { id: 'habitat', label: 'Gần nơi sống' }, { id: 'microplastics', label: 'Vỡ vụn vi nhựa' }, { id: 'deepsea', label: 'Lắng đọng đáy biển' }] },
  'rescue-mission': { version: 1, steps: [{ id: 'observe', label: 'Quan sát' }, { id: 'identify', label: 'Nhận diện nguy hiểm' }, { id: 'help', label: 'Gọi trợ giúp' }, { id: 'release', label: 'Trở về biển' }] },
  'my-action': { version: 1, steps: [{ id: 'action', label: 'Bé chọn cách nào?', choices: [{ id: 'bin', label: 'Bỏ vào thùng rác' }, { id: 'leave', label: 'Để lại trên cát' }, { id: 'throw', label: 'Ném xuống biển' }] }] },
  'water-column': { version: 1, steps: [{ id: 'sunlit', label: 'Tầng ánh sáng' }, { id: 'twilight', label: 'Tầng chạng vạng' }, { id: 'midnight', label: 'Tầng nửa đêm' }, { id: 'abyssal', label: 'Tầng vực thẳm' }] },
};

export function reportProfileFor(templateKey: string): 'game' | 'simulation' | 'scenario' | 'model' | null {
  const key = templateKey.trim().toLowerCase();
  if (['sorting', 'matching', 'choice'].includes(key)) return 'game';
  if (['plastic-journey', 'rescue-mission', 'my-action', 'water-column'].includes(key)) return 'simulation';
  if (key === 'scenario') return 'scenario';
  if (key === 'model-3d' || key === 'model') return 'model';
  return null;
}
