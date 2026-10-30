import type { UsageAnalysis as Analysis } from '@bluesteam/contracts';
import { GameUsageAnalysis } from './analysis/GameUsageAnalysis';
import { SimulationUsageAnalysis } from './analysis/SimulationUsageAnalysis';
import { ScenarioUsageAnalysis } from './analysis/ScenarioUsageAnalysis';
import { ModelUsageAnalysis } from './analysis/ModelUsageAnalysis';
export function UsageAnalysis({ analysis }: { analysis: Analysis }) {
  switch(analysis.type){
    case 'game_first_answer':return <GameUsageAnalysis analysis={analysis}/>;
    case 'simulation_steps':case 'simulation_choices':return <SimulationUsageAnalysis analysis={analysis}/>;
    case 'scenario_choices':return <ScenarioUsageAnalysis analysis={analysis}/>;
    case 'model_opens':return <ModelUsageAnalysis analysis={analysis}/>;
  }
}