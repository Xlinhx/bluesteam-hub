# ADR 003: Presentation as a Contextual Capability, Not a Device Tab

## Context
Conventional education tools often create a top-level "Projector" or "Smartboard" tab that requires teachers to navigate multi-step hardware pairing wizards before displaying content.

## Decision
1. Eliminate "Projector" as a navigation destination or standalone product module.
2. Model Presentation as an intrinsic display capability of any educational experience or active classroom session.
3. Provide two direct entry pathways:
   - `Present`: Instant distraction-free fullscreen on the current display.
   - `Open Presentation Window`: Spawns a clean, independent public window designed for multi-monitor or HDMI-extended setups.
4. Ensure presentation surfaces display zero private teacher notes, rosters, or answers, while offering high-contrast, large-format UI legible from 5 meters away.

## Consequences
- **Positive**: Eliminates friction for teachers; supports single-display, dual-display, and remote screen-sharing workflows seamlessly.
- **Trade-off**: Requires dedicated clean projection layouts for each interactive experience.
