import type { UsageAnalysis, UsageKind, UsagePayload, UsageChoiceSection, UsageAnswerCount } from '@bluesteam/contracts';

export interface UsageAnalysisSnapshot {
  kind: string; templateKey?: string; config?: Record<string, any>;
  runtimeDefinition?: { version: number; steps: Array<{ id: string; label: string; choices?: Array<{ id: string; label: string }> }> };
}
export interface UsageAnalysisEvent {
  id: string; receivedAt: string; runId: string; itemId: string; payload: UsagePayload;
  result: { label: string; correct?: boolean; choiceLabel?: string }; snapshot: UsageAnalysisSnapshot;
}
export interface UsageAnalysisInput {
  kind: UsageKind; snapshot?: UsageAnalysisSnapshot; events: UsageAnalysisEvent[];
  daily?: Array<{ localDate: string; opens: number | null }>;
}

/** First RECEIVED event of the requested type; a visit must not consume a choice. */
function firstEvents(events: UsageAnalysisEvent[], type: UsagePayload['type']) {
  const seen = new Set<string>();
  return events.filter(event => event.payload.type === type)
    .sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime() || a.id.localeCompare(b.id))
    .filter(event => { const key = `${event.runId}:${event.itemId}`; if (seen.has(key)) return false; seen.add(key); return true; });
}
function counts(options: Array<{ id: string; label?: string }>): UsageAnswerCount[] {
  return options.map(option => ({ id: option.id, label: option.label || option.id, count: 0 }));
}

export function buildUsageAnalysis({ kind, snapshot, events, daily = [] }: UsageAnalysisInput): UsageAnalysis | null {
  if (kind === 'model3d') return { type: 'model_opens', definitionVersion: 1, daily, interactionStatus: 'not_collected' };
  if (!snapshot) return null;
  const config = snapshot.config || {};
  const template = snapshot.templateKey;
  if (kind === 'game' && (template === 'sorting' || template === 'matching' || template === 'choice')) {
    const source: any[] = template === 'sorting' ? config.objects || config.items || [] : template === 'matching' ? config.pairs || [] : config.questions || [];
    const first = firstEvents(events, 'game_answer');
    const items = source.map(item => {
      const itemEvents = first.filter(event => event.itemId === item.id);
      const options = template === 'sorting' ? config.targets || config.zones || [] : template === 'matching'
        ? source.map(pair => ({ id: pair.id, label: pair.right?.label || pair.rightLabel || pair.leftLabel || pair.id })) : item.options || [];
      const answers = counts(options);
      for (const event of itemEvents) {
        if (event.payload.type !== 'game_answer') continue;
        const answerId = event.payload.answerId;
        const answer = answers.find(option => option.id === answerId);
        if (answer) answer.count++;
      }
      return { id: item.id, label: template === 'matching' ? item.left?.label || item.leftLabel || item.id : item.label || item.promptText || item.prompt || item.id,
        imageUrl: item.imageUrl || item.left?.imageUrl || item.leftImageUrl,
        answeredRuns: itemEvents.length, firstIncorrectRuns: itemEvents.filter(event => event.result.correct === false).length, answers };
    });
    return { type: 'game_first_answer', definitionVersion: 1, mechanic: template, items };
  }
  if (kind === 'scenario') {
    const first = firstEvents(events, 'scenario_choice');
    const scenes = (config.scenes || []).filter((scene: any) => scene.choices?.length).map((scene: any): UsageChoiceSection => {
      const answers = first.filter(event => event.itemId === scene.id);
      const choices = counts(scene.choices);
      for (const event of answers) if (event.payload.type === 'scenario_choice') {
        const choiceId = event.payload.choiceId;
        const choice = choices.find(option => option.id === choiceId); if (choice) choice.count++;
      }
      return { id: scene.id, label: scene.promptText || scene.prompt || scene.title || scene.id, answeredRuns: answers.length, choices };
    });
    return { type: 'scenario_choices', definitionVersion: 1, scenes };
  }
  if (kind === 'simulation' && snapshot.runtimeDefinition) {
    const definition = snapshot.runtimeDefinition;
    if (definition.steps.some(step => step.choices?.length)) {
      const first = firstEvents(events, 'simulation_choice');
      const steps = definition.steps.filter(step => step.choices?.length).map(step => {
        const answers = first.filter(event => event.itemId === step.id);
        const choices = counts(step.choices || []);
        for (const event of answers) if (event.payload.type === 'simulation_choice') {
          const choiceId = event.payload.choiceId;
          const choice = choices.find(option => option.id === choiceId); if (choice) choice.count++;
        }
        return { id: step.id, label: step.label, answeredRuns: answers.length, choices };
      });
      return { type: 'simulation_choices', definitionVersion: 1, steps };
    }
    const first = firstEvents(events, 'simulation_step');
    return { type: 'simulation_steps', definitionVersion: 1, interactedRuns: new Set(first.map(event => event.runId)).size,
      steps: definition.steps.map(step => ({ id: step.id, label: step.label, visitedRuns: first.filter(event => event.itemId === step.id).length })) };
  }
  return null;
}
