export interface GameValidationIssue { path: string; message: string }

/** Drafts may be incomplete. Publishing must never invent an answer or silently move a target. */
export function validateGameForPublish(template: string, raw: Record<string, unknown>): GameValidationIssue[] {
  const issues: GameValidationIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });
  const config = raw as Record<string, any>;
  const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
  const unique = (rows: any[], path: string) => {
    const seen = new Set<string>();
    rows.forEach((row, index) => { if (!text(row?.id) || seen.has(row.id)) add(`${path}.${index}.id`, 'Mỗi mục cần một mã riêng, không trùng nhau.'); seen.add(row?.id); });
  };
  const instruction = config.instructionText ?? config.prompt;
  if (!text(instruction) || instruction.length > 160) add('instructionText', 'Hướng dẫn cần từ 1 đến 160 ký tự.');
  if (template === 'sorting') {
    const targets = Array.isArray(config.targets) ? config.targets : Array.isArray(config.zones) ? config.zones : [];
    const objects = Array.isArray(config.objects) ? config.objects : Array.isArray(config.items) ? config.items : [];
    if (targets.length < 2 || targets.length > 4) add('targets', 'Cần từ 2 đến 4 vùng đích.');
    if (objects.length < 2 || objects.length > 12) add('objects', 'Cần từ 2 đến 12 vật thể.');
    unique(targets, 'targets'); unique(objects, 'objects');
    const targetIds = new Set(targets.map((t: any) => t?.id));
    targets.forEach((target: any, index: number) => {
      if (!text(target?.label)) add(`targets.${index}.label`, 'Vùng đích chưa có tên.');
      const b = target?.bounds;
      if (b && (![b.x, b.y, b.width, b.height].every(Number.isFinite) || b.x < 0 || b.y < 0 || b.width < .05 || b.height < .05 || b.x + b.width > 1.000001 || b.y + b.height > 1.000001)) add(`targets.${index}.bounds`, `Vùng “${target?.label || index + 1}” nằm ngoài cảnh hoặc quá nhỏ.`);
      if (target?.shape && !['ellipse','rectangle'].includes(target.shape)) add(`targets.${index}.shape`,'Hình dạng vùng chưa được hỗ trợ.');
      if (b) for (const other of targets.slice(0,index)) {
        const a = other?.bounds;
        if (a && Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x) > .000001 && Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y) > .000001) {
          add(`targets.${index}.bounds`,`Vùng “${target.label || index+1}” chồng lên vùng “${other.label}”. Cô tách các vùng để bé dễ chọn nhé.`);break;
        }
      }
    });
    objects.forEach((object: any, index: number) => {
      if (!text(object?.label)) add(`objects.${index}.label`, 'Vật thể chưa có tên.');
      if (!text(object?.imageUrl)) add(`objects.${index}.imageUrl`, `Vật thể “${object?.label || index + 1}” thiếu ảnh.`);
      const accepted = Array.isArray(object?.acceptedTargetIds) ? object.acceptedTargetIds : object?.targetZoneId ? [object.targetZoneId] : [];
      if (!accepted.length || accepted.some((id: string) => !targetIds.has(id))) add(`objects.${index}.acceptedTargetIds`, `Vật thể “${object?.label || index + 1}” cần các vùng đích hợp lệ.`);
      if (object?.scale !== undefined && (!Number.isFinite(object.scale) || object.scale < .5 || object.scale > 2)) add(`objects.${index}.scale`, 'Tỷ lệ vật thể cần từ 50% đến 200%.');
    });
  } else if (template === 'matching') {
    const pairs = Array.isArray(config.pairs) ? config.pairs : [];
    if (pairs.length < 2 || pairs.length > 6) add('pairs', 'Cần từ 2 đến 6 cặp ghép.');
    unique(pairs, 'pairs');
    pairs.forEach((pair: any, index: number) => { if (!text(pair?.left?.imageUrl || pair?.leftImageUrl) || !text(pair?.right?.imageUrl || pair?.rightImageUrl)) add(`pairs.${index}`, 'Mỗi cặp cần đủ hai hình ảnh.'); });
  } else if (template === 'choice') {
    const questions = Array.isArray(config.questions) ? config.questions : [];
    if (questions.length < 1 || questions.length > 10) add('questions', 'Cần từ 1 đến 10 câu hỏi.');
    unique(questions, 'questions');
    questions.forEach((question: any, index: number) => {
      const options = Array.isArray(question?.options) ? question.options : [];
      if (!text(question?.promptText || question?.prompt)) add(`questions.${index}.promptText`, 'Câu hỏi chưa có nội dung.');
      if (options.length < 2 || options.length > 4) add(`questions.${index}.options`, 'Mỗi câu cần từ 2 đến 4 lựa chọn.');
      unique(options, `questions.${index}.options`);
      if (!options.some((o: any) => o?.id === question?.correctOptionId)) add(`questions.${index}.correctOptionId`, 'Chưa chọn đáp án đúng trong các lựa chọn.');
    });
  } else add('templateKey', 'Mẫu trò chơi chưa được hỗ trợ.');
  return issues;
}
