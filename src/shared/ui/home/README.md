# Home motion — BlueSTEAM

Scope: learner Home (`/home`, `/student`) and teacher Home (`/teacher`). Other concepts keep their own motion. Home composes the shared `ui/motion/motionScope` primitive.

## Direction: a current opening the space

The scene contains independent watercolor ribbon and cove planes, drawn current paths, tide contours, a fish school and five edge bubbles. A drawn specimen sits in the copy's negative space so photography cannot occlude it: nautilus for 3D/teacher shore, kelp for resources, fish for games. Category changes cross between those specimens. Existing content, destinations and interactive hit bounds are preserved.

First entrance uses overlapping beats:

- Water unfolds over 2.1–2.4 seconds; currents draw along their own paths. Contours, specimen and fish use distinct sequencing. The complete choreography lasts about 2.7 seconds.
- Learner imagery drifts from the measured copy/art relationship (up to 42px) over 1.8 seconds. The initial heading reveals vertically, description follows, category photographs settle toward the hero, then labels and icons articulate independently. Creative artwork and its label follow at a later beat.
- Teacher shore imagery settles over 1.85 seconds. The workspace heading reveals horizontally; tool photographs, labels and icons follow with separate timings. Creative photography settles over 1.8 seconds. Management controls remain immediately usable.
- Mobile travel is smaller and duration uses 85% of desktop timing. Offscreen artwork stays visible and receives one 650–950ms arrival when scrolled above the bottom navigation. It never replays on scrolling back; reduced motion disconnects the observer, keyboard scrolling stays immediate, and unmount disposes it.

The first-view flag is saved after completion or deliberate interruption; authentication remounts cannot consume an unseen introduction. Returning keeps a 900ms water/photo settlement without replaying the entire heading/tool sequence. Selection has its own storage key.

## Depth and category selection

Fine-pointer movement drives four background planes at different amplitudes and settling speeds (900–1700ms). The pointer rectangle is cached; at most one batched style update occurs per frame, directly on those four planes rather than inheriting variables through all page content. No React frame updates. Pointer leave, keyboard, resize, visibility and reduced-motion reset the depth. Touch has no hover dependency.

The panorama retains three mounted images. Measured thumbnail centers determine pivot, angle and 480–780ms image travel. CSS transitions retarget from the current visual frame. Text and ARIA selection update immediately: headings stay visible throughout their 280ms settlement, supporting copy settles over 240ms. No repeated full text mask. Keyboard selection and keyboard route changes are immediate, including when a destination normally owns its own native transition.

Category photographs zoom within clipped frames; the 3D icon turns in perspective, the book tips open, the game icon tilts and the palette turns inside its stationary label. Hover movement requires a fine pointer. Coarse-pointer presses enlarge only the clipped photograph to 1.035 over 100ms and release over 260ms, without moving touch targets. Keyboard focus keeps its outline and static directional arrow.

## Navigation and interruption

Home listens to the existing cancellable `bluesteam:before-navigate` event. Pointer navigation opens one native View Transition from the actual pressed control, including touch browsers that do not focus buttons. The aperture covers the farthest viewport corner. The old snapshot remains while the destination session gate mounts content, catalog busy states settle and visible images decode, with a bounded 1400ms fallback. New content opens over 920ms; the old scene recedes over 680ms. The header remains stationary.

On coarse-pointer mobile, Home uses lightweight WAAPI arrivals instead of full-resolution native page snapshots. After the same readiness gate, the destination surface settles over 480ms, up to four visible photographs arrive over 800ms with direction measured from the pressed control, and up to two visible headings settle over 280ms. Interactive surface geometry stays fixed. This also avoids a reproducible WebKit renderer crash during native snapshots of authenticated route changes. These arrivals retain the same interruption, reduced-motion and listener cleanup contracts.

The shared dispatcher recognizes Home's existing snapshot and commits within it rather than starting another. A temporary `instant` marker also prevents destination-owned transitions on Home keyboard exits. Back, resize, visibility changes, reduced-motion changes and the first action on the destination immediately skip the old aperture. Snapshot overlays do not intercept pointer events. All readiness observers, timers and navigation/input/media listeners are released after completion, including when Home unmounts inside its own update callback. Returning to Home does not accumulate listeners.

Unsupported View Transitions or WAAPI and blocked Home storage keep the page usable. No autoplay gallery, infinite decoration loop, animated blur or delayed click handler. Reduced motion keeps final artwork, selection and focus without movement.

## Responsive and proof

Desktop Home fills available height. Short windows use a readable minimum height and normal scrolling rather than clipping buttons or overflowing the painted background. Mobile keeps its existing stacked composition and bottom navigation clearance.

Proof: `tests/home_choreography.test.ts`, `tests/home_context_motion.test.ts`, `tests/home_motion_session.test.ts`, `e2e/home-motion.spec.ts`, and `e2e/teacher-home-card-order.spec.ts`. Browser coverage includes first/return entrance, positive and negative reduced-motion checks, rapid category selection, focus, 320px phones and short laptops, touch origin, readiness, Back during transition, first destination interaction, unsupported APIs/storage and repeated exits without listener accumulation. Required project gates remain `npm test`, `npm run validate:visual`, and `npm run build`.

Mobile-specific proof: `npx playwright test --config=playwright.home-mobile.config.ts`, using Chromium/Pixel and WebKit/iPhone emulation. It checks actual positive mobile animation, offscreen one-shot arrival, stationary hit boxes during presses, orientation/narrow widths, reduced motion, snapshot-free navigation and interruption. Engine emulation does not constitute a test on physical phone hardware.
