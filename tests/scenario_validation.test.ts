import { describe, it, expect } from 'vitest';
import { validateScenarioGraph } from '../src/shared/activities/scenario/validateScenario';
import type { ScenarioActivityConfig } from '../src/shared/activities/types';

describe('Scenario Graph Validator (validateScenarioGraph)', () => {
  const validScenario: ScenarioActivityConfig = {
    templateKey: 'scenario',
    startSceneId: 'scene-1',
    scoringEnabled: true,
    scenes: [
      {
        id: 'scene-1',
        title: '1. Trên bãi biển',
        narrationText: 'Thấy chai nhựa trên cát, bé làm gì?',
        choices: [
          {
            id: 'c1-pickup',
            label: 'Nhặt rác',
            nextSceneId: 'scene-3',
            feedbackText: 'Tuyệt vời!',
            isCorrect: true,
          },
          {
            id: 'c1-leave',
            label: 'Bỏ đi',
            nextSceneId: 'scene-2',
            feedbackText: 'Thử lại nhé!',
            isCorrect: false,
          },
        ],
      },
      {
        id: 'scene-2',
        title: '2. Chọn cách xử lý',
        narrationText: 'Sóng sắp cuốn chai nhựa ra biển rồi!',
        choices: [
          {
            id: 'c2-pickup',
            label: 'Bỏ vào thùng',
            nextSceneId: 'scene-3',
            feedbackText: 'Đúng rồi!',
            isCorrect: true,
          },
        ],
      },
      {
        id: 'scene-3',
        title: '3. Bờ biển sạch',
        narrationText: 'Bãi biển đã sạch tinh tươm!',
        isEnd: true,
        choices: [],
      },
    ],
  };

  it('accepts a valid acyclic scenario graph with reachable terminal scene', () => {
    const res = validateScenarioGraph(validScenario);
    expect(res.valid).toBe(true);
    expect(res.issues).toEqual([]);
    expect(res.reachableSceneIds).toEqual(['scene-1', 'scene-3', 'scene-2']);
    expect(res.terminalSceneIds).toEqual(['scene-3']);
  });

  it('rejects a scenario graph containing a cycle (CYCLE_DETECTED)', () => {
    const cyclicScenario: ScenarioActivityConfig = {
      ...validScenario,
      scenes: [
        {
          id: 'scene-1',
          title: 'Cảnh 1',
          choices: [{ id: 'c1', label: 'Sang cảnh 2', nextSceneId: 'scene-2', feedbackText: 'OK' }],
        },
        {
          id: 'scene-2',
          title: 'Cảnh 2',
          choices: [
            { id: 'c2-loop', label: 'Quay lại cảnh 1', nextSceneId: 'scene-1', feedbackText: 'Loop' },
            { id: 'c2-end', label: 'Tới cảnh 3', nextSceneId: 'scene-3', feedbackText: 'End' },
          ],
        },
        {
          id: 'scene-3',
          title: 'Cảnh 3',
          isEnd: true,
          choices: [],
        },
      ],
    };

    const res = validateScenarioGraph(cyclicScenario);
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.code === 'CYCLE_DETECTED')).toBe(true);
  });

  it('rejects orphan scenes not reachable from startSceneId (ORPHAN_SCENE)', () => {
    const orphanScenario: ScenarioActivityConfig = {
      ...validScenario,
      scenes: [
        ...validScenario.scenes,
        {
          id: 'scene-orphan',
          title: 'Cảnh bị cô lập',
          isEnd: true,
          choices: [],
        },
      ],
    };

    const res = validateScenarioGraph(orphanScenario);
    expect(res.valid).toBe(false);
    expect(
      res.issues.some((i) => i.code === 'ORPHAN_SCENE' && i.sceneId === 'scene-orphan'),
    ).toBe(true);
  });

  it('rejects non-terminal scenes with zero choices (DEAD_END_SCENE)', () => {
    const deadEndScenario: ScenarioActivityConfig = {
      ...validScenario,
      scenes: [
        {
          id: 'scene-1',
          title: 'Cảnh 1',
          choices: [{ id: 'c1', label: 'Đi tiếp', nextSceneId: 'scene-2', feedbackText: 'OK' }],
        },
        {
          id: 'scene-2',
          title: 'Cảnh cụt chưa đánh dấu kết thúc',
          isEnd: false,
          choices: [],
        },
      ],
    };

    const res = validateScenarioGraph(deadEndScenario);
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.code === 'DEAD_END_SCENE' && i.sceneId === 'scene-2')).toBe(
      true,
    );
  });

  it('rejects choices with missing or nonexistent nextSceneId (MISSING_NEXT_SCENE / MISSING_TARGET_SCENE)', () => {
    const brokenBranchScenario: ScenarioActivityConfig = {
      ...validScenario,
      scenes: [
        {
          id: 'scene-1',
          title: 'Cảnh 1',
          choices: [
            { id: 'c1-empty', label: 'Chưa gắn nhánh', nextSceneId: null, feedbackText: 'OK' },
            {
              id: 'c1-ghost',
              label: 'Trỏ tới cảnh ma',
              nextSceneId: 'scene-999',
              feedbackText: 'OK',
            },
          ],
        },
      ],
    };

    const res = validateScenarioGraph(brokenBranchScenario);
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.code === 'MISSING_NEXT_SCENE')).toBe(true);
    expect(res.issues.some((i) => i.code === 'MISSING_TARGET_SCENE')).toBe(true);
  });
});
