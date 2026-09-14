# ADR 002: Local Demo Transport via Encapsulated BroadcastChannel

## Context
Demonstrating synchronized classroom experiences (Teacher Console -> Student View -> Public Presentation Surface) typically requires a live WebSocket server. However, adding server infrastructure introduces deployment friction and external dependencies for local evaluation.

## Decision
1. Implement client-side multi-tab synchronization using the browser's native `BroadcastChannel` API.
2. Encapsulate all communication behind a `SessionTransport` interface (`connect`, `disconnect`, `send`, `subscribe`).
3. Enforce strict loop prevention with unique tab-generated `sourceId` tracking.
4. Restrict messages to high-level semantic commands and throttled state snapshots rather than 60 FPS continuous telemetry.

## Consequences
- **Positive**: Complete multi-tab teacher/student/projector sync works out-of-the-box in any modern browser without network servers.
- **Trade-off**: Communication is constrained to the same origin; migrating to cross-device production requires providing a `WebSocketTransport` implementation of the existing interface.
