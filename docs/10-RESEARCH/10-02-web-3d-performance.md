# Research Note: WebGL & 3D Performance Architecture

## Performance Guardrails
1. **Lazy Loading Boundaries**: Never initialize heavy WebGL contexts or load 3D assets on non-interactive pages (such as the Teacher Library or Class Roster). Three.js canvas instances are isolated inside lazy-loaded modules.
2. **Progressive Landing Delivery**:
   - First Paint: Semantic HTML, typography, and crisp CSS gradient poster.
   - Second Stage: Core UI interactivity and navigation.
   - Third Stage: Three.js initialization and procedural PBR whale geometry generation.
   - Fourth Stage: Environmental caustics and atmospheric particles.
3. **Adaptive DPR & Throttling**:
   - Limit `devicePixelRatio` to `Math.min(window.devicePixelRatio, 2)` to avoid extreme GPU fill-rate exhaustion on mobile retina screens.
   - Use `IntersectionObserver` to pause animation frame loops whenever the 3D canvas is outside the active viewport.
4. **Accessible Reduced-Motion Fallback**:
   - Respect `window.matchMedia('(prefers-reduced-motion: reduce)')`.
   - In reduced motion mode, disable continuous swimming cameras and rapid particle fields, replacing them with a poised, graceful static 3D composition or cinematic still exhibit.
