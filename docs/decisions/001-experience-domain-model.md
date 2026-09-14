# ADR 001: Experience Domain Model & Runtime Decoupling

## Context
The platform supports multiple interactive mediums: videos, WebGL simulations, tactile sorting challenges, and audio narratives. A naive design would couple domain models to specific rendering frameworks (e.g., tying a LearningUnit directly to Three.js scene graphs or React components).

## Decision
1. Core entities (`LearningUnit`, `Experience`, `Lesson`) remain pure, serializable TypeScript interfaces with no runtime UI dependencies.
2. Experiences declare capabilities (`presentationCapabilities`, `studentConfig`) and store parameterized `runtimeConfig`.
3. An `ExperienceRendererRegistry` dynamically maps `experience.type` and `experience.slug` to corresponding React renderer components.

## Consequences
- **Positive**: Learning units and lessons can be serialized into local storage or future cloud APIs cleanly; simulations can be swapped, tested in isolation, or run in headless test environments.
- **Trade-off**: Requires a small runtime dispatcher to resolve the active component.
