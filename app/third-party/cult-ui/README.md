# Cult UI sources

The homepage uses actual Cult UI registry component source, downloaded on 2026-11-06. The original registry responses are retained beside this file; SHA-256 hashes and source URLs are recorded in `provenance.json`.

| Source | Local component | Adaptations |
| --- | --- | --- |
| https://www.cult-ui.com/r/direction-aware-tabs.json | `src/components/cult/direction-aware-tabs.tsx` | Accessible tab semantics and keyboard navigation, unique shared-layout IDs, instant interruptible selection, shorter motion, reduced-motion support, light appearance; optional `defaultTabId` so the populated research category opens first. |
| https://www.cult-ui.com/r/expandable.json | `src/components/cult/expandable.tsx` | Damped spring; reduced-motion behavior for content; collapsed content inert and hidden from assistive technology. |
| https://www.cult-ui.com/r/texture-card.json | `src/components/cult/texture-card.tsx` | Upstream source; project-scoped CSS flattens decorative border layers into a single 12px-radius border. |

MIT license: `public/licenses/cult-ui-MIT.txt`, obtained from https://github.com/nolly-studio/cult-ui/blob/main/LICENSE.md. Copyright (c) 2023 Jordan-Gilliam. This notice is included in the static production build.

`FluidScene` is original Three.js shader code; it is not a Cult UI component. The fluid visual is inspired by the linked reference, without using its code or media. It is a procedural visual approximation, not a Navier–Stokes solver.

The SimScale-inspired revision changes tab styling to a moving underline and adds an original `EngineeringScene`; this scene is not supplied by Cult UI.
