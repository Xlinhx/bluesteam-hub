/** Interpretations of recorded behavior, never a learner assessment. */
export interface UsageAnswerCount { id: string; label: string; count: number }
export interface GameUsageItem {
  id: string; label: string; imageUrl?: string; answeredRuns: number; firstIncorrectRuns: number; answers: UsageAnswerCount[];
}
export interface UsageChoiceSection { id: string; label: string; answeredRuns: number; choices: UsageAnswerCount[] }
export type UsageAnalysis = { definitionVersion: 1 } & (
  | { type: 'game_first_answer'; mechanic: 'sorting' | 'matching' | 'choice'; items: GameUsageItem[] }
  | { type: 'simulation_steps'; interactedRuns: number; steps: Array<{ id: string; label: string; visitedRuns: number }> }
  | { type: 'simulation_choices'; steps: UsageChoiceSection[] }
  | { type: 'scenario_choices'; scenes: UsageChoiceSection[] }
  | { type: 'model_opens'; daily: Array<{ localDate: string; opens: number | null }>; interactionStatus: 'not_collected' }
);
