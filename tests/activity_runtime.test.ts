import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { ActivityRuntime } from '../src/shared/activities/ActivityRuntime';
import {
  ACTIVITY_TEMPLATE_REGISTRY,
  getActivityTemplateDefinition,
} from '../src/shared/activities/registry';

describe('ActivityRuntime & Template Registry Invariants', () => {
  it('registers sorting, matching, choice, scenario, and dedicated simulations with accurate capabilities', () => {
    expect(ACTIVITY_TEMPLATE_REGISTRY.sorting.capabilities.allowsTeacherCreate).toBe(false);
    expect(ACTIVITY_TEMPLATE_REGISTRY.matching.capabilities.allowsTeacherCreate).toBe(false);
    expect(ACTIVITY_TEMPLATE_REGISTRY.choice.capabilities.allowsTeacherCreate).toBe(false);
    expect(ACTIVITY_TEMPLATE_REGISTRY.scenario.capabilities.allowsTeacherCreate).toBe(false);

    // Dedicated simulations do NOT allow arbitrary teacher creation
    expect(ACTIVITY_TEMPLATE_REGISTRY['rescue-mission'].capabilities.allowsTeacherCreate).toBe(
      false,
    );
    expect(ACTIVITY_TEMPLATE_REGISTRY['plastic-journey'].capabilities.allowsTeacherCreate).toBe(
      false,
    );
    expect(ACTIVITY_TEMPLATE_REGISTRY['water-column'].capabilities.allowsTeacherCreate).toBe(
      false,
    );

    expect(() => getActivityTemplateDefinition('unknown-key')).toThrow('Unsupported activity template');
  });


  it('renders SortingGameRuntime, MatchingGameRuntime, ChoiceGameRuntime, and ScenarioRuntime across contexts', () => {
    const onAnswerSpy = vi.fn();

    const sortingHtml = renderToString(
      React.createElement(ActivityRuntime, {
        context: 'standalone',
        activityId: 'act-sort-1',
        title: 'Về đúng nhà',
        templateKey: 'sorting',
        config: {
          templateKey: 'sorting',
          instructionText: 'Đưa bạn về nhà',
          targets: [
            { id: 'zone-sand', label: 'Bờ cát' },
            { id: 'zone-coral', label: 'San hô' },
          ],
          objects: [
            {
              id: 'obj-crab',
              label: 'Cua biển',
              imageUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png',
              acceptedTargetIds: ['zone-sand'],
            },
          ],
        },
      }),
    );

    expect(sortingHtml).toContain('data-testid="sorting-game-runtime"');
    expect(sortingHtml).toContain('data-context="standalone"');
    expect(sortingHtml).toContain('Về đúng nhà');
    expect(sortingHtml).toContain('Cua biển');
    expect(sortingHtml).toContain('Bờ cát');
    expect(onAnswerSpy).not.toHaveBeenCalled();

    const matchingHtml = renderToString(
      React.createElement(ActivityRuntime, {
        context: 'preview',
        activityId: 'act-match-1',
        title: 'Tìm đôi bạn',
        templateKey: 'matching',
        config: {
          templateKey: 'matching',
          instructionText: 'Chạm vào hai hình giống nhau',
          pairs: [
            {
              id: 'pair-1',
              left: { id: 'l1', label: 'Cá hề', imageUrl: '/assets/generated/creatures/clownfish_isolated.png' },
              right: { id: 'r1', label: 'Cá hề cam', imageUrl: '/assets/generated/creatures/clownfish_isolated.png' },
            },
          ],
        },
      }),
    );
    expect(matchingHtml).toContain('data-testid="matching-game-runtime"');
    expect(matchingHtml).toContain('Tìm đôi bạn');

    const choiceHtml = renderToString(
      React.createElement(ActivityRuntime, {
        context: 'room',
        activityId: 'act-choice-1',
        title: 'Chọn con vật',
        templateKey: 'choice',
        config: {
          templateKey: 'choice',
          questions: [
            {
              id: 'q1',
              promptText: 'Đâu là bạn Rùa biển xanh?',
              correctOptionId: 'opt-turtle',
              options: [
                { id: 'opt-turtle', label: 'Rùa biển', imageUrl: '/assets/generated/creatures/turtle_isolated.png' },
                { id: 'opt-crab', label: 'Cua biển', imageUrl: '/assets/generated/r2-cutouts/crab_friendly_cutout.png' },
              ],
            },
          ],
        },
      }),
    );
    expect(choiceHtml).toContain('data-testid="choice-game-runtime"');
    expect(choiceHtml).toContain('Đâu là bạn Rùa biển xanh?');

    const scenarioHtml = renderToString(
      React.createElement(ActivityRuntime, {
        context: 'standalone',
        activityId: 'act-scen-1',
        title: 'Giữ bờ biển sạch',
        templateKey: 'scenario',
        config: {
          templateKey: 'scenario',
          startSceneId: 'scene-1',
          scenes: [
            {
              id: 'scene-1',
              title: '1. Trên bãi biển',
              narrationText: 'Thấy chai nhựa trên cát, bé làm gì?',
              choices: [
                {
                  id: 'c1',
                  label: 'Nhặt rác',
                  imageUrl: '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
                  nextSceneId: 'scene-2',
                  feedbackText: 'Giỏi lắm!',
                },
              ],
            },
            {
              id: 'scene-2',
              title: '2. Bờ biển sạch',
              narrationText: 'Bờ biển đã sạch!',
              isEnd: true,
              choices: [],
            },
          ],
        },
      }),
    );
    expect(scenarioHtml).toContain('data-testid="scenario-runtime"');
    expect(scenarioHtml).toContain('Thấy chai nhựa trên cát, bé làm gì?');
    expect(scenarioHtml).toContain('Nhặt rác');
  });
});
