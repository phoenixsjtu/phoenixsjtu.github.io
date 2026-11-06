# Homepage design — SimScale reference

## Reference and intent

Reference: https://www.simscale.com/, inspected on 2026-11-06. Adopt the centered technical headline, pale full-width canvas, navy primary action, wide engineering imagery, horizontal category navigation, and grouped content. This is a personal research portfolio with original art, not a SimScale product page. No SimScale logo, customer logos, screenshots, claims, code, or media are included.

## Colors

- Canvas: #f7f8fa
- Content: #ffffff
- Ink / primary action: #111529
- Secondary text: #525969
- Accent / links: #1858e8
- Dividers: #dce0e8
- Document covers: #e4eaf3 / #eef1f5 / #e9eef7; white content surfaces
- Engineering concept: cobalt, cyan, a small warm field highlight; no green.

## Typography

Retain the established system sans stack. Name/role appears in one quiet identity badge. The main heading states the research focus directly.

- Hero: 40–64px desktop, 36–48px mobile; 500 weight, -0.035em tracking.
- Section: 28–40px.
- Card: 20px across all projects.
- Body: 16px.
- Metadata, navigation, controls: 14px.

## Layout

1240px content shell with responsive 40/28/24/20px side padding. Solid navigation, centered hero, original engineering background integrated into the hero, white project section, three-column career history, navy footer. The mobile career history and projects stack.

## Components

Actual Cult UI DirectionAwareTabs, TextureCard and Expandable remain integrated. Category tabs use a moving underline. The populated predictive-maintenance category is selected initially. Image-led project cards use a two-column layout with one column on phones. The paper-linked TPTLN project leads. Its original publication first page is shown above the summary; the remaining projects show typeset excerpts of their actual README/Notebook content. All cover links open the original source, and a caption identifies the source type. No conceptual artwork or unrelated paper is used. The other two research areas keep explicit forthcoming states.

## Motion and rendering

`EngineeringScene.tsx` is an original Three.js conceptual wafer-like field, mesh, and flowing particles. It does not visualize measured data or solve physical equations. There is no detached animation card or fake simulation console.

Rendering is lazy, capped at 30 fps and DPR 1.5. Pause/resume, initial reduced-motion still frame, offscreen/background suspension, context-loss fallback, and resource cleanup are implemented. A CSS fallback also covers lazy loading. Older FluidScene source is retained as an unused design iteration and is excluded from the current bundle.
