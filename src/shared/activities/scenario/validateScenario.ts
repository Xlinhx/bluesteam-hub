import type { ScenarioActivityConfig, ScenarioSceneNode } from '../types';

export type ScenarioValidationCode =
  | 'EMPTY_SCENES'
  | 'MISSING_START_SCENE'
  | 'INVALID_START_SCENE'
  | 'DUPLICATE_SCENE_ID'
  | 'DEAD_END_SCENE'
  | 'MISSING_NEXT_SCENE'
  | 'MISSING_TARGET_SCENE'
  | 'CYCLE_DETECTED'
  | 'ORPHAN_SCENE'
  | 'NO_TERMINAL_SCENE';

export interface ScenarioValidationIssue {
  code: ScenarioValidationCode;
  message: string;
  sceneId?: string;
  choiceId?: string;
  cyclePath?: string[];
}

export interface ScenarioValidationResult {
  valid: boolean;
  issues: ScenarioValidationIssue[];
  errors: ScenarioValidationIssue[];
  reachableSceneIds: string[];
  terminalSceneIds: string[];
}

export function isTerminalScene(scene: ScenarioSceneNode): boolean {
  return Boolean(scene.isEnd || scene.isTerminal || (scene as any).isEnding);
}

export function validateScenarioGraph(
  rawConfig: Partial<ScenarioActivityConfig> | Record<string, unknown> | null | undefined,
): ScenarioValidationResult {
  const issues: ScenarioValidationIssue[] = [];
  const scenesRaw = Array.isArray((rawConfig as any)?.scenes)
    ? ((rawConfig as any).scenes as ScenarioSceneNode[])
    : [];
  const startSceneId =
    typeof (rawConfig as any)?.startSceneId === 'string'
      ? (rawConfig as any).startSceneId.trim()
      : '';

  if (scenesRaw.length === 0) {
    issues.push({
      code: 'EMPTY_SCENES',
      message: 'Tình huống phải có ít nhất 1 cảnh.',
    });
    return {
      valid: false,
      issues,
      errors: issues,
      reachableSceneIds: [],
      terminalSceneIds: [],
    };
  }

  if (!startSceneId) {
    issues.push({
      code: 'MISSING_START_SCENE',
      message: 'Chưa chọn cảnh mở đầu (startSceneId).',
    });
  }

  const sceneMap = new Map<string, ScenarioSceneNode>();
  for (const scene of scenesRaw) {
    const id = (scene?.id || '').trim();
    if (!id) continue;
    if (sceneMap.has(id)) {
      issues.push({
        code: 'DUPLICATE_SCENE_ID',
        sceneId: id,
        message: `Mã cảnh "${id}" bị trùng lặp.`,
      });
    } else {
      sceneMap.set(id, scene);
    }
  }

  if (startSceneId && !sceneMap.has(startSceneId)) {
    issues.push({
      code: 'INVALID_START_SCENE',
      sceneId: startSceneId,
      message: `Cảnh mở đầu "${startSceneId}" không tồn tại trong danh sách cảnh.`,
    });
  }

  const terminalSceneIds: string[] = [];

  for (const scene of sceneMap.values()) {
    const terminal = isTerminalScene(scene);
    const choices = Array.isArray(scene.choices) ? scene.choices : [];

    if (terminal) {
      terminalSceneIds.push(scene.id);
      continue;
    }

    if (choices.length === 0) {
      issues.push({
        code: 'DEAD_END_SCENE',
        sceneId: scene.id,
        message: `Cảnh "${scene.title || scene.id}" chưa phải cảnh kết thúc nhưng không có lựa chọn nào (cảnh cụt).`,
      });
      continue;
    }

    for (const choice of choices) {
      const nextId = typeof choice.nextSceneId === 'string' ? choice.nextSceneId.trim() : '';
      if (!nextId) {
        issues.push({
          code: 'MISSING_NEXT_SCENE',
          sceneId: scene.id,
          choiceId: choice.id,
          message: `Lựa chọn "${choice.label || choice.id}" tại cảnh "${scene.title || scene.id}" chưa gắn nhánh cảnh tiếp theo.`,
        });
      } else if (!sceneMap.has(nextId)) {
        issues.push({
          code: 'MISSING_TARGET_SCENE',
          sceneId: scene.id,
          choiceId: choice.id,
          message: `Lựa chọn "${choice.label || choice.id}" trỏ tới cảnh không tồn tại "${nextId}".`,
        });
      }
    }
  }

  // DFS from startSceneId (and all nodes for cycle detection)
  const reachable = new Set<string>();
  const color = new Map<string, 0 | 1 | 2>(); // 0 = unvisited, 1 = visiting (gray), 2 = visited (black)
  const activeStack: string[] = [];
  const reportedCycles = new Set<string>();

  const dfs = (nodeId: string, markReachable: boolean) => {
    if (markReachable) {
      reachable.add(nodeId);
    }
    color.set(nodeId, 1);
    activeStack.push(nodeId);

    const scene = sceneMap.get(nodeId);
    const choices = scene && !isTerminalScene(scene) && Array.isArray(scene.choices) ? scene.choices : [];

    for (const choice of choices) {
      const nextId = typeof choice.nextSceneId === 'string' ? choice.nextSceneId.trim() : '';
      if (!nextId || !sceneMap.has(nextId)) continue;

      if (markReachable) {
        reachable.add(nextId);
      }

      const nextState = color.get(nextId) ?? 0;
      if (nextState === 1) {
        const cycleStartIdx = activeStack.indexOf(nextId);
        const cyclePath =
          cycleStartIdx >= 0 ? [...activeStack.slice(cycleStartIdx), nextId] : [nodeId, nextId];
        const cycleKey = cyclePath.join('->');
        if (!reportedCycles.has(cycleKey)) {
          reportedCycles.add(cycleKey);
          issues.push({
            code: 'CYCLE_DETECTED',
            sceneId: nodeId,
            choiceId: choice.id,
            cyclePath,
            message: `Phát hiện vòng lặp vô hạn giữa các cảnh: ${cyclePath.join(' → ')}.`,
          });
        }
      } else if (nextState === 0) {
        dfs(nextId, markReachable);
      } else if (markReachable) {
        // Already visited (2) from an un-marked pass? Ensure all descendants are marked reachable
        const markSubtree = (subId: string) => {
          if (reachable.has(subId)) return;
          reachable.add(subId);
          const subScene = sceneMap.get(subId);
          if (!subScene || isTerminalScene(subScene)) return;
          for (const ch of subScene.choices || []) {
            const target = typeof ch.nextSceneId === 'string' ? ch.nextSceneId.trim() : '';
            if (target && sceneMap.has(target)) markSubtree(target);
          }
        };
        markSubtree(nextId);
      }
    }

    activeStack.pop();
    color.set(nodeId, 2);
  };

  if (startSceneId && sceneMap.has(startSceneId)) {
    dfs(startSceneId, true);
  }

  // Also check cycles in any disconnected components
  for (const sceneId of sceneMap.keys()) {
    if ((color.get(sceneId) ?? 0) === 0) {
      dfs(sceneId, false);
    }
  }

  // Detect orphan scenes (not reachable from startSceneId)
  if (startSceneId && sceneMap.has(startSceneId)) {
    for (const scene of sceneMap.values()) {
      if (!reachable.has(scene.id)) {
        issues.push({
          code: 'ORPHAN_SCENE',
          sceneId: scene.id,
          message: `Cảnh "${scene.title || scene.id}" bị cô lập (không có nhánh nào dẫn tới từ cảnh mở đầu).`,
        });
      }
    }
  }

  const reachableTerminals = terminalSceneIds.filter((id) => reachable.has(id));
  if (startSceneId && sceneMap.has(startSceneId) && reachableTerminals.length === 0) {
    issues.push({
      code: 'NO_TERMINAL_SCENE',
      message: 'Tình huống chưa có cảnh kết thúc nào có thể đi tới từ cảnh mở đầu.',
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    errors: issues,
    reachableSceneIds: Array.from(reachable),
    terminalSceneIds,
  };
}
